import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";

const activeLoansData = [
  { id: "L1", member: "Alice Wanjiku", amount: 50000, repaid: 20000, status: "active", dueDate: "2025-07-15" },
  { id: "L2", member: "Bob Omondi", amount: 30000, repaid: 30000, status: "completed", dueDate: "2025-05-10" },
];

export default function ActiveLoans() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper header={<PageHeader title="Active Loans" subtitle="Monitor all disbursed loans" />}>
      <View style={styles.list}>
        {activeLoansData.map((item) => {
          const progress = item.repaid / item.amount;
          return (
            <Card key={item.id} style={styles.card}>
              <View style={styles.header}>
                <Text style={[styles.memberName, { color: colors.text }]}>{item.member}</Text>
                <Badge label={item.status} variant={item.status === "active" ? "warning" : "success"} />
              </View>
              <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
              <ProgressBar progress={progress} height={8} />
              <View style={styles.progressLabels}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Repaid: {formatCurrency(item.repaid)}
                </Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Remaining: {formatCurrency(item.amount - item.repaid)}
                </Text>
              </View>
              <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {item.dueDate}</Text>
            </Card>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  memberName: { fontSize: 16, fontWeight: "600" },
  amount: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  label: { fontSize: 12 },
  dueDate: { fontSize: 12, marginTop: 6 },
});
