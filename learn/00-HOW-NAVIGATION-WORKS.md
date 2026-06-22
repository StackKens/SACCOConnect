# How Navigation Works in SACCOConnect

## The Big Picture

Your app has **three worlds**:

```
app/
├── (auth)/       ← Not logged in: onboarding, login, register
├── (member)/     ← Logged in as a member
└── (admin)/      ← Logged in as an admin
```

The parentheses `()` are an **Expo Router convention**. They mean "this is a group — don't include this name in the URL path". So `(member)/index.tsx` becomes the route `/` for members, not `/member/`.

---

## How Tabs Came Into Existence

In `(member)/_layout.tsx` and `(admin)/_layout.tsx`, you used `<Tabs>` instead of `<Stack>`.

- `<Stack>` = pages that slide in from the side (like pushing a new screen forward)
- `<Tabs>` = bottom tab bar that stays visible on every screen

You chose Tabs for the main app experience because members and admins need quick access to 5 sections at all times. That's a very standard mobile pattern — Instagram, WhatsApp, and banking apps all use it.

```tsx
// This is what creates the tab bar
<Tabs screenOptions={{ ... }}>
  <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ... }} />
  <Tabs.Screen name="contributions" options={{ title: "Savings", ... }} />
</Tabs>
```

Every `Tabs.Screen` maps to a `.tsx` file in the same folder. The `name` prop must exactly match the filename (without `.tsx`).

---

## Role-Based Tabs: How They Work

The actual role-based routing happens in `app/_layout.tsx`, the **Root Layout**. This is the most important file in your app.

Here's the logic in plain English:

```
When the app loads:
  1. Check if there's a saved user in MMKV storage
  2. If no user → send to onboarding
  3. If user is admin but they're on a member screen → redirect to admin
  4. If user is member but they're on an admin screen → redirect to member
  5. If user just logged in and is on auth screen → send to the right dashboard
  6. If member hasn't accepted group rules yet → force them to the rules screen
```

The `useSegments()` hook tells you which folder/group the user is currently in. `segments[0]` gives you `"(auth)"`, `"(member)"`, or `"(admin)"`.

```tsx
const group = segments[0];
const inAuthGroup = group === "(auth)";

if (user.role === "admin" && group === "(member)") {
  router.replace("/(admin)");  // wrong dashboard — kick them out
}
```

`router.replace()` is used instead of `router.push()` here. The difference:
- `push` adds to the history stack (user can press back)
- `replace` swaps the current screen (no going back — perfect for auth redirects)

---

## Hidden Screens in Tabs

You'll notice this pattern in both `_layout.tsx` files:

```tsx
<Tabs.Screen name="apply_loan" options={{ href: null }} />
```

`href: null` means: "this screen exists in the folder, so Expo Router knows about it, but **don't show it in the tab bar**". These are screens you navigate to from buttons (`router.push("/(member)/apply_loan")`), not from tabs.

Without registering them here, Expo Router would either error or try to add them to the tab bar automatically.

---

## The `useFocusEffect` Pattern

On almost every screen you'll see:

```tsx
useFocusEffect(
  useCallback(() => {
    let active = true;
    api.get("/api/...").then((res) => {
      if (active) setState(res.data.data);
    });
    return () => { active = false; };
  }, []),
);
```

This runs the data fetch **every time you tab to this screen**, not just when the app first loads. The `active` flag prevents updating state on an unmounted component (avoids memory leak warnings and stale data bugs).

**Junior devs often miss:** Without `useCallback`, the effect would re-run on every render instead of just on focus. Without the cleanup `return () => { active = false }`, if the user navigates away before the request finishes, it would try to update state on a screen that's no longer visible.

---

## Senior Tip

The biggest risk in your navigation setup: the `useEffect` that does auth redirects in `_layout.tsx` runs on every change to `[user, isLoading, rulesAccepted, segments]`. If `rulesAccepted` ever flickers between `true` and `false` during a state update, you could get an unwanted redirect loop. Consider debouncing or adding a `isRedirecting` flag if you ever hit that.
