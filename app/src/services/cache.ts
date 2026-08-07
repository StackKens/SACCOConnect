import { getSecureStorage } from "./secureStorage";

const cache = getSecureStorage("api_cache");

interface CacheEntry<T> {
  data: T;
  ts: number;
}

export function getCached<T>(key: string): T | null {
  const raw = cache.getString(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CacheEntry<T> | T;
    // Old format stored the payload directly; new format wraps with a timestamp.
    if (parsed && typeof parsed === "object" && "data" in parsed && "ts" in parsed) {
      return (parsed as CacheEntry<T>).data;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

export function getCacheAge(key: string): number | null {
  const raw = cache.getString(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CacheEntry<unknown>;
    if (parsed && typeof parsed === "object" && "ts" in parsed) {
      return Date.now() - parsed.ts;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCached(key: string, data: unknown): void {
  const entry: CacheEntry<unknown> = { data, ts: Date.now() };
  cache.set(key, JSON.stringify(entry));
}

export function clearCached(key: string): void {
  cache.delete(key);
}

export function clearAllCache(): void {
  cache.clearAll();
}
