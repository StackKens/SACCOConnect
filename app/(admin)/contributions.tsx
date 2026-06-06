import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

const allContributions = [
  { id: "C1", memberName: "Alice Wanjiku", amount: 5000, date: "2025-06-01", status: "completed", method: "MTN Mobile Money" },
  { id: "C2", memberName: "Bob Omondi", amount: 5000, date: "2025-06-01", status: "completed", method: "Bank Transfer" },
  { id: "C3", memberName: "Catherine Muthoni", amount: 5000, date: "2025-05-28", status: "pending", method: "Airtel Money" },
];

export default function AdminContributions() {
  const { colors } = useTheme();

  const total = allContributions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScreenWrapper header={<PageHeader title="Contributions" subtitle="All member savings contributions" />}>

      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Collected</Text>
        <Text style={[styles.summaryAmount, { color: colors.text }]}>{formatCurrency(total)}</Text>
      </Card>

      <View style={styles.list}>
        {allContributions.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.left}>
                <Text style={[styles.memberName, { color: colors.text }]}>{item.memberName}</Text>
                <Text style={[styles.detail, { color: colors.textSecondary }]}>
                  {formatDate(item.date)} • {item.method}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                <Badge label={item.status} variant={item.status === "completed" ? "success" : "warning"} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  summaryCard: { alignItems: "center", marginBottom: 20 },
  summaryLabel: { fontSize: 14 },
  summaryAmount: { fontSize: 32, fontWeight: "bold", marginTop: 4 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: "600" },
  detail: { fontSize: 12, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 16, fontWeight: "bold" },
});
