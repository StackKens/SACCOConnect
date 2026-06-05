import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { router } from "expo-router";

const mockContributions = [
  {
    id: "1",
    amount: 5000,
    date: "2025-06-01",
    status: "completed",
    method: "M-Pesa",
  },
  {
    id: "2",
    amount: 5000,
    date: "2025-05-01",
    status: "completed",
    method: "Bank Transfer",
  },
  {
    id: "3",
    amount: 5000,
    date: "2025-04-01",
    status: "completed",
    method: "M-Pesa",
  },
];

export default function Contributions() {
  const { colors } = useTheme();
  const total = mockContributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScreenWrapper>
      <PageHeader title="Savings" subtitle="Your contribution history" />
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
      <View style={styles.list}>
        {mockContributions.map((item) => (
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
