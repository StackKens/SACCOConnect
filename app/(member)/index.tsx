import { View, Text } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { NotificationsButton } from "@/components/ui/NotificationsButton";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { QuickActionGrid } from "@/components/ui/QuickActionGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { Wallet, Scale, Flame, HandCoins, FileText, Handshake, CreditCard } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";
import { formatDate, dueDateLabel } from "@/utils/date";
import { api } from "@/services/api";
import { useState, useCallback } from "react";
import { SkeletonHome } from "@/components/ui/Skeleton";
import { useOfflineApi } from "@/hooks/useOfflineApi";

interface MemberProfile {
  currentBalance: number;
  streak: { currentStreak: number } | null;
}

interface ActiveLoan {
  id: string;
  amountApproved: number;
  amountRepaid: number;
}

interface ContributionItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function MemberDashboard() {
  const { colors, spacing, radius, typography } = useTheme();
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const { data: profile, loading: profileLoading, refresh: refreshProfile } = useOfflineApi<MemberProfile>("/api/members/me");
  const { data: activeLoan, loading: loanLoading, refresh: refreshLoan } = useOfflineApi<ActiveLoan | null>("/api/loans/my/active");
  const [thisMonthSavings, setThisMonthSavings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadThisMonth = useCallback(async () => {
    try {
      const res = await api.get("/api/contributions/my");
      const list = (res.data?.data ?? []) as ContributionItem[];
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const sum = list
        .filter((c) => c.status === "CONFIRMED" && (c.createdAt ?? "").startsWith(monthKey))
        .reduce((acc, c) => acc + (c.amount ?? 0), 0);
      setThisMonthSavings(sum);
    } catch {
      setThisMonthSavings(0);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshLoan(), loadThisMonth()]);
    setRefreshing(false);
  }, [refreshProfile, refreshLoan, loadThisMonth]);

  const loading = profileLoading && loanLoading;

  const totalSavings = profile?.currentBalance ?? 0;
  const activeLoanBalance = activeLoan ? activeLoan.amountApproved - activeLoan.amountRepaid : 0;
  const streak = profile?.streak?.currentStreak ?? 0;
  const nextContribution = sacco?.contributionDueDate;
  const dueLabel = nextContribution ? dueDateLabel(nextContribution) : null;
  const isOverdue = dueLabel?.startsWith("Overdue");
  const firstName = user?.name?.split(" ")[0] || "Member";

  return (
    <ScreenWrapper scroll header={<PageHeader title="Home" rightComponent={<NotificationsButton />} />} refreshing={refreshing} onRefresh={refresh}>
      <View>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Welcome back,</Text>
        <Text style={[typography.h1, { color: colors.text }]}>{firstName}</Text>
        {sacco && (
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {sacco.name}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={{ marginTop: spacing.xl }}>
          <SkeletonHome />
        </View>
      ) : (
        <View>
          <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
            <BalanceCard
              label="Total Savings"
              amount={totalSavings}
              delta={thisMonthSavings > 0 ? `+${formatCurrency(thisMonthSavings)} this month` : undefined}
              deltaTone="positive"
              icon={<Wallet size={18} color={colors.secondary} />}
            />

            <BalanceCard
              label="Loan Balance"
              amount={activeLoanBalance}
              hint={activeLoan ? undefined : "No active loan"}
              deltaTone="negative"
              icon={<Scale size={18} color={activeLoanBalance > 0 ? colors.warning : colors.textMuted} />}
            />
          </View>

          {nextContribution && (
            <View
              style={{
                marginTop: spacing.xl,
                backgroundColor: isOverdue ? (colors.errorSoft as string) : (colors.successSoft as string),
                borderRadius: radius.lg,
                padding: spacing.xl,
                borderWidth: 1,
                borderColor: isOverdue ? colors.error + "40" : colors.success + "40",
              }}
            >
              <Text style={[typography.micro, { color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }]}>
                Next Contribution
              </Text>
              <Text style={[typography.h2, { color: isOverdue ? colors.error : colors.text, marginTop: spacing.xs }]}>
                {formatDate(nextContribution)}
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>
                {dueLabel?.startsWith("Overdue") ? "Overdue" : dueLabel} · {formatCurrency(sacco?.contributionAmount ?? 0)}
              </Text>
              <Button
                title="Make Contribution"
                onPress={() => router.push("/(member)/contribute")}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          )}

          <SectionHeader title="Quick Actions" />

          <QuickActionGrid
            actions={[
              {
                key: "contribute",
                label: "Contribution",
                primary: true,
                icon: <HandCoins size={20} color="#FFFFFF" />,
                onPress: () => router.push("/(member)/contribute"),
              },
              {
                key: "loan",
                label: "Apply Loan",
                icon: <Handshake size={20} color={colors.primary} />,
                onPress: () => router.push("/(member)/apply_loan"),
              },
              {
                key: "repay",
                label: "Repay Loan",
                icon: <CreditCard size={20} color={colors.primary} />,
                onPress: () => router.push("/(member)/repay_loan"),
              },
              {
                key: "statement",
                label: "Statement",
                icon: <FileText size={20} color={colors.primary} />,
                onPress: () => router.push("/(member)/statement"),
              },
            ]}
          />

          {streak > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                marginTop: spacing.xxl,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.lg,
                backgroundColor: colors.warningSoft as string,
                borderRadius: radius.md,
              }}
            >
              <Flame size={24} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{streak} month streak</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Keep contributing to maintain your streak
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}
