# app/(admin)/index.tsx — Admin Dashboard

## What This Screen Does

Shows 4 stats cards (members, savings, active loans, pending applications), quick action buttons to the most-used admin screens, and data shortcuts.

---

## Key Patterns

### Three Parallel API Calls

```tsx
Promise.all([
  api.get("/api/members"),
  api.get("/api/contributions/treasury"),
  api.get("/api/loans/queue"),
]).then(([membersRes, treasuryRes, queueRes]) => {
  setStats({
    totalMembers: membersRes.data.data.length,
    totalSavings: treasuryRes.data.data.totalSavings,
    activeLoans: treasuryRes.data.data.outstanding,
    pendingApplications: queueRes.data.data.length,
  });
});
```

All three calls happen at the same time. The dashboard has the most API calls in a single screen because it's an overview of everything.

Notice that `totalMembers` uses `.length` — it's counting the members array from the `/api/members` endpoint. In a real production app with thousands of members, you'd ask the backend for a count directly (`GET /api/members/count`) instead of fetching the full list just to count it. This works fine at small scale.

---

### Stats in a Single State Object

```tsx
const [stats, setStats] = useState({
  totalMembers: 0,
  totalSavings: 0,
  activeLoans: 0,
  pendingApplications: 0,
});
```

All four stats are one state object, not four separate `useState` calls. This means all four update in a single re-render when the API responds, which avoids intermediate renders where some stats are loaded and others are still 0.

---

### Quick Actions Pattern

```tsx
<Button title="Review Loans" onPress={() => router.push("/(admin)/loan-queue")} />
<Button title="Manage Members" onPress={() => router.push("/(admin)/members")} />
```

These are the same tabs available in the tab bar, but surfaced as buttons. On a dashboard screen, users expect shortcuts to the most important actions without having to visually scan the tab bar. This is standard admin dashboard UX.

---

## Best Practices

✅ All stats in one state object for atomic updates  
✅ Parallel API calls for fast load  
✅ Skeleton while loading  
⚠️ `membersRes.data.data.length` fetches all members just to count them — at scale, use a dedicated count endpoint
