# app/(member)/loans.tsx — My Loans Screen

## What This Screen Does

Lists all the member's loans (active, pending, repaid, rejected). If they have no loans, shows a feature-marketing empty state with a call-to-action.

---

## Key Patterns

### Status Variant Function

```tsx
const statusVariant = (status: string) => {
  if (status === "ACTIVE") return "warning";
  if (status === "REPAID") return "success";
  if (status === "REJECTED") return "error";
  return "info";
};
```

This maps backend status strings to badge colour variants. The `Badge` component accepts a `variant` prop and handles the colours internally. This is a **pure function** — same input always gives same output, no side effects. Easy to test.

---

### Empty State with Value Proposition

```tsx
<View style={styles.emptyContainer}>
  <View style={styles.emptyIconWrap}>
    <Banknote size={48} color={colors.primary} />
  </View>
  <Text style={styles.emptyTitle}>No loans yet</Text>
  <View style={styles.featureList}>
    <View style={styles.featureRow}>
      <ShieldCheck size={16} color={colors.success} />
      <Text>Loans up to 3x your savings</Text>
    </View>
    ...
  </View>
  <TouchableOpacity onPress={() => router.push("/(member)/apply_loan")}>
    <Text>Apply for a Loan</Text>
  </TouchableOpacity>
</View>
```

Rather than just "No loans yet", you educate the user on what they can get. This is a **value-proposition empty state** — a product design pattern that converts empty screens into onboarding moments.

---

### Conditional Rendering for Loan Status

```tsx
{item.status === "ACTIVE" && (
  <>
    <View style={styles.progressRow}>
      <Text>Repaid: {formatCurrency(item.amountRepaid)}</Text>
      <Text>Remaining: {formatCurrency(remaining)}</Text>
    </View>
    {item.expectedCompletion && (
      <Text>Due: {formatDate(item.expectedCompletion)}</Text>
    )}
  </>
)}
{["PENDING", "AWAITING_GUARANTORS", "UNDER_REVIEW"].includes(item.status) && (
  <Text style={{ color: colors.warning }}>Awaiting approval</Text>
)}
{item.status === "REJECTED" && (
  <Text style={{ color: colors.error }}>
    Rejected{item.rejectionReason ? `: ${item.rejectionReason}` : ""}
  </Text>
)}
```

Different content renders based on loan status. The `Array.includes()` check handles three pending statuses at once without a long `||` chain.

---

### Floating Action Button (FAB)

```tsx
<TouchableOpacity
  style={[styles.fab, { backgroundColor: colors.primary }]}
  onPress={() => router.push("/(member)/apply_loan")}
>
  <Text style={styles.fabText}>+</Text>
</TouchableOpacity>
```

The FAB only shows when there are loans (otherwise the empty state button handles it). `position: "absolute"` with `bottom: 20, right: 20` pins it to the bottom-right corner, floating above the list. This is the standard Android/Material Design FAB pattern.

---

### Repay Only Active Loans

```tsx
<TouchableOpacity
  onPress={() => item.status === "ACTIVE" && router.push("/(member)/repay_loan")}
>
```

Tapping a loan card only navigates to repayment if the loan is active. Rejected or repaid loans are just informational. The `&&` short-circuit means: "if ACTIVE, then navigate; otherwise do nothing".

---

## Best Practices

✅ Meaningful empty states  
✅ Pure function for status mapping  
✅ Multi-status check with `Array.includes()`  
✅ FAB shown contextually  
⚠️ The FAB navigates to repayment for any loan, not the specific one tapped — if a user has multiple loans in different states, the flow could be confusing
