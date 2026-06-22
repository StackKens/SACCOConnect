# app/(admin)/contributions.tsx — All Contributions

## What This Screen Does

Admin view of every contribution across all members. Shows total confirmed amount, each contribution with member name, method, reference, and status. Allows admin to manually confirm pending cash payments.

---

## Key Patterns

### Optimistic Status Update

```tsx
await api.post(`/api/contributions/${id}/confirm`);
setContributions((prev) =>
  prev.map((c) => c.id === id ? { ...c, status: "CONFIRMED" } : c)
);
```

After confirming, the status changes instantly in the UI without re-fetching the full list. The `map` returns a new array where only the matching item is changed.

---

### Per-Item Loading State

```tsx
const [confirming, setConfirming] = useState<string | null>(null);

<Button
  loading={confirming === item.id}
  onPress={() => handleConfirm(item.id, ...)}
/>
```

`confirming` holds the ID of the contribution currently being confirmed. Each button checks `confirming === item.id` — only the tapped button shows a spinner. Other buttons stay normal. Without this, all buttons would show loading or none would.

---

### Computed Total

```tsx
const total = contributions
  .filter((c) => c.status === "CONFIRMED")
  .reduce((sum, c) => sum + c.amount, 0);
```

Only confirmed contributions count toward the total. Pending (unverified cash) are excluded. Recomputed on every render from the current `contributions` state — no need to store it separately.

---

## Best Practices

✅ Per-item loading state (not global)  
✅ Optimistic status update on confirm  
✅ Derived total from filtered list  
✅ Admin can confirm cash payments manually
