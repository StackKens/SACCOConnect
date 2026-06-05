import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { CheckCircle, Clock } from "lucide-react-native";

interface ContributionItemProps {
  contribution: {
    id: string;
    amount: number;
    date: string;
    status: "pending" | "completed";
    method?: string;
    reference?: string;
  };
  showDetails?: boolean;
}

export const ContributionItem: React.FC<ContributionItemProps> = ({
  contribution,
  showDetails = true,
}) => {
  const { colors } = useTheme();
  const { amount, date, status, method, reference } = contribution;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(amount)}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(date)}
          </Text>
          {showDetails && method && (
            <Text style={[styles.method, { color: colors.textSecondary }]}>
              {method}
            </Text>
          )}
          {showDetails && reference && (
            <Text style={[styles.reference, { color: colors.textSecondary }]}>
              Ref: {reference}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                status === "completed"
                  ? colors.success + "20"
                  : colors.warning + "20",
            },
          ]}
        >
          {status === "completed" ? (
            <CheckCircle size={16} color={colors.success} />
          ) : (
            <Clock size={16} color={colors.warning} />
          )}
          <Text
            style={[
              styles.statusText,
              {
                color: status === "completed" ? colors.success : colors.warning,
              },
            ]}
          >
            {status === "completed" ? "Completed" : "Pending"}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: { flex: 1 },
  amount: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 12, marginTop: 2 },
  method: { fontSize: 12, marginTop: 2 },
  reference: { fontSize: 10, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
});
