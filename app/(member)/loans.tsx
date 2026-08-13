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
import { useTranslation } from "react-i18next";

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

function statusOf(status: string, t: (key: string) => string) {
  const labels: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" }> = {
    ACTIVE: { label: t("active"), variant: "info" }, REPAID: { label: t("repaid"), variant: "success" },
    REJECTED: { label: t("rejected"), variant: "error" }, PENDING: { label: t("pending"), variant: "warning" },
    AWAITING_GUARANTORS: { label: t("awaitingGuarantors"), variant: "warning" }, UNDER_REVIEW: { label: t("underReview"), variant: "warning" },
  };
  return labels[status] ?? { label: status.replace(/_/g, " ").toLowerCase(), variant: "info" as const };
}

export default function Loans() {
  const { colors, spacing, radius, typography } = useTheme();
  const { t } = useTranslation("loans");
  const [loans, setLoans] = useState<Loan[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/loans/my");
    setLoans(res.data.data);
  });

  const active = loans.find((l) => l.status === "ACTIVE");
  const others = loans.filter((l) => l.id !== active?.id);

  return (
    <ScreenWrapper header={<PageHeader title={t("title")} subtitle={t("portfolioSubtitle")} rightComponent={<NotificationsButton />} />} refreshing={loading} onRefresh={refresh} floating={loans.length > 0 ? (
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push("/(member)/apply_loan")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    ) : undefined}>
      {loading ? (
        <SkeletonLoanQueue />
      ) : error ? (
        <ErrorState title={t("loadErrorTitle")} message={t("loadErrorMessage")} onRetry={refresh} />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={<Banknote size={30} color={colors.primary} />}
          title={t("noActiveLoans")}
          description={t("noActiveLoansDescription")}
          actionLabel={t("exploreOptions")}
          onAction={() => router.push("/(member)/apply_loan")}
        />
      ) : (
        <View>
          {active ? (
            <>
              <BalanceCard
                label={t("outstanding")}
                amount={active.amountApproved! - active.amountRepaid}
                hint={active.expectedCompletion ? t("due", { date: formatDate(active.expectedCompletion) }) : undefined}
                icon={<Banknote size={18} color={colors.primary} />}
              />

              <View style={{ marginTop: spacing.xl, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
                  <Text style={[typography.captionMedium, { color: colors.text }]}>{t("repaymentProgress")}</Text>
                  <Text style={[typography.captionMedium, { color: colors.secondary, fontVariant: ["tabular-nums"] }]}>
                    {t("percentRepaid", { percent: Math.round((active.amountRepaid / active.amountApproved!) * 100) })}
                  </Text>
                </View>
                <ProgressBar progress={active.amountRepaid / active.amountApproved!} height={10} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{t("repaidAmount", { amount: formatCurrency(active.amountRepaid) })}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{t("ofAmount", { amount: formatCurrency(active.amountApproved!) })}</Text>
                </View>
              </View>

              <SectionHeader title={t("loanDetails")} />
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl }}>
                <DetailRow label={t("loanType")} value={active.purpose} last={false} />
                <DetailRow label={t("originalAmount")} value={formatCurrency(active.amountApproved!)} last={false} />
                <DetailRow label={t("remainingBalance")} value={formatCurrency(active.amountApproved! - active.amountRepaid)} last={false} />
                <DetailRow label={t("interestRate")} value={`${active.interestRate}% p.a.`} last={false} />
                <DetailRow label={t("term")} value={t("months", { count: active.repaymentMonths })} last={false} />
                {active.expectedCompletion && <DetailRow label={t("expectedCompletion")} value={formatDate(active.expectedCompletion)} last />}
              </View>

              <Button title={t("repayLoan")} onPress={() => router.push("/(member)/repay_loan")} style={{ marginTop: spacing.xxl }} />
            </>
          ) : (
            <EmptyState
              icon={<Banknote size={30} color={colors.primary} />}
              title={t("noActiveLoans")}
              description={t("noActiveLoansDescription")}
              actionLabel={t("exploreOptions")}
              onAction={() => router.push("/(member)/apply_loan")}
            />
          )}

          {others.length > 0 && (
            <>
              <SectionHeader title={t("loanHistory")} />
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl }}>
                {others.map((loan, i) => {
                  const st = statusOf(loan.status, t);
                  const amount = loan.amountApproved ?? loan.amountRequested;
                  const isLast = i === others.length - 1;
                  return (
                    <TouchableOpacity
                      key={loan.id}
                      onPress={() => loan.status === "ACTIVE" && router.push("/(member)/repay_loan")}
                      accessibilityRole="button"
                      accessibilityLabel={t("statusLoan", { status: st.label })}
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
            <Button title={t("applyNew")} onPress={() => router.push("/(member)/apply_loan")} variant="ghost" style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }} />
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
