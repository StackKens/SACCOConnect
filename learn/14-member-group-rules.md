# app/(member)/group_rules.tsx — View Group Rules

## What This Screen Does

A read-only view of the SACCO's rules and terms. Shown from the Profile → Group Rules menu option. Different from `(auth)/group-rules.tsx` which requires acceptance on first login.

---

## Key Patterns

### Data from Zustand, Not API

```tsx
const sacco = useAuthStore((state) => state.sacco);
const rules = sacco?.rules ?? [];
```

The rules are already in the auth store (loaded at login). No API call needed. This is a benefit of the **offline-first store design** — data that doesn't change often is cached and available instantly.

---

### Stable Key for List Items

```tsx
rules.map((rule, i) => (
  <View key={`${i}-${rule.slice(0, 12)}`} style={styles.ruleRow}>
```

The key combines the index `i` with the first 12 characters of the rule text. Why not just use `i`? Using only the index as a key causes React to re-render all items when the list order changes. Adding content to the key makes it more stable and helps React identify which item is which.

**That said** — a better approach would be a hash or ID from the backend if rules ever have unique identifiers.

---

### Duplicate Code Note

The `GroupAvatar` component is defined locally here AND in `(auth)/group-rules.tsx`. They're identical. This is **code duplication** that should be extracted:

```tsx
// Should be in: app/src/components/ui/GroupAvatar.tsx
export function GroupAvatar({ name, color, size = 64 }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return <View ...><Text>{initials}</Text></View>;
}
```

Then both screens would just import it.

---

## Best Practices

✅ Read from local store — no unnecessary API call  
✅ Defensive fallback with `?? []`  
⚠️ `GroupAvatar` duplicated — extract to shared component  
⚠️ Using index+content for list key — use backend IDs if/when available
