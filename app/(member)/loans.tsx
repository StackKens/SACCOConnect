import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { router } from "expo-router";
import { useMemberDataStore } from "@/store/member.store";
import { Banknote, PlusCircle, ShieldCheck, Clock } from "lucide-react-native";

export default function Loans() {
  const { colors } = useTheme();
  const { loans } = useMemberDataStore();

  return (
    <ScreenWrapper header={<PageHeader title="My Loans" subtitle="Track and manage your loan portfolio" />}>
      <View style={styles.list}>
        {loans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.primary + "12" }]}>
              <Banknote size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No loans yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You have not applied for any loan. Once you do, all your active and past loans will appear here.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <ShieldCheck size={16} color={colors.success} />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Loans up to 3x your savings</Text>
              </View>
              <View style={styles.featureRow}>
                <Clock size={16} color={colors.warning} />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Flexible repayment terms</Text>
              </View>
              <View style={styles.featureRow}>
                <Banknote size={16} color={colors.primary} />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Competitive interest rates</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(member)/apply_loan")}
            >
              <PlusCircle size={18} color="#fff" />
              <Text style={styles.applyBtnText}>Apply for a Loan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          loans.map((item) => (
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
                    variant={
                      item.status === "active"
                        ? "warning"
                        : item.status === "repaid"
                          ? "success"
                          : item.status === "rejected"
                            ? "error"
                            : "info"
                    }
                  />
                </View>
                {item.status === "active" && (
                  <>
                    <View style={styles.progressRow}>
                      <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                        Repaid: {formatCurrency(item.repaid)}
                      </Text>
                      <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                        Remaining: {formatCurrency(item.amount - item.repaid)}
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
                {item.status === "rejected" && (
                  <Text style={[styles.pendingText, { color: colors.error }]}>
                    Rejected{item.rejectNote ? `: ${item.rejectNote}` : ""}
                  </Text>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
      {loans.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(member)/apply_loan")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
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
  emptyContainer: { flex: 1, alignItems: "center", paddingTop: 48, paddingHorizontal: 24 },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  emptySubtitle: { fontSize: 14, lineHeight: 22, textAlign: "center", marginBottom: 24 },
  featureList: { width: "100%", gap: 12, marginBottom: 32 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 14 },
  applyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  applyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
