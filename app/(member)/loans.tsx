import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { router } from "expo-router";
import { Banknote, PlusCircle, ShieldCheck, Clock } from "lucide-react-native";
import { api } from "@/services/api";
import { useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";
import { SkeletonLoanQueue } from "@/components/ui/Skeleton";

interface Loan {
  id: string;
  amountRequested: number;
  amountApproved: number | null;
  amountRepaid: number;
  status: string;
  purpose: string;
  interestRate: number;
  repaymentMonths: number;
  expectedCompletion: string | null;
  rejectionReason: string | null;
}

export default function Loans() {
  const { colors } = useTheme();
  const [loans, setLoans] = useState<Loan[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/loans/my");
    setLoans(res.data.data);
  });

  const statusVariant = (status: string) => {
    if (status === "ACTIVE") return "warning";
    if (status === "REPAID") return "success";
    if (status === "REJECTED") return "error";
    return "info";
  };

  return (
    <ScreenWrapper header={<PageHeader title="My Loans" subtitle="Track and manage your loan portfolio" />} refreshing={loading} onRefresh={refresh}>
      {loading ? (
        <SkeletonLoanQueue />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : loans.length === 0 ? (
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
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(member)/apply_loan")}>
            <PlusCircle size={18} color="#fff" />
            <Text style={styles.applyBtnText}>Apply for a Loan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {loans.map((item) => {
            const amount = item.amountApproved ?? item.amountRequested;
            const remaining = amount - item.amountRepaid;
            return (
              <TouchableOpacity key={item.id} onPress={() => item.status === "ACTIVE" && router.push("/(member)/repay_loan")}>
                <Card style={styles.card}>
                  <View style={styles.header}>
                    <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(amount)}</Text>
                    <Badge label={item.status.replace(/_/g, " ").toLowerCase()} variant={statusVariant(item.status)} />
                  </View>
                  <Text style={[styles.purpose, { color: colors.textSecondary }]}>{item.purpose}</Text>
                  {item.status === "ACTIVE" && (
                    <>
                      <View style={styles.progressRow}>
                        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Repaid: {formatCurrency(item.amountRepaid)}</Text>
                        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Remaining: {formatCurrency(remaining)}</Text>
                      </View>
                      {item.expectedCompletion && (
                        <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {formatDate(item.expectedCompletion)}</Text>
                      )}
                      <Text style={[styles.interest, { color: colors.textSecondary }]}>Interest: {item.interestRate}% p.a.</Text>
                    </>
                  )}
                  {["PENDING", "AWAITING_GUARANTORS", "UNDER_REVIEW"].includes(item.status) && (
                    <Text style={[styles.pendingText, { color: colors.warning }]}>Awaiting approval</Text>
                  )}
                  {item.status === "REJECTED" && (
                    <Text style={[styles.pendingText, { color: colors.error }]}>
                      Rejected{item.rejectionReason ? `: ${item.rejectionReason}` : ""}
                    </Text>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push("/(member)/apply_loan")}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 80 },
  card: { marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  amount: { fontSize: 18, fontWeight: "bold" },
  purpose: { fontSize: 13, marginBottom: 6 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  progressLabel: { fontSize: 13 },
  dueDate: { fontSize: 13, marginTop: 4 },
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
