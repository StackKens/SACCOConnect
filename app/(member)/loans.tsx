import { View, Text, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { NotificationsButton } from "@/components/ui/NotificationsButton";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { router } from "expo-router";
import { Banknote, HandCoins } from "lucide-react-native";
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

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" }> = {
  ACTIVE: { label: "Active", variant: "info" },
  REPAID: { label: "Repaid", variant: "success" },
  REJECTED: { label: "Rejected", variant: "error" },
  PENDING: { label: "Pending", variant: "warning" },
  AWAITING_GUARANTORS: { label: "Awaiting guarantors", variant: "warning" },
  UNDER_REVIEW: { label: "Under review", variant: "warning" },
};

function statusOf(status: string) {
  return STATUS_LABEL[status] ?? { label: status.replace(/_/g, " ").toLowerCase(), variant: "info" as const };
}

export default function Loans() {
  const { colors, spacing, radius, typography } = useTheme();
  const [loans, setLoans] = useState<Loan[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/loans/my");
    setLoans(res.data.data);
  });

  const active = loans.find((l) => l.status === "ACTIVE");
  const others = loans.filter((l) => l.id !== active?.id);

  return (
    <ScreenWrapper header={<PageHeader title="Loans" subtitle="Track and manage your loan portfolio" rightComponent={<NotificationsButton />} />} refreshing={loading} onRefresh={refresh} floating={loans.length > 0 ? (
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push("/(member)/apply_loan")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    ) : undefined}>
      {loading ? (
        <SkeletonLoanQueue />
      ) : error ? (
        <ErrorState title="Unable to load loans" message="We couldn't retrieve your loan information." onRetry={refresh} />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={<Banknote size={30} color={colors.primary} />}
          title="No active loans"
          description="You're currently debt-free. Explore loan options when you're ready to borrow."
          actionLabel="Explore Loan Options"
          onAction={() => router.push("/(member)/apply_loan")}
        />
      ) : (
        <View>
          {active ? (
            <>
              <BalanceCard
                label="Outstanding Balance"
                amount={active.amountApproved! - active.amountRepaid}
                hint={active.expectedCompletion ? `Due ${formatDate(active.expectedCompletion)}` : undefined}
                icon={<Banknote size={18} color={colors.primary} />}
              />

              <View style={{ marginTop: spacing.xl, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
                  <Text style={[typography.captionMedium, { color: colors.text }]}>Repayment Progress</Text>
                  <Text style={[typography.captionMedium, { color: colors.secondary, fontVariant: ["tabular-nums"] }]}>
                    {Math.round((active.amountRepaid / active.amountApproved!) * 100)}% repaid
                  </Text>
                </View>
                <ProgressBar progress={active.amountRepaid / active.amountApproved!} height={10} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Repaid {formatCurrency(active.amountRepaid)}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>of {formatCurrency(active.amountApproved!)}</Text>
                </View>
              </View>

              <SectionHeader title="Loan Details" />
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl }}>
                <DetailRow label="Loan type" value={active.purpose} last={false} />
                <DetailRow label="Original amount" value={formatCurrency(active.amountApproved!)} last={false} />
                <DetailRow label="Remaining balance" value={formatCurrency(active.amountApproved! - active.amountRepaid)} last={false} />
                <DetailRow label="Interest rate" value={`${active.interestRate}% p.a.`} last={false} />
                <DetailRow label="Term" value={`${active.repaymentMonths} months`} last={false} />
                {active.expectedCompletion && <DetailRow label="Expected completion" value={formatDate(active.expectedCompletion)} last />}
              </View>

              <Button title="Repay Loan" onPress={() => router.push("/(member)/repay_loan")} style={{ marginTop: spacing.xxl }} />
            </>
          ) : (
            <EmptyState
              icon={<Banknote size={30} color={colors.primary} />}
              title="No active loans"
              description="You're currently debt-free. Explore loan options when you're ready to borrow."
              actionLabel="Explore Loan Options"
              onAction={() => router.push("/(member)/apply_loan")}
            />
          )}

          {others.length > 0 && (
            <>
              <SectionHeader title="Loan History" />
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl }}>
                {others.map((loan, i) => {
                  const st = statusOf(loan.status);
                  const amount = loan.amountApproved ?? loan.amountRequested;
                  const isLast = i === others.length - 1;
                  return (
                    <TouchableOpacity
                      key={loan.id}
                      onPress={() => loan.status === "ACTIVE" && router.push("/(member)/repay_loan")}
                      accessibilityRole="button"
                      accessibilityLabel={`${st.label} loan`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: spacing.lg,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>{loan.purpose}</Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          {formatCurrency(amount)}
                        </Text>
                      </View>
                      <Badge label={st.label} variant={st.variant} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {loans.length > 0 && (
            <Button title="Apply for a New Loan" onPress={() => router.push("/(member)/apply_loan")} variant="ghost" style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }} />
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.lg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text, fontVariant: ["tabular-nums"] }]}>{value}</Text>
    </View>
  );
}

const styles = {
  fab: {
    position: "absolute" as const,
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    elevation: 5,
  },
  fabText: { fontSize: 32, color: "#FFF", marginTop: -4 },
};
