# app/(member)/profile.tsx — Profile & Settings Screen

## What This Screen Does

Shows the member's profile, theme controls (dark/light/system), how-to guides, support links, legal documents in a bottom sheet modal, and a logout button.

---

## Key Patterns

### Theme Toggle Logic

```tsx
const [darkMode, setDarkMode] = useState(isDark);
const [useSystem, setUseSystem] = useState(theme === "system");

useEffect(() => { setDarkMode(isDark); }, [isDark]);
```

There are two switches: "Dark Mode" and "Use System Theme". They're linked:
- If you enable "Use System Theme", the dark mode switch should be disabled (greyed out)
- If you manually toggle dark mode, "Use System Theme" should turn off

```tsx
const handleDarkModeToggle = (val: boolean) => {
  setDarkMode(val);
  setTheme(val ? "dark" : "light");
  setUseSystem(false);  // turning off system mode
};

const handleSystemToggle = (val: boolean) => {
  setUseSystem(val);
  setTheme(val ? "system" : isDark ? "dark" : "light");
};
```

The `<Switch value={darkMode} disabled={useSystem} />` greys out the dark mode toggle when system mode is on. This prevents conflicting states.

---

### Bottom Sheet Modal for Legal Documents

```tsx
const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

<Modal visible={legalModal !== null} transparent animationType="slide" ...>
  <View style={styles.modalOverlay}>
    <View style={styles.modalSheet}>
      <Text>{legalModal === "privacy" ? PRIVACY_POLICY : TERMS_OF_SERVICE}</Text>
    </View>
  </View>
</Modal>
```

One `Modal` component handles both Privacy Policy and Terms of Service. The `legalModal` state holds either `"privacy"`, `"terms"`, or `null`. When null, the modal is hidden. When set, it shows the appropriate text.

`animationType="slide"` makes it slide up from the bottom. `transparent` makes the overlay background dark instead of white. The `borderTopLeftRadius: 20` and `borderTopRightRadius: 20` give it the "bottom sheet" appearance.

---

### Static Data as Constants

```tsx
const HOW_TO_USE = [
  { title: "Making a Contribution", desc: "Go to Savings and tap..." },
  { title: "Applying for a Loan", desc: "Go to Loans and tap..." },
  // ...
];
```

The how-to guide is static — it never changes. Defining it as a constant outside the component means it's not recreated on every render. If it were inside the component, React would create a new array in memory on every single render.

---

### Deep Linking to Phone and Email

```tsx
<TouchableOpacity onPress={() => Linking.openURL("mailto:support@saccoconnect.ug")}>
  <Text>Email Support</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => Linking.openURL("tel:+256800100200")}>
  <Text>Call Support Line</Text>
</TouchableOpacity>
```

`Linking.openURL` is React Native's way to open external apps. `mailto:` opens the email app. `tel:` opens the phone dialler. Both are standard URI schemes that work on iOS and Android.

---

### Logout

```tsx
<Button title="Logout" onPress={logout} variant="danger" />
```

`logout` from `useAuthStore` clears the token, clears MMKV, resets all stores, and sets `user` to null. Setting `user` to null triggers the auth guard in `_layout.tsx`, which then redirects to onboarding. The actual navigation happens automatically — you don't need `router.replace` here.

---

## Best Practices

✅ Linked toggle states prevent invalid combinations  
✅ Static constants defined outside component  
✅ Single modal handles multiple legal documents  
✅ Logout triggers reactive navigation via state change  
⚠️ Privacy policy and Terms of Service are hardcoded strings — in production, these should come from the backend or a CMS so you can update them without a new app release
