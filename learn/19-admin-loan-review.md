# app/(admin)/loan-review.tsx — Review a Loan Application

## What This Screen Does

Shows full details of a single loan application. Admin can approve (with a confirmation dialog) or reject (requires a typed reason). Already-actioned loans show as read-only.

---

## Key Patterns

### useLocalSearchParams for the Loan ID

```tsx
const { id } = useLocalSearchParams<{ id: string | string[] }>();
const loanId = Array.isArray(id) ? id[0] : id;
```

The `loanId` comes from the URL (`/(admin)/loan-review?id=abc123`). The `Array.isArray` check handles an edge case in Expo Router where a param could theoretically be repeated in the URL.

---

### Two-Step Rejection

```tsx
const [showRejectInput, setShowRejectInput] = useState(false);

<Button
  title={showRejectInput ? "Confirm Reject" : "Reject"}
  onPress={showRejectInput ? handleReject : () => setShowRejectInput(true)}
/>
```

First tap shows a text input for the rejection reason. Second tap (with reason filled) confirms the rejection. This prevents accidental rejections — the admin has to explicitly provide a reason before the final action button does anything.

The button title changes to "Confirm Reject" to signal the second stage. This is a **progressive disclosure** pattern.

---

### Already-Actioned Guard

```tsx
const isAlreadyActioned = !["PENDING", "AWAITING_GUARANTORS", "UNDER_REVIEW"].includes(loan.status);

{!isAlreadyActioned && (
  <>
    {showRejectInput && <RejectReasonInput />}
    <View style={styles.actions}>
      <Button title="Approve" ... />
      <Button title="Reject" ... />
    </View>
  </>
)}
```

If the loan is already ACTIVE or REJECTED, the action buttons simply don't render. An already-approved loan shouldn't be approvable again. The `!isAlreadyActioned` check handles this.

---

### Data Table with map()

```tsx
{[
  { label: "Applicant", value: loan.member.fullName },
  { label: "Amount Requested", value: formatCurrency(loan.amountRequested) },
  { label: "Term", value: `${loan.repaymentMonths} months` },
  { label: "Interest Rate", value: `${loan.interestRate}% p.a.` },
  { label: "Purpose", value: loan.purpose },
  { label: "Total Savings", value: formatCurrency(loan.member.currentBalance), highlight: true },
].map(({ label, value, highlight }, i) => (
  <View key={i}>
    {i > 0 && <Divider />}
    <View style={styles.row}>
      <Text>{label}</Text>
      <Text style={{ color: highlight ? colors.success : colors.text }}>{value}</Text>
    </View>
  </View>
))}
```

The loan details are an array of `{ label, value, highlight? }` objects, rendered with `map`. This is cleaner than writing 6 identical `<View>` blocks. The `highlight: true` on "Total Savings" makes it green — drawing attention to the member's financial standing, the most important factor in a loan decision.

---

## What a Junior Dev Typically Misses

The `highlight` is an optional property in the array items. TypeScript handles this with `highlight?: true` or the destructuring default. When you destructure `{ label, value, highlight }` and `highlight` isn't present in the object, it's `undefined`, which is falsy, so the colour fallback works correctly.

---

## Best Practices

✅ Two-step rejection prevents accidents  
✅ Already-actioned guard prevents double-processing  
✅ Data table pattern avoids repetitive JSX  
✅ ID safely extracted from URL params
