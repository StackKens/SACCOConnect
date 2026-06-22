# app/(member)/apply_loan.tsx — Apply for a Loan

## What This Screen Does

Checks if the member is eligible for a loan, shows how much they qualify for, lets them fill in amount/purpose/term, lets them select exactly 2 guarantors from a modal, then submits to the backend.

---

## This is the Most Feature-Rich Member Screen

It handles:
- Eligibility gating (shows blocked screen if ineligible)
- Live API data fetch
- Complex multi-select modal with a limit
- Form validation
- API submission

---

## Key Patterns

### Eligibility Gate

```tsx
if (eligibility?.hasActiveLoan || (eligibility && eligibility.maxAmount === 0)) {
  return (
    <ScreenWrapper ...>
      <Card>
        <Text style={{ color: colors.error }}>Not Eligible</Text>
        <Text>{eligibility.reason}</Text>
      </Card>
    </ScreenWrapper>
  );
}
```

**Early return for blocked states** — if the user can't apply, render a completely different screen instead of disabling the form. This is cleaner than rendering the form with everything disabled.

The check runs after loading completes. The `eligibility?.hasActiveLoan` uses optional chaining because `eligibility` starts as `null` before the API responds.

---

### Guarantor Selection with Hard Limit

```tsx
const toggleGuarantor = (member: Member) => {
  setGuarantors((prev) => {
    const exists = prev.find((g) => g.id === member.id);
    if (exists) return prev.filter((g) => g.id !== member.id);  // deselect
    if (prev.length >= 2) {
      Alert.alert("Limit reached", "You can only select 2 guarantors.");
      return prev;  // return unchanged — don't add
    }
    return [...prev, member];  // add
  });
};
```

The updater form of `setGuarantors` (`(prev) => ...`) is used because the new state depends on the previous state. This prevents **stale closure bugs** where the function captures an old value of `guarantors`.

The function handles 3 cases:
1. Already selected → remove (deselect toggle)
2. At limit → alert and don't add
3. Under limit → add

---

### Parallel Data Load

```tsx
Promise.all([
  api.get("/api/members/me/eligibility"),
  api.get("/api/members/sacco-members"),
]).then(([eligRes, membersRes]) => {
  setEligibility(eligRes.data.data);
  setMembers(membersRes.data.data);
});
```

Eligibility and member list load simultaneously. Both are needed before the user can do anything, so there's no point loading them sequentially.

---

### Guarantor Chips

```tsx
{guarantors.map((g) => (
  <View key={g.id} style={styles.selectedChip}>
    <Text>{g.fullName}</Text>
    <TouchableOpacity onPress={() => toggleGuarantor(g)}>
      <Text>x</Text>
    </TouchableOpacity>
  </View>
))}
```

Selected guarantors appear as removable chips above the button. This is the standard **chip/tag selection pattern** — common in multi-select UIs.

---

### Modal with FlatList

The guarantor picker is a bottom-sheet modal containing a `FlatList` of all SACCO members. Each row shows name, phone, and a check/circle icon for selection state.

```tsx
const selected = !!guarantors.find((g) => g.id === item.id);
```

`!!` double-negation converts the result to a boolean. `.find()` returns the item or `undefined`. `!!undefined` = `false`. `!!{...}` = `true`. Cleaner than `guarantors.find(...) !== undefined`.

---

## What a Junior Dev Typically Misses

- Using `setGuarantors(newVal)` directly instead of the updater form `setGuarantors(prev => ...)` — this can cause bugs when the state update happens inside a closure that captured an old state value
- Not handling the eligibility `null` state before the API responds — renders the full form briefly before the blocking screen shows

---

## Best Practices

✅ Eligibility gate with early return  
✅ Updater form for state that depends on previous value  
✅ Parallel data loading  
✅ Chip UI for selected items  
✅ FlatList inside modal for member selection  
⚠️ Guarantors are loaded as all SACCO members — at scale (100+ members) this could be slow; add search/filter to the modal
