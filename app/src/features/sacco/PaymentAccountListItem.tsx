import { View, Text, StyleSheet, Switch } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import type { PaymentAccount } from "@/types";
import { paymentAccountTypeLabel } from "./paymentAccount";
import { Landmark, Smartphone } from "lucide-react-native";

interface PaymentAccountListItemProps {
  account: PaymentAccount;
  onToggleActive: (active: boolean) => void;
  onToggleVisible: (visible: boolean) => void;
  activeLabel?: string;
  visibleLabel?: string;
  providerLabel?: string;
  updating?: boolean;
}

export function PaymentAccountListItem({
  account,
  onToggleActive,
  onToggleVisible,
  activeLabel = "Accepting payments",
  visibleLabel = "Show to members",
  providerLabel = "Provider",
  updating = false,
}: PaymentAccountListItemProps) {
  const { colors } = useTheme();
  const Icon = account.type === "BANK" ? Landmark : Smartphone;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        !account.isActive && styles.inactive,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: (colors.successSoft as string) ?? colors.border },
          ]}
        >
          <Icon size={20} color={colors.secondary} />
        </View>
        <View style={styles.identity}>
          <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
            {account.accountName}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {paymentAccountTypeLabel(account.type)} · {account.accountNumber}
          </Text>
          {account.provider ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {providerLabel}: {account.provider}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.toggles}>
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            {activeLabel}
          </Text>
          <Switch
            value={account.isActive}
            onValueChange={onToggleActive}
            disabled={updating}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            {visibleLabel}
          </Text>
          <Switch
            value={account.isMemberVisible}
            onValueChange={onToggleVisible}
            disabled={updating}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  inactive: { opacity: 0.55 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 1 },
  toggles: { marginTop: 12, gap: 4 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  toggleLabel: { fontSize: 14 },
});
