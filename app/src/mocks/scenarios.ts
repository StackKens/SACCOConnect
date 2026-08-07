/**
 * Scenario injection for the mock API layer.
 * Lets developers and tests simulate failures (401/403/500, empty data,
 * expired tokens) without touching real servers.
 */

export type MockScenario =
  | { type: "error"; status: number; message: string }
  | { type: "empty"; message?: string };

/** Per-endpoint scenario overrides, keyed by HTTP method + path. */
const scenarios = new Map<string, MockScenario>();

function key(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

/** Force a scenario for a given endpoint, e.g. setScenario("GET", "/api/loans/my", { type: "error", status: 401, message: "Token expired" }). */
export function setScenario(
  method: string,
  path: string,
  scenario: MockScenario | null,
): void {
  if (scenario === null) {
    scenarios.delete(key(method, path));
    return;
  }
  scenarios.set(key(method, path), scenario);
}

/** Reset all injected scenarios. */
export function clearScenarios(): void {
  scenarios.clear();
}

export function getScenario(
  method: string,
  path: string,
): MockScenario | undefined {
  return scenarios.get(key(method, path));
}
