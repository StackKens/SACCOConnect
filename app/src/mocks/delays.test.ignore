import { describe, it, expect, afterEach } from "vitest";
import { delay, randomDelay } from "./delays";
import { setScenario, clearScenarios, getScenario } from "./scenarios";

describe("mock delays", () => {
  it("resolves after the requested ms", async () => {
    const start = Date.now();
    await delay(30);
    expect(Date.now() - start).toBeGreaterThanOrEqual(25);
  });

  it("resolves immediately for 0", async () => {
    const start = Date.now();
    await delay(0);
    expect(Date.now() - start).toBeLessThan(20);
  });

  it("randomDelay stays within bounds", async () => {
    process.env.MOCK_DELAY = "1";
    const start = Date.now();
    await randomDelay({ minMs: 20, maxMs: 60 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(15);
    expect(elapsed).toBeLessThan(200);
  });

  it("randomDelay is a no-op when MOCK_DELAY=0", async () => {
    process.env.MOCK_DELAY = "0";
    const start = Date.now();
    await randomDelay({ minMs: 50, maxMs: 100 });
    expect(Date.now() - start).toBeLessThan(30);
  });
});

describe("mock scenarios", () => {
  afterEach(() => {
    clearScenarios();
    delete process.env.MOCK_DELAY;
  });

  it("stores and retrieves a scenario by method+path", () => {
    setScenario("GET", "/api/loans/my", {
      type: "error",
      status: 401,
      message: "Token expired",
    });
    expect(getScenario("GET", "/api/loans/my")).toEqual({
      type: "error",
      status: 401,
      message: "Token expired",
    });
    expect(getScenario("POST", "/api/loans/my")).toBeUndefined();
  });

  it("clears a scenario when set to null", () => {
    setScenario("GET", "/api/loans/my", { type: "empty" });
    setScenario("GET", "/api/loans/my", null);
    expect(getScenario("GET", "/api/loans/my")).toBeUndefined();
  });

  it("clearScenarios wipes all overrides", () => {
    setScenario("GET", "/a", { type: "error", status: 500, message: "x" });
    setScenario("POST", "/b", { type: "empty" });
    clearScenarios();
    expect(getScenario("GET", "/a")).toBeUndefined();
    expect(getScenario("POST", "/b")).toBeUndefined();
  });
});
