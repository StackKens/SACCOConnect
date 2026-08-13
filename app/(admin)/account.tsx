import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { Wallet, User } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";
import { api } from "@/services/api";
import { useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";
import { SkeletonMemberList } from "@/components/ui/Skeleton";
import { TransactionRow } from "@/components/features/TransactionRow";
import { useTranslation } from "react-i18next";

interface Contribution {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

interface MemberProfile {
  currentBalance: number;
}

export default function AdminAccount() {
  const { t } = useTranslation("admin");
  const { colors, spacing, radius, typography } = useTheme();
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const { loading, error, refresh } = useApiFetch(async () => {
    const [contribRes, profileRes] = await Promise.all([
      api.get("/api/contributions/my"),
      api.get("/api/members/me"),
    ]);
    setContributions(contribRes.data.data);
    setCurrentBalance((profileRes.data.data as MemberProfile).currentBalance ?? 0);
  });

  const confirmedTotal = contributions
    .filter((c) => c.status === "CONFIRMED")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScreenWrapper scroll refreshing={loading} onRefresh={refresh} header={<PageHeader title={t("account")} subtitle={t("account.subtitle")} />}>
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
        <View style={[styles.avatar, { backgroundColor: sacco?.logoColor ?? colors.primary }]}>
          <User size={32} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.adminName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.adminPhone, { color: colors.textSecondary }]}>{user?.phone}</Text>
          <Text style={[styles.adminBadge, { color: colors.secondary }]}>{t("administrator")}</Text>
        </View>
      </View>

      {sacco && (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {sacco.name} · {formatCurrency(sacco.contributionAmount ?? 0)} / month · {sacco.interestRate}% p.a.
        </Text>
      )}

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : loading ? (
        <View style={{ marginTop: spacing.xl }}>
          <SkeletonMemberList />
        </View>
      ) : (
        <View>
          <View style={{ marginTop: spacing.xl }}>
            <BalanceCard
              label={t("totalSavings")}
              amount={currentBalance}
              hint={confirmedTotal > 0 ? t("account.confirmedHint", { amount: formatCurrency(confirmedTotal) }) : undefined}
              icon={<Wallet size={18} color={colors.secondary} />}
            />
          </View>

          <Button
            title={t("account.makeContribution")}
            onPress={() => router.push("/(admin)/contribute")}
            style={{ marginTop: spacing.xl }}
          />

          <SectionHeader title={t("account.historyTitle")} subtitle={t("account.historySubtitle")} />

          {contributions.length === 0 ? (
            <EmptyState
              icon={<Wallet size={30} color={colors.primary} />}
              title={t("account.noContributions")}
              description={t("account.noContributionsDesc")}
            />
          ) : (
            <View style={[styles.contribList, { backgroundColor: colors.surface }]}>
              {contributions.slice(0, 10).map((item, i) => (
                <TransactionRow
                  key={item.id}
                  item={{
                    id: item.id,
                    type: "CONTRIBUTION",
                    amount: item.amount,
                    date: item.createdAt,
                    reference: item.method?.replace(/_/g, " "),
                    status: item.status,
                  }}
                  last={i === Math.min(contributions.length, 10) - 1}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileInfo: { alignItems: "center" },
  adminName: { fontSize: 17, fontWeight: "700" },
  adminPhone: { fontSize: 13, marginTop: 2 },
  adminBadge: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 8 },
  contribList: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
});
