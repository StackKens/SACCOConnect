import React from "react";
import { View, Text } from "react-native";
import { ArrowDownCircle, ArrowUpCircle, Landmark } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

export interface TxItem {
  id: string;
  type: "CONTRIBUTION" | "LOAN_REPAYMENT" | "LOAN_DISBURSEMENT";
  amount: number;
  date: string;
  reference: string | null;
  status: string;
}

export type TxStatus = "CONFIRMED" | "PENDING" | "FAILED" | "CANCELLED";

function typeMeta(type: TxItem["type"]) {
  if (type === "CONTRIBUTION") return { label: "Contribution", Icon: ArrowUpCircle, tone: "success" as const };
  if (type === "LOAN_REPAYMENT") return { label: "Loan Repayment", Icon: ArrowDownCircle, tone: "error" as const };
  return { label: "Loan Disbursement", Icon: Landmark, tone: "info" as const };
}

function statusMeta(status: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "CONFIRMED") return { label: "Completed", tone: "success" as const };
  if (s === "PENDING") return { label: "Pending", tone: "warning" as const };
  if (s === "FAILED") return { label: "Failed", tone: "error" as const };
  return { label: s.toLowerCase() || "Unknown", tone: "info" as const };
}

interface TransactionRowProps {
  item: TxItem;
  last?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = React.memo(({ item, last }) => {
  const { colors, spacing, radius, typography } = useTheme();
  const { label, Icon, tone } = typeMeta(item.type);
  const status = statusMeta(item.status);
  const positive = item.amount > 0;
  const iconBg = colors[`${tone}Soft`] as string;
  const iconColor = colors[tone];

  const amountColor = positive ? colors.success : colors.text;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: iconBg, alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={iconColor} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
            {label}
          </Text>
          <View style={{ backgroundColor: colors[`${status.tone}Soft`] as string, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill }}>
            <Text style={[typography.micro, { color: colors[status.tone], textTransform: "capitalize" }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {formatDate(item.date)}
          {item.reference ? ` · ${item.reference}` : ""}
        </Text>
      </View>
      <Text style={[typography.bodyMedium, { color: amountColor, fontVariant: ["tabular-nums"] }]}>
        {positive ? "+" : "−"}
        {formatCurrency(Math.abs(item.amount))}
      </Text>
    </View>
  );
});
