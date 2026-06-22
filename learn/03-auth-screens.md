# app/(auth)/ — Authentication Screens

## The Auth Group

The `(auth)` folder contains all screens a user sees **before** they are logged in. The `_layout.tsx` here is minimal:

```tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

It uses a `<Stack>` navigator — screens slide in and out. No tab bar here because the user is just going through a signup/login flow, not navigating between app sections.

---

# onboarding.tsx — The Welcome Screen

## What It Does

The first screen new users see. Three buttons: Create a SACCO, Join a SACCO, or Log In.

## Key Things to Learn

### Static Navigation

```tsx
<Button onPress={() => router.push("/(auth)/register-admin" as any)} />
```

The `as any` cast is a TypeScript workaround — Expo Router's type system sometimes doesn't recognise dynamic route strings perfectly. Not ideal but common in practice.

### No State, No API Calls

This screen has zero state. It just shows content and navigates. That's the right pattern for a landing screen — keep it simple and fast.

### `ScreenWrapper` Component

```tsx
<ScreenWrapper scroll={false}>
```

This is your own shared component that handles safe area padding, scroll behaviour, and consistent background colour. Every screen uses it. This is the **Wrapper/Layout Component pattern** — instead of repeating `<SafeAreaView style={{flex:1, backgroundColor: colors.background}}>` on every screen, you extracted it.

---

# login.tsx — Login Screen

## What It Does

Phone number + 4-digit PIN login. Calls the backend, gets a JWT token, saves it, then routes to the correct dashboard.

## Key Things to Learn

### Local State for Form

```tsx
const [phone, setPhone] = useState("");
const [pin, setPin] = useState("");
const [loading, setLoading] = useState(false);
```

These three are the standard form state pattern: the input values, and a loading flag for the button.

### Reading State After an Async Action

```tsx
await login(phone.trim(), pin);
const { user: loggedInUser } = useAuthStore.getState(); // read fresh state
if (loggedInUser?.role === "admin") {
  router.replace("/(admin)");
}
```

This is non-obvious. After `await login(...)`, the Zustand store has been updated with the user. But the component's local `user` variable (from `useAuthStore`) might not have re-rendered yet. So you call `useAuthStore.getState()` directly — this reads the **current store value synchronously** without waiting for a re-render. Junior devs often use `user` from the top of the component here, which can be stale.

### PIN Length Enforcement

```tsx
onChangeText={(v) => { if (v.length <= 4) setPin(v); }}
```

The `if (v.length <= 4)` guard prevents the user from typing more than 4 characters. Combined with `maxLength={4}` on the Input, this is defensive — `maxLength` handles the UI, but the guard handles cases where text is pasted.

---

# register-admin.tsx — Multi-Step SACCO Creation

## What It Does

An admin registers by going through 5 steps: phone → OTP verification → personal details → SACCO details → review & submit.

## Key Things to Learn

### Step-Based Form (Wizard Pattern)

```tsx
type Step = "phone" | "otp" | "personal" | "sacco" | "review";
const [step, setStep] = useState<Step>("phone");
```

Instead of showing all fields at once (overwhelming), you split the form into named steps. TypeScript's union type `"phone" | "otp" | ...` means `step` can only ever be one of those exact strings — if you typo it, TypeScript catches it at compile time.

```tsx
{step === "phone" && ( ... )}
{step === "otp" && ( ... )}
```

Each step conditionally renders. Only one is shown at a time. This is called a **Wizard / Stepper pattern**.

### All State Lives at the Top

All 15+ form fields are declared at the top of the component. This is called **lifting state up**. Even though the `sacco` step only needs `saccoName`, `contribution`, etc., those values need to survive when the user moves to the review step. If state lived inside each step, it would reset.

### Validation Before Moving Steps

```tsx
const handlePersonalNext = () => {
  if (!fullName.trim()) return Alert.alert("Required", "Enter your full name.");
  if (pin.length < 4) return Alert.alert("PIN too short", "PIN must be 4 digits.");
  if (pin !== confirmPin) return Alert.alert("PIN mismatch", "PINs do not match.");
  setStep("sacco");
};
```

Validation happens at each step transition, not just at submit. Users get feedback immediately instead of finding out at the end that step 2 had an error.

---

# join.tsx — Join a SACCO

## What It Does

A new member enters an invite code, verifies their phone, enters their details, creates a PIN, and joins the SACCO.

## Key Things to Learn

### Invite Code Lookup Flow

```tsx
const handleLookup = async () => {
  const result = await lookupInviteCode(code);
  setInvite(result);       // save the SACCO preview
  setStep("confirm");      // show SACCO info before committing
};
```

Before the user enters any personal details, they see the SACCO they're about to join (name, contribution amount, admin name). This is a **confirmation step** — a UX best practice. Don't let users commit to something without showing them what they're committing to.

### `.toUpperCase()` on Input

```tsx
onChangeText={(v) => setCode(v.toUpperCase())}
```

Invite codes are uppercase. Rather than asking the user to type in caps, you transform automatically. Small detail, big UX improvement.

### Welcome Screen Instead of Immediate Redirect

```tsx
if (step === "welcome" && invite) {
  return (
    <View>
      <Text>You have joined {invite.saccoName}!</Text>
      <Button title="Go to Dashboard" onPress={() => router.replace("/(member)")} />
    </View>
  );
}
```

Instead of silently redirecting, you show a congratulations screen. This gives the user a moment of satisfaction and confirms the action worked.

---

# group-rules.tsx — Accept Group Rules

## What It Does

After joining (for the first time), members must read and agree to the SACCO's rules before accessing their dashboard. The continue button is disabled until they check the checkbox.

## Key Things to Learn

### Gated Continue Button

```tsx
const [agreed, setAgreed] = useState(false);

const handleAccept = () => {
  if (!agreed) return;  // do nothing if not checked
  acceptRules();
  router.replace("/(member)");
};

<Button
  style={[styles.btn, !agreed && { opacity: 0.45 }]}
/>
```

The button is visually dimmed (opacity 0.45) when not agreed, and the `handleAccept` function exits early if `agreed` is false. Two layers of protection. Some developers only do one — visual only, or functional only. You did both.

### `acceptRules()` Persists to MMKV

```tsx
acceptRules: () => {
  const { user } = get();
  if (user) storage.set(`rules_accepted_${user.id}`, true);
  set({ rulesAccepted: true });
},
```

Rules acceptance is saved per-user with a unique key. If two people use the same phone, they each need to accept rules separately.

### GroupAvatar — Inline Utility Component

```tsx
function GroupAvatar({ name, color, size = 72 }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return <View ...><Text>{initials}</Text></View>;
}
```

This generates initials from a name. `"Kenya Savings Group"` → `"KS"`. `slice(0, 2)` takes only the first two words. The `?.` optional chaining on `w[0]` handles edge cases where a word might be empty. This same component appears in multiple screens.

**Best practice:** this should be extracted to `app/src/components/ui/GroupAvatar.tsx` to avoid duplication. It's defined locally in `group-rules.tsx` and again in `group_rules.tsx` (member side).

---

## Best Practices for the Auth Flow

✅ OTP verification before registration — prevents fake phone numbers  
✅ Wizard pattern breaks long forms into manageable steps  
✅ Confirmation screens before irreversible actions  
✅ Type unions for step names — TypeScript catches typos  
⚠️ `GroupAvatar` is duplicated — extract to a shared component  
⚠️ The `as any` cast in onboarding.tsx — consider using typed route constants
