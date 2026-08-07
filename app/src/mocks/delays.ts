/**
 * Simulated network latency for the mock API layer.
 * Kept free of React Native imports so it can run in unit tests.
 */

export interface DelayOptions {
  minMs?: number;
  maxMs?: number;
  /** Set to 0 to disable simulated latency (e.g. CI). */
  enabled?: boolean;
}

function isEnabled(): boolean {
  if (process.env.MOCK_DELAY === "0") return false;
  return true;
}

export async function delay(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Random latency in [minMs, maxMs]. Defaults to a realistic 150–600ms. */
export async function randomDelay(
  options: DelayOptions = {},
): Promise<void> {
  if (!isEnabled()) return;
  const minMs = options.minMs ?? 150;
  const maxMs = options.maxMs ?? 600;
  const ms = Math.floor(minMs + Math.random() * (maxMs - minMs));
  await delay(ms);
}
