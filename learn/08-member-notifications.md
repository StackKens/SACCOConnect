# app/(member)/notifications.tsx — Alerts Screen

## What This Screen Does

Aggregates multiple data sources into a single notification feed: announcements from the backend, contribution records, loan status changes, and repayment history — all sorted by date and with read/unread tracking.

---

## This is the Most Architecturally Complex Member Screen

It brings together:
- Live API data (announcements)
- Local Zustand store data (contributions, loans, transactions)
- MMKV persistence (read status)
- `useMemo` for computed lists
- `FlatList` for performance

---

## Key Patterns

### Notification Aggregation with useMemo

```tsx
const items = useMemo<NotifItem[]>(() => {
  const announcementItems = announcements.map(a => ({ ... }));
  const contributionItems = contributions.map(c => ({ ... }));
  const repaymentItems = transactions.filter(t => t.type === "loan_repayment").map(t => ({ ... }));
  const loanItems = loanNotifications(loans);

  return [...announcementItems, ...contributionItems, ...repaymentItems, ...loanItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}, [announcements, contributions, loans, transactions]);
```

`useMemo` means: "compute this only when the dependencies change". Without it, the sorting and mapping would re-run on *every* render — including renders from unrelated state changes like marking something read. With it, the computation only runs when actual data changes.

The spread `[...announcements, ...contributions, ...]` merges four arrays. The `.sort()` at the end puts everything in reverse chronological order. `new Date().getTime()` converts dates to milliseconds for numeric comparison.

---

### Read/Unread State in MMKV

```tsx
const readStorage = new MMKV({ id: "read_notifications" });

function getReadIds(userId: string): Set<string> {
  const stored = readStorage.getString(`read_${userId}`);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}
```

Read status is stored per-user in MMKV. A `Set` is used instead of an array because `Set.has()` is O(1) — constant time lookup, regardless of how many IDs there are. Checking `array.includes()` on a big array is O(n) — gets slower as the list grows.

```tsx
const unreadCount = items.filter((n) => !readIds.has(n.id)).length;
```

This is recomputed on every render but it's cheap — just filtering an array.

---

### NOTIF_META — Data-Driven Configuration

```tsx
const NOTIF_META: Record<NotifType, { icon: React.FC<any>; color: (c: any) => string; label: string }> = {
  announcement:   { icon: Info,        color: (c) => c.primary,  label: "Announcement" },
  contribution:   { icon: PiggyBank,   color: (c) => c.success,  label: "Contribution" },
  loan_approved:  { icon: CheckCircle, color: (c) => c.success,  label: "Loan" },
  loan_rejected:  { icon: XCircle,     color: (c) => c.error,    label: "Loan" },
};
```

This maps notification types to their icon, colour, and label in one object. Instead of a big `if/else` or `switch` inside the render function, you do a single lookup:

```tsx
const meta = NOTIF_META[item.type];
const iconColor = meta.color(colors);
const Icon = meta.icon;
```

`Icon` is a component stored in a variable (capital I). You render it as `<Icon size={18} color={iconColor} />`. This is the **Strategy pattern** applied to UI — configurable behaviour driven by data, not code branches.

Adding a new notification type only requires adding one entry to `NOTIF_META`, not changing the render logic.

---

### FlatList vs ScrollView

```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <NotificationCard ... />}
/>
```

`FlatList` only renders items visible on screen. A `ScrollView` renders everything at once. If a member has 200 notifications, a `ScrollView` would render 200 items — slow. `FlatList` renders ~15 at a time. For any list that could grow, always use `FlatList`.

---

### loanNotifications Function

```tsx
function loanNotifications(loans): NotifItem[] {
  return loans.flatMap((l) => {
    const items = [applied_notification];
    if (l.status === "active") items.push(approved_notification);
    if (l.status === "rejected") items.push(rejected_notification);
    return items;
  });
}
```

`flatMap` is like `map` but it flattens one level. Each loan can produce 1, 2, or more notification items, and `flatMap` merges them all into a single flat array.

---

## What a Junior Dev Typically Misses

- Using an array for read IDs instead of a Set — works for small lists, but degrades at scale
- `useMemo` missing dependencies — if you forget to list `loans` in the deps array, the notification list won't update when loans change
- The `loanNotifications` function is called inside `useMemo` — this is correct because it's a pure computation with no side effects

---

## Best Practices

✅ `useMemo` for expensive derived lists  
✅ `Set` for O(1) read status lookup  
✅ `FlatList` for long lists  
✅ Data-driven icon/colour config (NOTIF_META)  
✅ Per-user read state  
⚠️ Notification IDs are composite strings like `ann_${a.id}` — if the backend changes ID formats, these could collide
