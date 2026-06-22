# app/(admin)/_layout.tsx — Admin Tab Bar

## What This File Does

Creates the admin's bottom tab bar with 5 visible tabs: Dashboard, Members, Loans, Treasury, Settings — and 8 hidden push screens.

---

## Differences from Member Layout

The admin layout does NOT have `useFocusEffect` for data refresh. This is because admin screens each fetch their own data individually with `useFocusEffect` — the layout doesn't need to orchestrate it.

### `"600" as const`

```tsx
tabBarLabelStyle: {
  fontWeight: "600" as const,
},
```

TypeScript infers `"600"` as type `string` unless you add `as const`, which narrows it to the literal type `"600"`. React Native's `fontWeight` prop only accepts specific string literals (`"100"`, `"200"` ... `"900"`, `"bold"`, `"normal"`). Without `as const`, TypeScript shows an error even though the value is correct.

---

## The 8 Hidden Screens

```tsx
<Tabs.Screen name="loan-review" options={{ href: null }} />
<Tabs.Screen name="member-detail" options={{ href: null }} />
<Tabs.Screen name="active-loans" options={{ href: null }} />
<Tabs.Screen name="contributions" options={{ href: null }} />
<Tabs.Screen name="announcements" options={{ href: null }} />
<Tabs.Screen name="create-sacco" options={{ href: null }} />
<Tabs.Screen name="edit-rules" options={{ href: null }} />
<Tabs.Screen name="contribution-schedule" options={{ href: null }} />
```

These are detail/action screens reached from within the 5 main tabs. For example: tap a loan in the Loans tab → navigate to `loan-review`. Tap a member in Members → navigate to `member-detail`.

The admin has more hidden screens than the member because admin workflows tend to be deeper — you drill into detail screens from list screens.

---

## Best Practices

✅ All hidden screens registered in one place  
✅ Consistent tab bar style with member layout  
✅ `as const` for TypeScript literal types
