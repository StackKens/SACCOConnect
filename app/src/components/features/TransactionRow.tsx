import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
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

function typeLabel(type: TxItem["type"]): string {
  if (type === "CONTRIBUTION") return "Contribution";
  if (type === "LOAN_REPAYMENT") return "Loan Repayment";
  return "Loan Disbursement";
}

interface TransactionRowProps {
  item: TxItem;
}

export const TransactionRow: React.FC<TransactionRowProps> = React.memo(
  ({ item }) => {
    const { colors } = useTheme();
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={[styles.type, { color: colors.text }]}>
              {typeLabel(item.type)}
            </Text>
            {item.reference && (
              <Text style={[styles.reference, { color: colors.textSecondary }]}>
                {item.reference}
              </Text>
            )}
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(item.date)}
            </Text>
            <Text
              style={[
                styles.status,
                {
                  color:
                    item.status === "CONFIRMED"
                      ? colors.success
                      : colors.warning,
                },
              ]}
            >
              {item.status.toLowerCase()}
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              { color: item.amount > 0 ? colors.success : colors.error },
            ]}
          >
            {item.amount > 0 ? "+" : ""}
            {formatCurrency(Math.abs(item.amount))}
          </Text>
        </View>
      </Card>
    );
  },
);

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: { flex: 1 },
  type: { fontSize: 15, fontWeight: "600" },
  reference: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  status: { fontSize: 11, marginTop: 2, fontWeight: "500" },
  amount: { fontSize: 16, fontWeight: "bold" },
});
