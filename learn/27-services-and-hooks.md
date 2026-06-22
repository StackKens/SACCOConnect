# Services — API, Auth, and Offline Queue

---

## app/src/services/api.ts — The Axios Instance

```tsx
const defaultBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://127.0.0.1:3000");
```

Three fallbacks for the base URL:
1. Environment variable (`EXPO_PUBLIC_API_URL`) — used in production
2. `app.json` extra config — alternative config method
3. Platform-specific localhost — `10.0.2.2` is Android emulator's way to reach the host machine's localhost; iOS uses `127.0.0.1`

### The Request Interceptor

```tsx
api.interceptors.request.use((config) => {
  const token = tokenStorage.getString("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Every API call automatically gets the JWT token attached. You don't have to pass it manually to every `api.get()` or `api.post()`. This is the **Interceptor pattern** — middleware for HTTP requests.

The token is read from MMKV on every request (not cached in memory). This ensures a freshly logged-out session immediately stops sending the token.

---

## app/src/services/auth.service.ts — Auth API + Token Management

### getApiErrorMessage

```tsx
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (!error.response) return "Unable to send you the code. Please try again.";
    return error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
```

This handles the 4 types of errors:
1. Axios error with server message → use server message (most informative)
2. Axios error with no response → network error
3. Axios error with generic message → use Axios message
4. Non-Axios error → use `.message` or generic fallback

Used in every screen's `catch` block. Centralised error message extraction — one place to fix if the API error format changes.

### authApi Object

```tsx
export const authApi = {
  login: (phoneNumber, pin) => api.post("/api/auth/login", { phoneNumber, pin }),
  registerAdmin: (payload) => api.post("/api/auth/register/admin", payload),
  ...
};
```

All auth-specific API calls are grouped in one object. This is the **Repository pattern** for API calls — centralised, typed, easy to mock in tests.

---

## app/src/services/offlineQueue.ts — The Offline Queue

This is one of the most important architecture decisions in your app.

### How It Works

```txt
User action (contribute/repay)
  → Check network
  → If offline: enqueue(action) to MMKV
  → If online: call API directly

App reconnects to internet
  → startQueueListener fires
  → flushQueue() runs
  → Each queued action is replayed to the API
  → Failed actions older than 24h are discarded
```

### Deduplication

```tsx
const isDuplicate = queue.some(
  (q) =>
    q.endpoint === action.endpoint &&
    JSON.stringify(q.body) === JSON.stringify(action.body),
);
if (isDuplicate) return;
```

If the same action is queued twice (e.g., user taps "Submit" twice while offline), only the first is kept. `JSON.stringify` comparison works for simple objects — for complex nested objects with different key ordering, it could give false negatives, but for your financial action bodies it's reliable.

### 24-Hour Expiry

```tsx
const age = Date.now() - action.timestamp;
if (age < 24 * 60 * 60 * 1000) {
  remaining.push(action);  // keep it, try again later
}
```

Failed actions are kept for up to 24 hours. After that they're discarded. This prevents stale offline contributions from being submitted days later when the user reconnects.

### Singleton Listener

```tsx
let unsubscribe: (() => void) | null = null;

export function startQueueListener(): void {
  if (unsubscribe) return;  // already started
  unsubscribe = NetInfo.addEventListener(...);
}
```

The `if (unsubscribe) return` guard prevents multiple listeners from being registered if `startQueueListener` is called more than once.

---

## app/src/hooks/useOfflineApi.ts — Offline-First Data Fetching

```tsx
const cached = getCached<T>(endpoint);
const [data, setData] = useState<T | null>(cached);
const [loading, setLoading] = useState(cached === null);
const [isStale, setIsStale] = useState(cached !== null);
```

The hook:
- `data` starts with cached value (or null)
- `loading` is only `true` if there's no cache (nothing to show yet)
- `isStale` is `true` when showing cached data that hasn't been refreshed yet

This means screens with cached data load instantly with no spinner, while fresh data arrives silently in the background.

---

## app/src/hooks/useTheme.ts — Theme Hook

```tsx
export const useTheme = () => {
  const effectiveTheme = useUIStore((state) => state.effectiveTheme);
  const isDark = effectiveTheme === "dark";
  const colors = getColors(isDark);
  return { colors, isDark, effectiveTheme };
};
```

Every screen that needs colours calls `useTheme()`. The `getColors(isDark)` function returns the full colour palette for the current theme. Components never import colours directly — they always go through `useTheme()`. This means changing a colour in `colors.ts` affects the entire app instantly.

---

## Best Practices

✅ Interceptor for automatic token injection  
✅ Centralised error message extraction  
✅ Repository pattern for auth API  
✅ Offline queue with deduplication and expiry  
✅ Singleton queue listener  
✅ Offline-first hook with stale indicator  
⚠️ No token refresh (refresh token exists in `AuthSessionResponse` but is never used) — JWT will expire and users will be silently logged out; implement refresh token rotation
