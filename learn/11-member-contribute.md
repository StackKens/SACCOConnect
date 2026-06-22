# app/(member)/contribute.tsx — Make a Contribution

## What This Screen Does

Lets a member choose a payment method (MTN, Airtel, Bank Transfer), enter their phone or account number, and submit the contribution — with offline queueing support.

---

## Key Patterns

### Dynamic Payment Method UI

```tsx
type PaymentMethod = "MTN" | "Airtel" | "Bank";

const METHODS: { key: PaymentMethod; label: string; apiValue: string }[] = [
  { key: "MTN", label: "MTN Mobile Money", apiValue: "MOBILE_MONEY" },
  { key: "Airtel", label: "Airtel Money", apiValue: "MOBILE_MONEY" },
  { key: "Bank", label: "Bank Transfer", apiValue: "BANK_TRANSFER" },
];
```

The `METHODS` array drives the button rendering:

```tsx
{METHODS.map((m) => (
  <Button
    key={m.key}
    title={m.label}
    variant={method === m.key ? "primary" : "outline"}
    onPress={() => setMethod(m.key)}
  />
))}
```

Selected method gets `variant="primary"` (filled), others get `"outline"`. This is a **radio-button-as-buttons** pattern.

The `apiValue` field maps display names to backend enum values. `"MTN"` and `"Airtel"` both map to `"MOBILE_MONEY"` because the backend doesn't distinguish between mobile providers.

---

### Conditional Form Fields

```tsx
const isMobile = method === "MTN" || method === "Airtel";

{isMobile && (
  <Input label="MTN/Airtel Mobile Money Number" ... />
)}

{method === "Bank" && (
  <Input label="Bank Account Number" ... />
)}
```

Different payment methods need different information. `isMobile` is a derived boolean, computed fresh each render from `method`. No need to store it in state.

---

### The Offline Queue — Most Important Pattern Here

```tsx
const NetInfo = require("@react-native-community/netinfo").default;
const net = await NetInfo.fetch();

if (!net.isConnected) {
  enqueue({ endpoint: "/api/contributions", method: "POST", body });
  Alert.alert("Saved Offline", "...");
  return;
}

await api.post("/api/contributions", body);
```

**Why `require()` instead of `import`?**
`import` is static — it runs at the top of the file when the module loads. `require()` is dynamic — it runs when this line is executed. Some React Native packages (especially ones using native modules) don't play nice with static imports in certain contexts. This is a common workaround.

**The flow:**
1. Check if connected
2. If offline → save action to MMKV queue (`enqueue`)
3. When the phone reconnects, `startQueueListener()` in `_layout.tsx` fires `flushQueue()`, which replays all saved actions

This is called the **Offline Queue / Outbox pattern** — you never lose the user's action, you just delay it.

---

### addContribution to Local Store

```tsx
await api.post("/api/contributions", body);
addContribution(numAmount, selectedMethod.label);  // update local store too
```

After the API succeeds, you also update the local Zustand store. This means the Savings tab immediately shows the new contribution without waiting for a fresh API fetch. **Optimistic-style** local update after confirmed server update.

---

## Best Practices

✅ Method-driven dynamic UI  
✅ Offline queue for critical financial actions  
✅ Local store update after API success  
✅ Derived booleans (`isMobile`) instead of storing redundant state  
⚠️ The `require()` pattern works but is uncommon — consider adding `@react-native-community/netinfo` as a proper import now that Expo supports it
