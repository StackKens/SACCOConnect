import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Download } from "lucide-react-native";
import { api } from "@/services/api";
import { useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonMemberList } from "@/components/ui/Skeleton";
import { TransactionRow, TxItem } from "@/components/features/TransactionRow";

function buildCsv(transactions: TxItem[]): string {
  const header = "Date,Type,Description,Reference,Amount (UGX),Status";
  const rows = transactions.map((t) => {
    const date = t.date?.slice(0, 10) ?? "";
    const amount = Math.abs(t.amount).toFixed(2);
    const ref = t.reference ?? "";
    const desc =
      t.type === "CONTRIBUTION"
        ? "Contribution"
        : t.type === "LOAN_REPAYMENT"
        ? "Loan repayment"
        : t.type === "LOAN_DISBURSEMENT"
        ? "Loan disbursement"
        : t.type;
    const refEscaped = `"${ref.replace(/"/g, '""')}"`;
    return [date, t.type, `"${desc}"`, refEscaped, amount, t.status].join(",");
  });
  return [header, ...rows].join("\n");
}

export default function Statement() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async () => {
    if (transactions.length === 0) {
      Alert.alert("Nothing to export", "There are no transactions yet.");
      return;
    }
    setExporting(true);
    try {
      const csv = buildCsv(transactions);
      await Share.share({
        message: csv,
        title: "SACCOConnect Statement",
      });
    } catch {
      Alert.alert("Export failed", "Could not generate the statement. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenWrapper scroll refreshing={loading} onRefresh={refresh} header={
      <PageHeader
        title="Statement"
        showBack
        onBack={() => router.back()}
        rightComponent={
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExport}
            disabled={exporting}
            accessibilityRole="button"
            accessibilityLabel="Export statement as CSV"
          >
            <Download size={20} color={colors.primary} />
            <Text style={{ color: colors.primary }}>{exporting ? "Preparing..." : "Export"}</Text>
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
            <TransactionRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  list: { paddingBottom: 20 },
});
