import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { dueDateLabel, formatDate } from "@/utils/date";
import { router } from "expo-router";
import { useMemberDataStore } from "@/store/member.store";
import { useAuthStore } from "@/store/auth.store";

export default function Contributions() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const { contributions, totalSavings } = useMemberDataStore();
  const total = totalSavings();
  const dueDate = sacco?.contributionDueDate;
  const dueLabel = dueDate ? dueDateLabel(dueDate) : null;
  const isOverdue = dueLabel?.startsWith("Overdue");

  return (
    <ScreenWrapper header={<PageHeader title="Savings" subtitle="Your contribution history" />}>
      <Card style={styles.totalCard}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
          Total Saved
        </Text>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          {formatCurrency(total)}
        </Text>
        <Button
          title="Make Contribution"
          onPress={() => router.push("/(member)/contribute")}
          variant="secondary"
          style={styles.contributeBtn}
        />
      </Card>

      {dueDate && (
        <Card style={[styles.dueCard, isOverdue && { borderColor: colors.error + "55", borderWidth: 1 }]}>
          <Text style={[styles.dueTitle, { color: colors.text }]}>Monthly due date</Text>
          <Text style={[styles.dueDate, { color: isOverdue ? colors.error : colors.primary }]}>
            {formatDate(dueDate)}
          </Text>
          <Text style={[styles.dueSub, { color: colors.textSecondary }]}>
            {dueLabel} · Pay UGX {sacco?.contributionAmount?.toLocaleString() ?? "—"} by this date
          </Text>
        </Card>
      )}

      <View style={styles.list}>
        {contributions.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {formatDate(item.date)}
                </Text>
                <Text style={[styles.method, { color: colors.textSecondary }]}>
                  {item.method}
                </Text>
              </View>
              <View style={[styles.status, { backgroundColor: colors.success + "20" }]}>
                <Text style={[styles.statusText, { color: colors.success }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  totalCard: { marginBottom: 20, alignItems: "center" },
  totalLabel: { fontSize: 14 },
  totalAmount: { fontSize: 32, fontWeight: "bold", marginTop: 8 },
  contributeBtn: { marginTop: 16, alignSelf: "stretch" },
  dueCard: { marginBottom: 16 },
  dueTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  dueDate: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  dueSub: { fontSize: 13, lineHeight: 18 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 14, marginTop: 4 },
  method: { fontSize: 12, marginTop: 2 },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "600" },
});
