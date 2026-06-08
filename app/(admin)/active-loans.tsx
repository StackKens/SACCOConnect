import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Inbox } from "lucide-react-native";
import { api } from "@/services/api";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { SkeletonLoanQueue } from "@/components/ui/Skeleton";

interface ActiveLoan {
  id: string;
  amountApproved: number;
  amountRepaid: number;
  purpose: string;
  repaymentMonths: number;
  expectedCompletion: string | null;
  member: { fullName: string };
}

export default function ActiveLoans() {
  const { colors } = useTheme();
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api.get("/api/loans/active")
        .then((res) => { if (active) setLoans(res.data.data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []),
  );

  return (
    <ScreenWrapper header={<PageHeader title="Active Loans" subtitle="Monitor all disbursed loans" />}>
      {loading ? (
        <SkeletonLoanQueue />
      ) : loans.length === 0 ? (
        <View style={styles.empty}>
          <Inbox size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active loans yet</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {loans.map((item) => {
            const progress = item.amountApproved > 0 ? item.amountRepaid / item.amountApproved : 0;
            const remaining = item.amountApproved - item.amountRepaid;
            return (
              <Card key={item.id} style={styles.card}>
                <View style={styles.header}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{item.member.fullName}</Text>
                  <Badge label={remaining <= 0 ? "completed" : "active"} variant={remaining <= 0 ? "success" : "warning"} />
                </View>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amountApproved)}</Text>
                <Text style={[styles.purpose, { color: colors.textSecondary }]}>{item.purpose} • {item.repaymentMonths} months</Text>
                <ProgressBar progress={progress} height={6} style={{ marginVertical: 10 }} />
                <View style={styles.progressLabels}>
                  <Text style={[styles.label, { color: colors.success }]}>Repaid: {formatCurrency(item.amountRepaid)}</Text>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Remaining: {formatCurrency(remaining)}</Text>
                </View>
                {item.expectedCompletion && (
                  <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {formatDate(item.expectedCompletion)}</Text>
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
