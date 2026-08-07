import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { clearDatabase, disconnectDb } from "./setup";

const originalEnv = { ...process.env };

async function loadJwt() {
  vi.resetModules();
  const mod = await import("../config/jwt");
  return mod;
}

describe("SEC-05 — JWT secrets fail fast in production", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(async () => {
    process.env = { ...originalEnv };
    await disconnectDb();
  });

  it("throws at load in production when secrets are missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    await expect(loadJwt()).rejects.toThrow(/Missing required env var/);
  });

  it("throws at load in production when a known insecure default is used", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_ACCESS_SECRET = "dev-access-secret-change-me";
    process.env.JWT_REFRESH_SECRET = "a-very-long-strong-refresh-secret-32b";
    await expect(loadJwt()).rejects.toThrow(/known dev defaults/);
  });

  it("throws at load in production when a secret is too short", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_ACCESS_SECRET = "short-secret";
    process.env.JWT_REFRESH_SECRET = "also-short";
    await expect(loadJwt()).rejects.toThrow(/at least 32 characters/);
  });

  it("loads in production with strong secrets", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_ACCESS_SECRET = "access-secret-with-more-than-32-chars!!";
    process.env.JWT_REFRESH_SECRET = "refresh-secret-with-more-than-32-chars!!";
    const mod = await loadJwt();
    const token = mod.generateAccessToken({
      userId: "u1",
      role: "ADMIN",
      saccoId: "s1",
    });
    const payload = mod.verifyAccessToken(token);
    expect(payload.userId).toBe("u1");
  });

  it("falls back to dev defaults outside production", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_SECRET;
    const mod = await loadJwt();
    const token = mod.generateAccessToken({ userId: "u1", role: "MEMBER" });
    expect(mod.verifyAccessToken(token).userId).toBe("u1");
  });
});
