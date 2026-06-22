# The Stores — State Management Deep Dive

## What Zustand Is

Zustand is a state management library. Think of it as a shared box of data that any component in the app can read from or write to — without having to pass data down through props.

```tsx
// Any component can read from the store like this:
const user = useAuthStore((state) => state.user);

// Or call an action:
const login = useAuthStore((state) => state.login);
```

The `(state) => state.user` part is a **selector** — it picks only the piece of state you need. If another part of the store changes, this component won't re-render.

---

## auth.store.ts — The Most Important Store

This store manages: logged-in user, SACCO data, loading state, and all auth actions.

### MMKV Persistence

```tsx
const storage = new MMKV({ id: "auth" });
```

MMKV is a high-performance key-value storage (like a super fast localStorage). Each store gets its own namespace (`id: "auth"`, `id: "loans"`, etc.) to keep data separate.

### mapSacco and mapUser — Data Transformation

```tsx
function mapUser(data: AuthSessionResponse): User {
  const role = data.user.role === "ADMIN" ? "admin" : "member";
  return {
    id: data.user.id,
    name: data.member?.fullName ?? "",
    phone: data.user.phoneNumber,
    role,
    ...
  };
}
```

The backend returns data in its own shape. `mapUser` transforms it into your app's `User` type. This is the **Adapter pattern** — translating between two data formats at the boundary. If the backend changes its response shape, you only fix it here, not in every screen.

### checkAuth — App Boot Session Restore

```tsx
checkAuth: () => {
  const storedUser = storage.getString("user");
  const token = storage.getString("token");
  if (storedUser && token) {
    const user = JSON.parse(storedUser);
    // ...
    syncMemberData(user.id); // background refresh
    set({ user, sacco, rulesAccepted: true, isLoading: false });
  } else {
    set({ isLoading: false });
  }
},
```

On app start, `checkAuth` reads from MMKV. If a user and token exist, the app restores the session instantly (no login screen). Then `syncMemberData` fetches fresh data from the API in the background — the user sees their cached data immediately, and it silently updates.

### syncMemberData — Background Sync

```tsx
async function syncMemberData(userId: string) {
  try {
    const [contribRes, loanRes] = await Promise.all([...]);
    // map and hydrate stores
    useMemberDataStore.getState().hydrateFromApi(userId, { ... });
  } catch {
    // offline — use cached data
  }
}
```

The `catch` block is empty — if the sync fails (offline), the app just uses cached data. No error shown to the user. This is the correct offline-first behaviour.

**Note:** Calling `useMemberDataStore.getState()` directly (not the hook) is how you access other stores from inside a store. You can't use React hooks outside of components.

---

## member.store.ts — Member Financial Data

Stores contributions, loans, and transactions per user, keyed by user ID.

### Per-User Storage Keys

```tsx
function storageKey(userId: string, key: string) {
  return `${userId}_${key}`;
}
// Result: "user_abc123_contributions"
```

Data is namespaced by user ID. If two people use the same phone, their data stays separate.

### hydrateFromApi vs initForUser

- `initForUser(userId)` — loads from MMKV cache only. Called at app start (fast, offline-safe).
- `hydrateFromApi(userId, data)` — saves fresh API data to MMKV and updates state. Called after API sync.

Two separate methods for two separate concerns.

### Cross-Store Communication

```tsx
addLoanApplication: (...) => {
  // save to member store
  set({ loans });
  // also add to admin's loan queue store
  useLoanStore.getState().addFromMemberApplication({ ... });
},
```

When a member applies for a loan, both the member's loan list AND the admin's loan queue need updating. The store calls the other store directly. This works but creates **tight coupling** between stores — a trade-off for simplicity.

---

## loan.store.ts — Admin Loan Queue

```tsx
approveLoan: (id) => {
  const dueDate = new Date(Date.now() + loan.term * 30 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0];
```

`loan.term * 30 * 24 * 60 * 60 * 1000` converts months to milliseconds (approximate — 30 days per month). This calculates the due date by adding the loan term to today. Using a real date library (like `date-fns`) would handle month lengths more accurately.

---

## ui.store.ts — Theme Management

```tsx
Appearance.addChangeListener(() => {
  const store = useUIStore.getState();
  if (store.theme === "system") {
    store.updateEffectiveTheme();
  }
});
```

This listener lives **outside** the store creation. It runs at module load time (when the file is first imported). It listens for the device's dark/light mode to change and updates the store only when the user has chosen "system" theme.

---

## announcement.store.ts — Simple Store

The simplest store. Load from MMKV on init, `post` prepends, `remove` filters. The `INITIAL` announcements are sample data that shows on first install before any real announcements are posted.

---

## contribution.store.ts — Stub Store

```tsx
const dummyContributions: Contribution[] = [...];
```

This store still has dummy/mock data. It's not wired to the API or MMKV. The real contribution data flows through `member.store.ts`. This store appears to be a leftover from early development.

**Best practice:** Remove `contribution.store.ts` or wire it properly. Having two places that could represent contributions is confusing.

---

## General Best Practices for Stores

✅ Adapter functions (mapUser, mapSacco) at API boundaries  
✅ Per-user namespaced storage keys  
✅ Separate init (cache) and hydrate (API) methods  
✅ `getState()` for cross-store calls  
⚠️ `contribution.store.ts` is a dead/mock store — clean it up  
⚠️ Cross-store calls create tight coupling — consider an event bus or shared action for complex flows  
⚠️ `30 * 24 * 60 * 60 * 1000` per month is approximate — use `date-fns` for accurate date math
