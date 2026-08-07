import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Download } from "lucide-react-native";
import { api } from "@/services/api";
import { useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonMemberList } from "@/components/ui/Skeleton";

interface TxItem {
  id: string;
  type: "CONTRIBUTION" | "LOAN_REPAYMENT" | "LOAN_DISBURSEMENT";
  amount: number;
  date: string;
  reference: string | null;
  status: string;
}

export default function Statement() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const [contribRes, loansRes] = await Promise.all([
      api.get("/api/contributions/my"),
      api.get("/api/loans/my"),
    ]);

    const contributions: TxItem[] = contribRes.data.data.map((c: any) => ({
      id: c.id,
      type: "CONTRIBUTION",
      amount: c.amount,
      date: c.createdAt,
      reference: c.transactionRef ?? null,
      status: c.status,
    }));

    const repayments: TxItem[] = loansRes.data.data.flatMap((loan: any) =>
      (loan.repayments ?? []).map((r: any) => ({
        id: r.id,
        type: "LOAN_REPAYMENT",
        amount: -r.amountPaid,
        date: r.paymentDate,
        reference: r.transactionRef ?? null,
        status: "CONFIRMED",
      })),
    );

    const disbursements: TxItem[] = loansRes.data.data
      .filter((l: any) => l.status === "ACTIVE" || l.status === "REPAID")
      .map((l: any) => ({
        id: `disb_${l.id}`,
        type: "LOAN_DISBURSEMENT",
        amount: l.amountApproved ?? l.amountRequested,
        date: l.disbursementDate ?? l.createdAt,
        reference: null,
        status: "CONFIRMED",
      }));

    const all = [...contributions, ...repayments, ...disbursements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(all);
  });

  const typeLabel = (type: TxItem["type"]) => {
    if (type === "CONTRIBUTION") return "Contribution";
    if (type === "LOAN_REPAYMENT") return "Loan Repayment";
    return "Loan Disbursement";
  };

  return (
    <ScreenWrapper scroll header={
      <PageHeader
        title="Statement"
        rightComponent={
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => Alert.alert("Coming Soon", "PDF export will be available in the next release.")}
          >
            <Download size={20} color={colors.primary} />
            <Text style={{ color: colors.primary }}>Export</Text>
          </TouchableOpacity>
        }
      />
    }>
      {loading ? <SkeletonMemberList /> : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" />
      ) : (
        <View style={styles.list}>
          {transactions.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Text style={[styles.type, { color: colors.text }]}>{typeLabel(item.type)}</Text>
                  {item.reference && (
                    <Text style={[styles.reference, { color: colors.textSecondary }]}>{item.reference}</Text>
                  )}
                  <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
                  <Text style={[styles.status, { color: item.status === "CONFIRMED" ? colors.success : colors.warning }]}>
                    {item.status.toLowerCase()}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: item.amount > 0 ? colors.success : colors.error }]}>
                  {item.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(item.amount))}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flex: 1 },
  type: { fontSize: 15, fontWeight: "600" },
  reference: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  status: { fontSize: 11, marginTop: 2, fontWeight: "500" },
  amount: { fontSize: 16, fontWeight: "bold" },
});
