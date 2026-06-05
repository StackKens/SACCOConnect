import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Download } from "lucide-react-native";

const mockTransactions = [
  { id: "1", type: "contribution", amount: 5000, date: "2025-06-01", reference: "CONT-001", status: "completed" },
  { id: "2", type: "loan_repayment", amount: -2000, date: "2025-05-15", reference: "REPAY-001", status: "completed" },
  { id: "3", type: "loan_disbursement", amount: 50000, date: "2025-05-01", reference: "LOAN-001", status: "completed" },
  { id: "4", type: "contribution", amount: 5000, date: "2025-05-01", reference: "CONT-002", status: "completed" },
];

export default function Statement() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <PageHeader title="Statement" style={{ marginBottom: 0 }} />
        <TouchableOpacity style={styles.exportBtn}>
          <Download size={24} color={colors.primary} />
          <Text style={{ color: colors.primary }}>Export PDF</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        {mockTransactions.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.left}>
                <Text style={[styles.type, { color: colors.text }]}>
                  {item.type.replace(/_/g, " ").toUpperCase()}
                </Text>
                <Text style={[styles.reference, { color: colors.textSecondary }]}>
                  {item.reference}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {formatDate(item.date)}
                </Text>
              </View>
              <Text style={[styles.amount, { color: item.amount > 0 ? colors.success : colors.error }]}>
                {item.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(item.amount))}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flex: 1 },
  type: { fontSize: 16, fontWeight: "600" },
  reference: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "bold" },
});
