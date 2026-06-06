import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { useLoanStore } from "@/store/loan.store";
import { Inbox } from "lucide-react-native";

export default function ActiveLoans() {
  const { colors } = useTheme();
  const { loans } = useLoanStore();

  const activeLoans = loans.filter((l) => l.status === "approved");

  return (
    <ScreenWrapper header={<PageHeader title="Active Loans" subtitle="Monitor all disbursed loans" />}>
      {activeLoans.length === 0 ? (
        <View style={styles.empty}>
          <Inbox size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active loans yet</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {activeLoans.map((item) => {
            const progress = item.amount > 0 ? item.repaid / item.amount : 0;
            const remaining = item.amount - item.repaid;
            const isComplete = remaining <= 0;
            return (
              <Card key={item.id} style={styles.card}>
                <View style={styles.header}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{item.memberName}</Text>
                  <Badge label={isComplete ? "completed" : "active"} variant={isComplete ? "success" : "warning"} />
                </View>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                <Text style={[styles.purpose, { color: colors.textSecondary }]}>{item.purpose} • {item.term} months</Text>
                <ProgressBar progress={progress} height={6} style={{ marginVertical: 10 }} />
                <View style={styles.progressLabels}>
                  <Text style={[styles.label, { color: colors.success }]}>
                    Repaid: {formatCurrency(item.repaid)}
                  </Text>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Remaining: {formatCurrency(remaining)}
                  </Text>
                </View>
                {item.dueDate && (
                  <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {item.dueDate}</Text>
                )}
              </Card>
            );
          })}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  memberName: { fontSize: 16, fontWeight: "600" },
  amount: { fontSize: 18, fontWeight: "bold", marginBottom: 2 },
  purpose: { fontSize: 12, marginBottom: 4 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, fontWeight: "600" },
  dueDate: { fontSize: 12, marginTop: 6 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});
