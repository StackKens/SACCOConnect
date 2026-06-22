# app/(admin)/member-detail.tsx — Member Profile (Admin View)

## What This Screen Does

Full member profile for admin: contact info, financial summary, recent contributions, loan history, deactivate/delete actions, and quick navigation to the member's pending loan.

---

## Key Patterns

### Extracted fetchMember

```tsx
const fetchMember = useCallback(() => {
  if (!memberId) return;
  let active = true;
  api.get(`/api/members/${memberId}`).then((res) => {
    if (active) setMember(res.data.data);
  }).finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
}, [memberId]);

useFocusEffect(fetchMember);
```

By extracting `fetchMember` into a named `useCallback`, you can call it directly after actions (like deactivating a member) without duplicating the fetch logic. In simpler screens, the callback is inline inside `useFocusEffect`.

---

### Functional State Update After Action

```tsx
await api.patch(`/api/members/${memberId}/status`, { status: next });
setMember((m) => m ? { ...m, status: next } : m);
```

After the API succeeds, you update local state without re-fetching. The spread `{ ...m, status: next }` creates a new object with all properties but `status` changed.

---

### Smart Context-Aware Button

```tsx
const pendingLoan = member.loans.find((l) => ["PENDING", "AWAITING_GUARANTORS", "UNDER_REVIEW"].includes(l.status));

<Button
  title={pendingLoan ? "Review Loan" : "Loan Queue"}
  onPress={() => pendingLoan
    ? router.push(`/(admin)/loan-review?id=${pendingLoan.id}`)
    : router.push("/(admin)/loan-queue")}
/>
```

If the member has a pending loan, go straight to it. If not, go to the general queue. One button, two smart behaviours.

---

## Best Practices

✅ Extracted fetch function for reuse  
✅ Functional state update avoids re-fetch  
✅ Context-aware navigation  
⚠️ Delete is permanent — consider soft-delete for financial audit trails
