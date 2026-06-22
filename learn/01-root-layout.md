# app/_layout.tsx — Root Layout (The Gatekeeper)

## What This File Does

This is the **first file Expo Router runs**. Every screen in your app is wrapped inside this layout. Think of it as the security guard at the door — it decides who gets in and where they go.

---

## Line-by-Line Breakdown

### The ThemeUpdater Component

```tsx
function ThemeUpdater() {
  const updateEffectiveTheme = useUIStore((state) => state.updateEffectiveTheme);
  useEffect(() => {
    updateEffectiveTheme();
  }, []);
  return null;
}
```

This is a **headless component** — it renders nothing (`return null`) but runs side effects. The reason it's a separate component instead of just a `useEffect` inside `RootLayout` is that it needs to call a Zustand store hook, and it's cleaner to isolate it. It runs once when the app starts to set the correct light/dark theme.

**Pattern used:** Headless/side-effect-only component.

---

### The Auth Guard

```tsx
useEffect(() => {
  if (isLoading) return;       // wait until we know if user is logged in
  
  const group = segments[0];   // which screen group are they on?
  const inAuthGroup = group === "(auth)";

  if (!user) {
    if (!inAuthGroup) router.replace("/(auth)/onboarding");
    return;
  }
  // ... role checks
}, [user, isLoading, rulesAccepted, segments]);
```

`segments` is an array of the current URL path broken into pieces. If the user is on `/(member)/contributions`, then `segments[0]` is `"(member)"`.

The guard runs whenever `user`, `isLoading`, `rulesAccepted`, or `segments` changes. The order of the `if` checks matters — it always checks "is loading?" first, otherwise it would redirect before knowing if the user is logged in.

---

### The Loading State

```tsx
if (isLoading) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.loading}>
          <LoadingSpinner />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

While `checkAuth()` is reading from MMKV storage, `isLoading` is `true`. You show a spinner instead of letting the app flash the onboarding screen for a split second before redirecting to the dashboard. This is called **preventing a flash of unauthenticated content (FOUC)**.

---

### GestureHandlerRootView and SafeAreaProvider

```tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  <SafeAreaProvider>
```

- `GestureHandlerRootView` is required by `react-native-gesture-handler`. All gesture-based interactions (swipes, drags) won't work without this wrapping the entire app.
- `SafeAreaProvider` tells all child components about the device's safe area (notch, status bar, home indicator). Without it, content can get cut off under the notch on iPhones.
- `style={{ flex: 1 }}` makes the container fill the full screen. Without this, gestures on an Android device can silently fail.

---

### The Stack Navigator

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(member)" />
  <Stack.Screen name="(admin)" />
</Stack>
```

`headerShown: false` hides the default navigation header globally. You build your own headers in each screen using `PageHeader`. This gives you full control over the look.

Each `Stack.Screen name` corresponds to a file or folder. `(auth)`, `(member)`, and `(admin)` are folders — Expo Router picks up their `_layout.tsx` automatically.

---

### startQueueListener

```tsx
useEffect(() => {
  checkAuth();
  startQueueListener();
}, []);
```

This starts listening for network reconnections once at app boot. When the phone comes back online, it automatically submits any contributions or repayments that were saved while offline. This runs once with an empty dependency array `[]`.

---

## What a Junior Dev Often Misses

- The `[]` dependency array in `useEffect` means "run once on mount". Adding dependencies incorrectly causes infinite loops.
- `router.replace` vs `router.push` — replace doesn't let the user press back, which is exactly what you want for auth redirects.
- The `segments` array can be empty briefly during navigation transitions, so the guard needs to handle that gracefully.

---

## Best Practices Applied Here

✅ Auth guard in root layout — one single place to enforce all routing rules  
✅ Loading state prevents screen flash  
✅ Side effects isolated from render logic  
✅ Offline queue started at app boot, not per-screen
