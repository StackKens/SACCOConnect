# app/(member)/repay_loan.tsx — Repay a Loan

## What This Screen Does

Loads the member's currently active loan, shows the outstanding balance, lets them choose a payment method and amount, then submits repayment — also with offline support.

---

## Key Patterns

### Fetching Active Loan on Focus

```tsx
useFocusEffect(
  useCallback(() => {
    let active = true;
    api.get("/api/loans/my/active")
      .then((res) => { if (active) setLoan(res.data.data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []),
);
```

Same pattern as other screens — active flag, cleanup on unmount. The endpoint returns `null` if there's no active loan (not an error).

---

### Outstanding Balance Calculation

```tsx
const outstanding = loan ? loan.totalRepayable - loan.amountRepaid : 0;
```

`totalRepayable` includes principal + interest (computed by the backend). Subtracting `amountRepaid` gives what's left. If `loan` is null (no active loan), fallback to 0.

---

### Max Amount Validation

```tsx
if (numAmount > outstanding) {
  Alert.alert("Error", `Amount exceeds outstanding balance of ${formatCurrency(outstanding)}.`);
  return;
}
```

You can't overpay a loan. This check happens client-side before the API call — fast feedback, no unnecessary network request.

---

### Offline Queue for Repayment

```tsx
if (!net.isConnected) {
  enqueue({
    endpoint: `/api/loans/${loan.id}/repay`,
    method: "POST",
    body,
  });
```

The loan ID is embedded in the endpoint URL — this is a **RESTful URL pattern**. `POST /api/loans/:id/repay` is more expressive than `POST /api/repay` with an ID in the body.

---

### Fully Repaid Response Handling

```tsx
const res = await api.post(`/api/loans/${loan.id}/repay`, body);
const fullyRepaid = res.data.fullyRepaid;
Alert.alert(
  fullyRepaid ? "Loan Fully Repaid" : "Payment Recorded",
  fullyRepaid
    ? `Congratulations! You have fully repaid...`
    : `Payment of ${formatCurrency(numAmount)} recorded. Remaining: ${formatCurrency(outstanding - numAmount)}.`,
  [{ text: "OK", onPress: () => router.back() }],
);
```

The backend returns a `fullyRepaid` flag. You show a different congratulations message if the loan is cleared. Pressing OK navigates back. This is better UX than always showing the same message.

---

### Conditional Form Rendering

```tsx
{!loading && !loan && (
  <Text>You have no active loan right now.</Text>
)}

{loan && (
  <>
    <Input ... />
    <Button title="Make Payment" ... />
  </>
)}
```

The payment form only renders if there's an active loan. If there's no loan, the action buttons simply don't appear — no need to disable them.

---

## Best Practices

✅ Client-side max amount validation  
✅ Offline queue support  
✅ RESTful URL structure  
✅ Context-aware success messages  
✅ Conditional form rendering instead of disabling inputs
