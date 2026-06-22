# app/(admin)/active-loans.tsx — Monitor Active Loans

## What This Screen Does

Lists all disbursed loans across all members. Each card shows repayment progress with a visual progress bar, remaining balance, and due date.

---

## Key Pattern: Progress Bar Calculation

```tsx
const progress = item.amountApproved > 0 ? item.amountRepaid / item.amountApproved : 0;
const remaining = item.amountApproved - item.amountRepaid;
```

`progress` is a value between 0 and 1 (0% to 100% repaid). The guard `item.amountApproved > 0` prevents division by zero. The `ProgressBar` component takes this 0–1 value.

`remaining <= 0` means fully repaid — the badge shows "completed" instead of "active".

---

## What a Junior Dev Typically Misses

Division by zero is silent in JavaScript — `0 / 0` returns `NaN` (Not a Number), not a crash. But passing `NaN` to a progress bar component causes unpredictable rendering. Always guard divisions.

---

## Best Practices

✅ Division-by-zero guard  
✅ Visual progress bar for loan repayment  
✅ Dynamic badge based on remaining balance
