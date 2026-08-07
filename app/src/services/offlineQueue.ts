import NetInfo from "@react-native-community/netinfo";
import { api } from "./api";
import { getSecureStorage } from "./secureStorage";

const storage = getSecureStorage("offline_queue");

export interface QueuedAction {
  id: string;
  endpoint: string;
  method: "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  timestamp: number;
}

function loadQueue(): QueuedAction[] {
  const raw = storage.getString("queue");
  return raw ? JSON.parse(raw) : [];
}

function saveQueue(queue: QueuedAction[]): void {
  storage.set("queue", JSON.stringify(queue));
}

export function enqueue(action: Omit<QueuedAction, "id" | "timestamp">): void {
  const queue = loadQueue();
  // deduplicate — if same endpoint+body already queued, skip
  const isDuplicate = queue.some(
    (q) =>
      q.endpoint === action.endpoint &&
      JSON.stringify(q.body) === JSON.stringify(action.body),
  );
  if (isDuplicate) return;

  queue.push({
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function getQueueLength(): number {
  return loadQueue().length;
}

export async function flushQueue(): Promise<{
  success: number;
  failed: number;
}> {
  const queue = loadQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

  let success = 0;
  let failed = 0;
  const remaining: QueuedAction[] = [];

  for (const action of queue) {
    try {
      if (action.method === "POST")
        await api.post(action.endpoint, action.body);
      else if (action.method === "PATCH")
        await api.patch(action.endpoint, action.body);
      else if (action.method === "DELETE") await api.delete(action.endpoint);
      success++;
    } catch {
      // keep failed items younger than 24h in the queue to avoid stale data
      const age = Date.now() - action.timestamp;
      if (age < 24 * 60 * 60 * 1000) {
        remaining.push(action);
      }
      failed++;
    }
  }

  saveQueue(remaining);
  return { success, failed };
}

// Listen for network reconnection and auto-flush
let unsubscribe: (() => void) | null = null;

export function startQueueListener(): void {
  if (unsubscribe) return;
  unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      flushQueue();
    }
  });
}

export function stopQueueListener(): void {
  unsubscribe?.();
  unsubscribe = null;
}
