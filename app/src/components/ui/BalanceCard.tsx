import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/currency";

interface BalanceCardProps {
  label: string;
  amount: number;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  hint?: string;
  icon?: React.ReactNode;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  label,
  amount,
  delta,
  deltaTone = "neutral",
  hint,
  icon,
}) => {
  const { colors, spacing, radius, typography } = useTheme();

  const deltaColor =
    deltaTone === "positive" ? colors.success : deltaTone === "negative" ? colors.error : colors.textSecondary;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={[typography.caption, { color: colors.textSecondary, letterSpacing: 0.4, textTransform: "uppercase" }]}>
          {label}
        </Text>
        {icon}
      </View>
      <Text style={[typography.display, { color: colors.text, marginTop: spacing.sm, fontVariant: ["tabular-nums"] }]}>
        {formatCurrency(amount)}
      </Text>
      {delta && (
        <Text style={[typography.captionMedium, { color: deltaColor, marginTop: spacing.xs }]}>
          {delta}
        </Text>
      )}
      {hint && (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{hint}</Text>
      )}
    </View>
  );
};
