# app/(member)/contributions.tsx — Savings Screen

## What This Screen Does

Shows the member's total savings, their monthly due date with overdue warning, and their full list of past contributions.

---

## Key Patterns

### useFocusEffect + Active Flag

```tsx
useFocusEffect(
  useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.get("/api/contributions/my"),
      api.get("/api/members/me"),
    ]).then(([contribRes, profileRes]) => {
      if (!active) return;           // user may have navigated away
      setContributions(contribRes.data.data);
      setTotalSavings(profileRes.data.data.currentBalance ?? 0);
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false }; // cleanup
  }, []),
);
```

**`Promise.all`** fires both API calls at the same time and waits for both to finish. This is faster than awaiting them one after the other. If each takes 500ms, sequential would be 1000ms total; parallel is just 500ms.

**`let active = true`** is the cleanup flag. Without it:
1. User opens Savings tab → request starts
2. User immediately switches to another tab → request still running in background
3. Request finishes, tries to call `setContributions(...)` on an unmounted component → React warning, potentially buggy state

The `return () => { active = false }` is the **cleanup function** of `useFocusEffect`. Expo Router calls it when the user leaves this screen.

---

### Status Badge Colouring

```tsx
<View style={[
  styles.status,
  { backgroundColor: item.status === "CONFIRMED" ? colors.success + "20" : colors.warning + "20" }
]}>
  <Text style={[
    styles.statusText,
    { color: item.status === "CONFIRMED" ? colors.success : colors.warning }
  ]}>
    {item.status.toLowerCase()}
  </Text>
</View>
```

`colors.success + "20"` appends `"20"` (hex alpha = 12.5% opacity) to the colour string like `"#22C55E"` → `"#22C55E20"`. This is a common trick for tinted backgrounds without managing RGBA manually.

The same colour is used for both the background (faded) and the text (full opacity), giving visual consistency. This pattern appears on almost every status badge in your app.

---

### Method Display

```tsx
item.method.replace(/_/g, " ")
```

The backend stores payment methods as `MOBILE_MONEY` or `BANK_TRANSFER`. The `/g` flag replaces ALL underscores, not just the first one. Result: `"Mobile Money"`, `"Bank Transfer"`. Cleaner than storing a display label separately.

---

## Best Practices

✅ Parallel API calls with `Promise.all`  
✅ Active flag pattern for async cleanup  
✅ `useFocusEffect` for fresh data on every tab visit  
✅ Consistent status badge colour pattern  
⚠️ `.catch(() => {})` silently swallows errors — consider showing an error message to the user when the request fails
