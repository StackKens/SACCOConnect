import { createMMKV } from "react-native-mmkv";

const cache = createMMKV({ id: "api_cache" });

export function getCached<T>(key: string): T | null {
  const raw = cache.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCached(key: string, data: unknown): void {
  cache.set(key, JSON.stringify(data));
}

export function clearCached(key: string): void {
  cache.delete(key);
}

export function clearAllCache(): void {
  cache.clearAll();
}
