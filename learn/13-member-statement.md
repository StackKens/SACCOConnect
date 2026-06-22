# app/(member)/statement.tsx — Transaction Statement

## What This Screen Does

Aggregates all financial transactions (contributions, loan disbursements, loan repayments) from the backend, sorts them by date, and displays them as a scrollable statement with colour-coded amounts.

---

## Key Patterns

### Building a Unified Transaction List from Multiple Endpoints

```tsx
Promise.all([
  api.get("/api/contributions/my"),
  api.get("/api/loans/my"),
]).then(([contribRes, loansRes]) => {
  const contributions: TxItem[] = contribRes.data.data.map((c) => ({
    id: c.id,
    type: "CONTRIBUTION",
    amount: c.amount,
    ...
  }));

  const repayments: TxItem[] = loansRes.data.data.flatMap((loan) =>
    (loan.repayments ?? []).map((r) => ({
      id: r.id,
      type: "LOAN_REPAYMENT",
      amount: -r.amountPaid,  // negative = money going out
      ...
    }))
  );

  const disbursements: TxItem[] = loansRes.data.data
    .filter((l) => l.status === "ACTIVE" || l.status === "REPAID")
    .map((l) => ({ ... }));

  const all = [...contributions, ...repayments, ...disbursements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  setTransactions(all);
});
```

**Why `flatMap` for repayments?** Each loan can have multiple repayments. `map` would give you `[[r1, r2], [r3]]` (array of arrays). `flatMap` gives you `[r1, r2, r3]` (flat array). That's what you want to merge with other transactions.

**Why `amount: -r.amountPaid`?** Repayments are money leaving the member's loan balance. Negative amounts signal "outgoing" transactions — used later for colour coding.

**Why filter disbursements by ACTIVE/REPAID?** A PENDING loan hasn't been disbursed yet. Only approved (ACTIVE) or completed (REPAID) loans have actual disbursements.

---

### Colour-Coded Amounts

```tsx
<Text style={[styles.amount, { color: item.amount > 0 ? colors.success : colors.error }]}>
  {item.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(item.amount))}
</Text>
```

Positive amounts (contributions, disbursements) → green with `+` prefix.
Negative amounts (repayments) → red.
`Math.abs()` strips the negative sign before passing to `formatCurrency`, which formats the number.

This is the standard bank statement pattern: green = in, red = out.

---

### Export Placeholder

```tsx
<TouchableOpacity onPress={() => Alert.alert("Coming Soon", "PDF export will be available in the next release.")}>
  <Download size={20} color={colors.primary} />
  <Text>Export</Text>
</TouchableOpacity>
```

The export button exists in the UI but shows a "Coming Soon" alert. This is a **stub** — the UI is complete, the feature isn't implemented yet. It's better to ship a visible but non-functional button than to hide the feature entirely. Users know it's planned.

---

## Best Practices

✅ Unified view from multiple API sources  
✅ Colour-coded +/- amounts  
✅ `flatMap` for nested data structures  
✅ Stubs signal planned features  
⚠️ The transaction ID for disbursements is `disb_${l.id}` — a composite key. If the loan ID appears in other transaction lists, this prefix prevents collision  
⚠️ With many transactions, this all loads at once — consider pagination for members with years of history
