# app/(admin)/settings.tsx — Admin Settings

## What This Screen Does

Admin profile display, group settings (edit rules, contribution schedule, all contributions, active loans), dark/dark mode toggles, how-to guide, data export, clear cache, support links, and logout.

---

## Key Patterns

### SACCO Avatar from Initials

```tsx
{sacco.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
```

Same pattern as `GroupAvatar` but inline. `"Kenya Savings SACCO"` → `["Kenya", "Savings"]` → `["K", "S"]` → `"KS"`. This appears in multiple places across the app. A shared `GroupAvatar` component would eliminate this repetition.

---

### Invite Code Display

```tsx
{sacco?.inviteCode && (
  <>
    <Text style={styles.rulesLabel}>Member invite code</Text>
    <Text style={[styles.inviteCode, { color: colors.primary }]}>{sacco.inviteCode}</Text>
    <Text>Share this code so new members can join in the app.</Text>
  </>
)}
```

The invite code is shown prominently (fontSize 28, letterSpacing 4) so the admin can easily read it to a new member. This only renders if `sacco.inviteCode` exists.

---

### Export CSV

```tsx
<Button
  title="Export Data (CSV)"
  onPress={async () => {
    if (!sacco?.id) {
      Alert.alert("Unavailable", "No SACCO data to export.");
      return;
    }
    try {
      await exportSaccoCsv(sacco.id, sacco.name);
    } catch {
      Alert.alert("Export failed", "Could not share the export file.");
    }
  }}
/>
```

`exportSaccoCsv` is in `app/src/helpers/exportData.ts`. It fetches data from the API and creates a shareable CSV file using Expo's sharing API. The guard `if (!sacco?.id)` prevents attempting an export when no SACCO is loaded.

---

### Clear Cache with Confirmation

```tsx
<Button
  title="Clear Cache"
  variant="danger"
  onPress={() => {
    Alert.alert(
      "Clear all local data?",
      "This removes saved members, loans, and preferences from this device.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearAppCache },
      ],
    );
  }}
/>
```

Destructive actions always need a confirmation dialog. The `style: "destructive"` on the button makes it red on iOS. `style: "cancel"` dismisses without action.

`clearAppCache` (from `auth.store.ts`) wipes all MMKV namespaces and resets all Zustand stores. This is a nuclear option for debugging or privacy.

---

### ADMIN_HOW_TO — Static Content Outside Component

```tsx
const ADMIN_HOW_TO = [
  { title: "Approving a Loan", desc: "..." },
  ...
];
```

Defined outside the component so it's created once, not on every render.

---

## Best Practices

✅ Confirmation dialog before destructive action  
✅ Static data outside component  
✅ Guard before export  
✅ Consistent dark/system theme toggles (same as member profile)  
⚠️ Avatar initials computed inline — extract to `GroupAvatar`  
⚠️ Dark mode toggle logic is duplicated between admin settings and member profile — extract to a shared `ThemeSettings` component
