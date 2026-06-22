# app/(member)/_layout.tsx — Member Tab Bar

## What This File Does

This file creates the bottom tab bar that members see. It defines 5 visible tabs and several hidden push screens.

---

## The Tab Bar Setup

```tsx
<Tabs
  screenOptions={{
    tabBarStyle: {
      backgroundColor: colors.surface,
      height: 74,
      paddingBottom: 16,
      paddingTop: 6,
    },
  }}
>
```

`height: 74` with `paddingBottom: 16` gives breathing room from the home indicator on iPhones with no physical home button. Without this, icons sit right against the edge.

`colors.surface` and `colors.textSecondary` come from your theme system — this is why the tab bar automatically looks right in both light and dark mode.

---

## useFocusEffect for Data Refresh

```tsx
useFocusEffect(
  useCallback(() => {
    refreshSacco();
  }, [refreshSacco]),
);
```

Every time the member navigates to any tab (the layout re-focuses), it refreshes the SACCO data from MMKV. This handles the case where an admin changes the contribution amount while the member is using the app — next time they tab anywhere, they get fresh SACCO data.

**Why `useCallback`?** Without it, `refreshSacco` would be a new function reference on every render, causing `useFocusEffect` to re-run constantly. `useCallback` memoizes the function.

---

## Hidden Screens

```tsx
<Tabs.Screen name="apply_loan" options={{ href: null }} />
<Tabs.Screen name="repay_loan" options={{ href: null }} />
<Tabs.Screen name="contribute" options={{ href: null }} />
<Tabs.Screen name="statement" options={{ href: null }} />
<Tabs.Screen name="group_rules" options={{ href: null }} />
```

These five screens exist as `.tsx` files in `(member)/`, but `href: null` hides them from the tab bar. They're reached via `router.push()` from buttons inside other screens.

**Why register them at all?** Because Expo Router scans the folder and would create tabs for every file it finds. `href: null` is how you say "I know about this screen, but don't tab-bar it".

---

## Lucide Icons

```tsx
import { Home, Wallet, Banknote, Bell, User } from "lucide-react-native";
```

`lucide-react-native` gives you clean, consistent icons. The `({ color }) => <Home size={24} color={color} />` pattern passes the tab's active/inactive colour from Expo Router directly into the icon.

---

## Best Practices

✅ Theme-aware tab bar colours  
✅ Data refresh on focus  
✅ Hidden screens registered to prevent tab bar bloat
