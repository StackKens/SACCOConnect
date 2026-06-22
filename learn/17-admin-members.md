# app/(admin)/members.tsx — Member Management

## What This Screen Does

Lists all SACCO members with search, shows balance and status, allows navigation to member detail, and provides an invite flow that generates and displays an invite code.

---

## Key Patterns

### Client-Side Search / Filter

```tsx
const [query, setQuery] = useState("");

const filtered = members.filter(
  (m) =>
    m.fullName.toLowerCase().includes(query.toLowerCase()) ||
    m.user.phoneNumber.includes(query),
);
```

`filtered` is a **derived value** — computed from `members` and `query` on every render. It's not stored in state. This is correct because it's always computable from existing state.

Both name and phone are searchable. `.toLowerCase()` on both sides makes it case-insensitive.

For a small SACCO (< 500 members), client-side filtering is fine. For thousands of members, you'd move this to a server-side search endpoint.

---

### Two-State Modal (Send → Show Code)

```tsx
const [inviteCode, setInviteCode] = useState<string | null>(null);

// In the modal:
{!inviteCode ? (
  <>
    <Input label="Phone Number" ... />
    <Button title="Send Invite" onPress={handleInvite} />
  </>
) : (
  <>
    <Text>Invite Code Ready</Text>
    <Text style={styles.codeText}>{inviteCode}</Text>
    <Button title="Done" onPress={closeModal} />
  </>
)}
```

The modal has two states managed by a single variable: `null` = show the form, `string` = show the generated code. Clean conditional rendering. `closeModal` resets `inviteCode` back to `null` so next time the modal opens, it starts at the form.

---

### Deep Link Navigation with Query Params

```tsx
<TouchableOpacity onPress={() => router.push(`/(admin)/member-detail?id=${item.id}`)}>
```

The member ID is passed as a query parameter. In `member-detail.tsx`, it's received with:

```tsx
const { id } = useLocalSearchParams<{ id: string | string[] }>();
const memberId = Array.isArray(id) ? id[0] : id;
```

`useLocalSearchParams` can return `string | string[]` for edge cases (multiple params with same name). The `Array.isArray(id) ? id[0] : id` pattern handles both cases safely.

---

### Invite Code Display Style

```tsx
<Text style={[styles.codeText, { color: colors.primary }]}>{inviteCode}</Text>
// codeText: { fontSize: 32, fontWeight: "800", letterSpacing: 4 }
```

The code is displayed large with letter spacing. This makes it easy to read aloud or copy. `letterSpacing: 4` adds 4 points of space between each character — standard for codes and OTPs.

---

## Best Practices

✅ Derived filter, not stored state  
✅ Case-insensitive search  
✅ Two-state modal with single variable  
✅ Query params for detail screen navigation  
⚠️ Client-side search doesn't scale past ~500 members — add debounced server search for production
