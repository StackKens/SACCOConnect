# app/(member)/index.tsx — Member Dashboard

## What This Screen Does

The home screen for members. Shows:
- SACCO identity strip (name, monthly contribution)
- Total savings + active loan balance
- Contribution streak
- Next contribution due date
- Quick action buttons

---

## Line-by-Line Breakdown

### useOfflineApi — The Smart Data Fetcher

```tsx
const { data: profile, loading: profileLoading } = useOfflineApi<MemberProfile>("/api/members/me");
const { data: activeLoan, loading: loanLoading } = useOfflineApi<ActiveLoan | null>("/api/loans/my/active");
const loading = profileLoading && loanLoading;
```

`useOfflineApi` is your custom hook. It:
1. Checks if there's a cached version of the data in MMKV
2. If yes → shows it immediately (no spinner)
3. Then fetches fresh data from the API in the background
4. If offline → stays on cached data silently

`loading = profileLoading && loanLoading` uses `&&` (AND), not `||` (OR). This means the skeleton shows only while BOTH are loading. Once either one has data (cached), we show content. This is intentional — the screen feels faster.

**The TypeScript generic `<MemberProfile>`** tells `useOfflineApi` what shape the data will be. Without it, `profile` would be typed as `unknown` and you'd get TypeScript errors everywhere you tried to use it.

---

### Null Coalescing for Safe Display

```tsx
const totalSavings = profile?.currentBalance ?? 0;
const activeLoanBalance = activeLoan ? (activeLoan.amountApproved - activeLoan.amountRepaid) : 0;
const streak = profile?.streak?.currentStreak ?? 0;
```

- `?.` = optional chaining: if `profile` is null/undefined, stop and return undefined instead of crashing
- `??` = nullish coalescing: if the left side is null or undefined, use the right side (0 in this case)

This is how you write **defensively** — you assume the API might return null and you handle it gracefully instead of crashing.

---

### Overdue Detection

```tsx
const dueLabel = nextContribution ? dueDateLabel(nextContribution) : null;
const isOverdue = dueLabel?.startsWith("Overdue");
```

`dueDateLabel` (in `app/src/utils/date.ts`) returns strings like `"Due in 3 days"` or `"Overdue by 2 days"`. You check if the string starts with `"Overdue"` to colour it red. This is a **string-based flag** — it works but is brittle. If someone ever changes the prefix in `dueDateLabel`, this breaks silently. A better approach would be returning an object `{ label: string; isOverdue: boolean }` from the utility function.

---

### SACCO Strip — Derived State

```tsx
const saccoInitials = (sacco?.name ?? "SC")
  .split(" ")
  .slice(0, 2)
  .map((w: string) => w[0]?.toUpperCase())
  .join("");
```

This derives the avatar initials from the SACCO name every render. `"Kenya Savings Group"` → split → `["Kenya", "Savings", "Group"]` → slice first 2 → `["Kenya", "Savings"]` → take first char → `["K", "S"]` → join → `"KS"`.

The `"SC"` fallback handles the case where `sacco?.name` is null or empty.

---

### Skeleton Loading State

```tsx
{loading ? <SkeletonDashboard /> : (
  <>
    <StatCard ... />
    <Card ... />
  </>
)}
```

While data is loading, you show `<SkeletonDashboard />` — placeholder boxes that pulse. This is a **skeleton screen** pattern. It's better than a spinner because it shows the *shape* of content before it loads, which feels faster to users even if it takes the same time.

---

### Conditional Rendering with `&&`

```tsx
{sacco && (
  <View style={styles.saccoStrip}>
    ...
  </View>
)}
```

If `sacco` is null (user somehow has no SACCO yet), the strip just doesn't render. No crash. This is the most common conditional rendering pattern in React.

---

## What a Junior Dev Typically Misses

- `loading = profileLoading && loanLoading` — the AND logic means the skeleton only shows when BOTH are loading. Changing to `||` would show the skeleton even when one piece of data is cached, making the screen feel slower.
- The `??` vs `||` difference: `0 || fallback` gives `fallback` (because 0 is falsy), but `0 ?? fallback` gives `0` (because 0 is not null/undefined). For financial data, this matters — a savings balance of 0 is a valid value.

---

## Best Practices

✅ Offline-first with `useOfflineApi`  
✅ Skeleton loading for perceived performance  
✅ Null-safe access with `?.` and `??`  
✅ Derived values computed inline, not stored in state  
⚠️ `isOverdue` check via string prefix is fragile — refactor `dueDateLabel` to return an object
