import { useSyncExternalStore } from "react";
import { getQueueLength, subscribeQueue } from "../services/offlineQueue";

export function useQueueLength(): number {
  return useSyncExternalStore(subscribeQueue, getQueueLength);
}
