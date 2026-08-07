import { describe, it, expect, beforeEach } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import { mockAxiosAdapter } from "./api.mock";
import { clearScenarios, setScenario } from "../mocks/scenarios";

function cfg(
  url: string,
  method = "get",
  data?: unknown,
  token?: string,
): InternalAxiosRequestConfig {
  return {
    url,
    method,
    data,
    headers: { Authorization: token ? `Bearer ${token}` : undefined } as InternalAxiosRequestConfig["headers"],
  } as InternalAxiosRequestConfig;
}

describe("mockAxiosAdapter", () => {
  beforeEach(() => {
    clearScenarios();
  });

  it("returns axios-shaped success responses", async () => {
    const res = await mockAxiosAdapter(cfg("/api/members/me", "get", undefined, "mock_token_user_admin_001"));
    expect(res.status).toBe(200);
    expect(res.statusText).toBe("OK");
    expect(res.data).toHaveProperty("success", true);
    expect(res.data.data.fullName).toBe("Daniel Ssekandi");
  });

  it("routes the member role for a plain member token", async () => {
    const res = await mockAxiosAdapter(cfg("/api/members/me", "get", undefined, "mock_token_alice"));
    expect(res.data.data.fullName).toBe("Alice Wanjiku");
  });

  it("returns loans scoped to the member", async () => {
    const res = await mockAxiosAdapter(cfg("/api/loans/my", "get", undefined, "mock_token_alice"));
    expect(res.data.data).toHaveLength(1);
    expect(res.data.data[0].status).toBe("ACTIVE");
  });

  it("serves admin aggregate endpoints", async () => {
    const treasury = await mockAxiosAdapter(cfg("/api/contributions/treasury"));
    expect(treasury.status).toBe(200);
    expect(treasury.data.data.totalSavings).toBeGreaterThan(0);

    const queue = await mockAxiosAdapter(cfg("/api/loans/queue"));
    expect(queue.data.data.length).toBeGreaterThan(0);
  });

  it("honors error scenarios by throwing axios-style errors", async () => {
    setScenario("GET", "/api/loans/my", { type: "error", status: 401, message: "Token expired" });
    await expect(mockAxiosAdapter(cfg("/api/loans/my"))).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 401, data: { success: false, message: "Token expired" } },
    });
  });

  it("honors empty scenarios", async () => {
    setScenario("GET", "/api/announcements", { type: "empty" });
    const res = await mockAxiosAdapter(cfg("/api/announcements"));
    expect(res.data.data).toEqual([]);
  });

  it("throws axios-style errors for unknown endpoints", async () => {
    await expect(mockAxiosAdapter(cfg("/api/does/not/exist"))).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 404 },
    });
  });

  it("registers an admin (create SACCO)", async () => {
    const res = await mockAxiosAdapter(
      cfg("/api/auth/register/admin", "post", {
        fullName: "Test Admin",
        phoneNumber: "0700999999",
        saccoName: "My SACCO",
      }),
    );
    expect(res.status).toBe(201);
    expect(res.data.data.user.role).toBe("ADMIN");
    expect(res.data.data.sacco.name).toBe("My SACCO");
  });

  it("registers a member with a valid invite code", async () => {
    const res = await mockAxiosAdapter(
      cfg("/api/auth/register/member", "post", {
        fullName: "New Member",
        phoneNumber: "0700888888",
        inviteCode: "UNITY6",
      }),
    );
    expect(res.status).toBe(201);
    expect(res.data.data.user.role).toBe("MEMBER");
    expect(res.data.data.sacco.inviteCode).toBe("UNITY6");
  });

  it("rejects a member registration with a bad invite code", async () => {
    await expect(
      mockAxiosAdapter(
        cfg("/api/auth/register/member", "post", {
          fullName: "Bad",
          phoneNumber: "0700777777",
          inviteCode: "WRONG1",
        }),
      ),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it("returns invite preview for a valid code and 404 otherwise", async () => {
    const ok = await mockAxiosAdapter(cfg("/api/auth/invite/UNITY6"));
    expect(ok.data.data.inviteCode).toBe("UNITY6");
    expect(ok.data.data.adminName).toBe("Daniel Ssekandi");

    await expect(mockAxiosAdapter(cfg("/api/auth/invite/BOGUS"))).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it("refreshes an access token from a mock refresh token", async () => {
    const res = await mockAxiosAdapter(
      cfg("/api/auth/refresh", "post", { token: "mock_token_alice" }),
    );
    expect(res.status).toBe(200);
    expect((res.data.data as any).accessToken).toMatch(/^mock_token_refreshed_/);
  });

  it("rejects a refresh with a non-mock token", async () => {
    await expect(
      mockAxiosAdapter(cfg("/api/auth/refresh", "post", { token: "garbage" })),
    ).rejects.toMatchObject({ response: { status: 401 } });
  });

  it("logs out successfully", async () => {
    const res = await mockAxiosAdapter(
      cfg("/api/auth/logout", "post", { token: "mock_token_alice" }),
    );
    expect(res.status).toBe(200);
    expect((res.data.data as any).message).toBe("Logged out");
  });
});
