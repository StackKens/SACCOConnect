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
});
