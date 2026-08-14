import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import type { AccountType } from "@/types";
import { Landmark, Smartphone } from "lucide-react-native";
import {
  paymentAccountNumberLabel,
  paymentAccountProviderPlaceholder,
  paymentAccountTypeHint,
  validateAccountNumber,
} from "./paymentAccount";

export interface PaymentAccountDraft {
  type: AccountType;
  accountNumber: string;
  accountName: string;
  provider: string;
}

interface PaymentAccountFormProps {
  value: PaymentAccountDraft;
  onChange: (value: PaymentAccountDraft) => void;
  accountNameLabel?: string;
}

export function PaymentAccountForm({
  value,
  onChange,
  accountNameLabel = "Account Name",
}: PaymentAccountFormProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const validationError = validateAccountNumber(
    value.type,
    value.accountNumber,
  );

  const typeRows: {
    value: AccountType;
    icon: React.ReactNode;
  }[] = [
    { value: "MOBILE_MONEY", icon: <Smartphone size={20} color={colors.text} /> },
    { value: "BANK", icon: <Landmark size={20} color={colors.text} /> },
  ];

  return (
    <View>
      <Text style={[typography.captionMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
        Account Type
      </Text>
      {typeRows.map((row) => (
        <Pressable
          key={row.value}
          accessibilityRole="radio"
          accessibilityLabel={row.value === "BANK" ? "Bank Account" : "Mobile Money"}
          accessibilityState={{ selected: value.type === row.value }}
          onPress={() =>
            onChange({ ...value, type: row.value })
          }
          style={({ pressed }) => [
            {
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              padding: spacing.md,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: value.type === row.value ? colors.secondary : colors.border,
              backgroundColor:
                value.type === row.value ? (colors.successSoft as string) : colors.surface,
              marginBottom: spacing.sm,
            },
            pressed && { opacity: 0.8 },
          ]}
        >
          {row.icon}
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>
              {row.value === "BANK" ? "Bank Account" : "Mobile Money"}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {paymentAccountTypeHint(row.value)}
            </Text>
          </View>
        </Pressable>
      ))}

      <Input
        label={accountNameLabel}
        value={value.accountName}
        onChangeText={(v) => onChange({ ...value, accountName: v })}
        autoCapitalize="words"
        placeholder="e.g. Kampala Unity SACCO"
      />

      <Input
        label={paymentAccountNumberLabel(value.type)}
        value={value.accountNumber}
        onChangeText={(v) => onChange({ ...value, accountNumber: v })}
        keyboardType={value.type === "MOBILE_MONEY" ? "phone-pad" : "default"}
        error={value.accountNumber.length > 0 && validationError ? validationError : undefined}
        placeholder={
          value.type === "BANK"
            ? "e.g. 1001234567890"
            : "e.g. 0772000123"
        }
      />

      <Input
        label="Provider (optional)"
        value={value.provider}
        onChangeText={(v) => onChange({ ...value, provider: v })}
        autoCapitalize="words"
        placeholder={paymentAccountProviderPlaceholder(value.type)}
      />
    </View>
  );
}
