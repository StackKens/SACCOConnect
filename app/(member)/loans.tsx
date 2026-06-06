import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { router } from "expo-router";

const mockLoans = [
  { id: "1", amount: 50000, repaid: 25000, remaining: 25000, status: "active", nextPayment: "2025-06-15", interestRate: 12 },
  { id: "2", amount: 100000, repaid: 100000, remaining: 0, status: "repaid", nextPayment: null },
  { id: "3", amount: 75000, repaid: 0, remaining: 75000, status: "pending", nextPayment: null },
];

export default function Loans() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper header={<PageHeader title="My Loans" subtitle="Track and manage your loan portfolio" />}>
      <View style={styles.list}>
        {mockLoans.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => item.status === "active" && router.push("/(member)/repay_loan")}
          >
            <Card style={styles.card}>
              <View style={styles.header}>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </Text>
                <Badge
                  label={item.status}
                  variant={item.status === "active" ? "warning" : item.status === "repaid" ? "success" : "info"}
                />
              </View>
              {item.status === "active" && (
                <>
                  <View style={styles.progressRow}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Repaid: {formatCurrency(item.repaid)}
                    </Text>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Remaining: {formatCurrency(item.remaining)}
                    </Text>
                  </View>
                  <Text style={[styles.nextPayment, { color: colors.textSecondary }]}>
                    Next payment due: {item.nextPayment}
                  </Text>
                  <Text style={[styles.interest, { color: colors.textSecondary }]}>
                    Interest: {item.interestRate}% p.a.
                  </Text>
                </>
              )}
              {item.status === "pending" && (
                <Text style={[styles.pendingText, { color: colors.warning }]}>
                  Awaiting approval
                </Text>
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(member)/apply_loan")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 80 },
  card: { marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  amount: { fontSize: 18, fontWeight: "bold" },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  progressLabel: { fontSize: 14 },
  nextPayment: { fontSize: 14, marginTop: 4 },
  interest: { fontSize: 12, marginTop: 2 },
  pendingText: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  fab: { position: "absolute", bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 5 },
  fabText: { fontSize: 32, color: "#FFF", marginTop: -4 },
});
