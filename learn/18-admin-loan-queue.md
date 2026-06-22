# app/(admin)/loan-queue.tsx — Loan Applications

## What This Screen Does

Lists all pending loan applications with search. Tapping any application navigates to the loan review screen.

---

## Key Patterns

### Simple List + Search Pattern

This screen is a textbook implementation of a searchable list:

```tsx
const [loans, setLoans] = useState<LoanQueueItem[]>([]);
const [query, setQuery] = useState("");

const filtered = loans.filter(
  (l) =>
    l.member.fullName.toLowerCase().includes(query.toLowerCase()) ||
    l.purpose.toLowerCase().includes(query.toLowerCase()),
);
```

Search by member name OR loan purpose. Both are useful for an admin looking for a specific application.

---

### Custom Search Bar (Not a Library Component)

```tsx
<View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
  <Search size={16} color={colors.textSecondary} />
  <TextInput
    style={[styles.searchInput, { color: colors.text }]}
    placeholder="Search by name or purpose..."
    placeholderTextColor={colors.textSecondary}
    value={query}
    onChangeText={setQuery}
  />
</View>
```

You built the search bar yourself from a `View` + icon + `TextInput`. This gives you full control over styling. The icon is purely visual — it's not interactive.

`placeholderTextColor` must be set explicitly in React Native because it doesn't inherit from `color`. Forgetting this leaves placeholder text in the default grey regardless of theme.

---

### Empty State Handling

```tsx
: filtered.length === 0 ? (
  <View style={styles.empty}>
    <Inbox size={32} color={colors.textSecondary} />
    <Text>
      {loans.length === 0 ? "No pending applications" : "No results found"}
    </Text>
  </View>
)
```

Two different empty messages:
- `loans.length === 0` → no applications at all in the system
- `filtered.length === 0` but `loans.length > 0` → search has no matches

This distinction prevents confusing the admin ("Am I seeing no results because the search filter is active, or because there are genuinely no applications?").

---

## Best Practices

✅ Two distinct empty messages  
✅ Theme-aware placeholder colour  
✅ Search across multiple fields  
✅ Skeleton loading
