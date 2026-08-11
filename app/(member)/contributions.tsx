import { View, Text } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { NotificationsButton } from "@/components/ui/NotificationsButton";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { GrowthChart } from "@/components/ui/GrowthChart";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Wallet, CalendarClock } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { dueDateLabel, formatDate } from "@/utils/date";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/services/api";
import { useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";
import { SkeletonMemberList } from "@/components/ui/Skeleton";
import { TransactionRow } from "@/components/features/TransactionRow";

interface Contribution {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildGrowth(contributions: Contribution[]): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const c of contributions) {
    if (c.status !== "CONFIRMED") continue;
    const key = (c.createdAt ?? "").slice(0, 7);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + (c.amount ?? 0));
  }
  const keys = [...map.keys()].sort();
  return keys.slice(-6).map((k) => {
    const [, m] = k.split("-");
    return { label: MONTHS[parseInt(m, 10) - 1] ?? k, value: map.get(k) ?? 0 };
  });
}

export default function Contributions() {
  const { colors, spacing, radius, typography } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const { loading, error, refresh } = useApiFetch(async () => {
    const [contribRes, profileRes] = await Promise.all([
      api.get("/api/contributions/my"),
      api.get("/api/members/me"),
    ]);
    setContributions(contribRes.data.data);
    setTotalSavings(profileRes.data.data.currentBalance ?? 0);
  });
  const dueDate = sacco?.contributionDueDate;
  const dueLabel = dueDate ? dueDateLabel(dueDate) : null;
  const isOverdue = dueLabel?.startsWith("Overdue");
  const growth = buildGrowth(contributions);

  return (
    <ScreenWrapper header={<PageHeader title="Savings" subtitle="Your contributions at a glance" rightComponent={<NotificationsButton />} />} refreshing={loading} onRefresh={refresh}>
      <BalanceCard
        label="Total Savings"
        amount={totalSavings}
        delta={dueLabel && dueDate ? `Due ${formatDate(dueDate)}` : undefined}
        deltaTone={isOverdue ? "negative" : "neutral"}
        icon={<Wallet size={18} color={colors.secondary} />}
      />

      {dueDate && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.xl,
            padding: spacing.lg,
            backgroundColor: isOverdue ? (colors.errorSoft as string) : (colors.infoSoft as string),
            borderRadius: radius.md,
          }}
        >
          <CalendarClock size={22} color={isOverdue ? colors.error : colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.captionMedium, { color: colors.text }]}>
              {isOverdue ? "Monthly contribution overdue" : "Monthly due date"}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {formatCurrency(sacco?.contributionAmount ?? 0)} by {formatDate(dueDate)}
            </Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={{ marginTop: spacing.xl }}>
          <SkeletonMemberList />
        </View>
      ) : error ? (
        <ErrorState title="Unable to load savings" message="We couldn't retrieve your savings information." onRetry={refresh} />
      ) : contributions.length === 0 ? (
        <View style={{ marginTop: spacing.xxl }}>
          <EmptyState
            icon={<Wallet size={30} color={colors.primary} />}
            title="No contributions yet"
            description="Your contributions will appear here once you make your first one."
            actionLabel="Make Contribution"
            onAction={() => router.push("/(member)/contribute")}
          />
        </View>
      ) : (
        <View>
          {growth.length > 1 && (
            <>
              <SectionHeader title="Savings Growth" />
              <View style={{ padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}>
                <GrowthChart data={growth} />
              </View>
            </>
          )}

          <SectionHeader title="Contribution History" subtitle="Your most recent contributions" />

          <View style={{ paddingHorizontal: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}>
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

          <Button
            title="Make Contribution"
            onPress={() => router.push("/(member)/contribute")}
            style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}
