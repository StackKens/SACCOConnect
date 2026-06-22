# app/index.tsx — Entry Point

## What This File Does

```tsx
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/onboarding" />;
}
```

This is the simplest file in your app. When someone opens the app for the very first time (before any session check), this redirects them to onboarding.

**But wait** — doesn't `_layout.tsx` already handle routing?

Yes. This file runs before `_layout.tsx`'s `useEffect` has a chance to fire. React renders synchronously before effects run. So for a brief moment, the app needs to show *something*, and it shows onboarding. Then `checkAuth()` in `_layout.tsx` runs, finds a saved user, and redirects them to the right dashboard.

Think of it like: this file is the **default destination**, and `_layout.tsx` is the **smart redirector** that overrides it when needed.

---

## Why Not Put Logic Here?

Some developers put the auth check here. The problem is that this makes it harder to protect every screen individually. Putting the guard in `_layout.tsx` means *any* screen that ever gets added is automatically protected, because all screens are children of the root layout.

---

## Best Practice

Keep `index.tsx` as a dumb redirect. All smart logic lives in `_layout.tsx`.
