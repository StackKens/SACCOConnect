import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { router, useFocusEffect } from "expo-router";
import { Wallet, AlertCircle, Flame } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";
import { formatDate, dueDateLabel } from "@/utils/date";
import { api } from "@/services/api";
import { useState, useCallback } from "react";
import { SkeletonDashboard } from "@/components/ui/Skeleton";

interface MemberProfile {
  currentBalance: number;
  streak: { currentStreak: number } | null;
}

interface ActiveLoan {
  id: string;
  amountApproved: number;
  amountRepaid: number;
}

export default function MemberDashboard() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([
        api.get("/api/members/me"),
        api.get("/api/loans/my/active"),
      ]).then(([profileRes, loanRes]) => {
        if (!active) return;
        setProfile(profileRes.data.data);
        setActiveLoan(loanRes.data.data);
      }).catch(() => {}).finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []),
  );

  const totalSavings = profile?.currentBalance ?? 0;
  const activeLoanBalance = activeLoan ? (activeLoan.amountApproved - activeLoan.amountRepaid) : 0;
  const streak = profile?.streak?.currentStreak ?? 0;
  const nextContribution = sacco?.contributionDueDate;
  const dueLabel = nextContribution ? dueDateLabel(nextContribution) : null;
  const isOverdue = dueLabel?.startsWith("Overdue");
  const logoColor = sacco?.logoColor ?? colors.primary;
  const saccoInitials = (sacco?.name ?? "SC").split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join("");

  return (
    <ScreenWrapper scroll header={<PageHeader title={`Welcome, ${user?.name?.split(" ")[0] || "Member"}`} />}>

      {sacco && (
        <View style={[styles.saccoStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.saccoAvatar, { backgroundColor: logoColor }]}>
            <Text style={styles.saccoAvatarText}>{saccoInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.saccoName, { color: colors.text }]}>{sacco.name}</Text>
            <Text style={[styles.saccoMeta, { color: colors.textSecondary }]}>
              UGX {sacco.contributionAmount?.toLocaleString()} / month
            </Text>
          </View>
        </View>
      )}

      {loading ? <SkeletonDashboard /> : (
        <>
          <View style={styles.statsRow}>
            <StatCard title="Total Savings" value={formatCurrency(totalSavings)} icon={<Wallet size={24} color={colors.secondary} />} />
            <StatCard title="Loan Balance" value={formatCurrency(activeLoanBalance)} icon={<AlertCircle size={24} color={colors.warning} />} />
          </View>

          <Card style={styles.streakCard}>
            <View style={styles.streakRow}>
              <Flame size={28} color={colors.warning} />
              <Text style={[styles.streakText, { color: colors.text }]}> {streak} month streak!</Text>
            </View>
            <Text style={[styles.streakSubtext, { color: colors.textSecondary }]}>
              Keep contributing to maintain your streak
            </Text>
          </Card>
        </>
      )}

      <Card style={styles.nextContribution}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Contribution</Text>
        <Text style={[styles.contributionDate, { color: isOverdue ? colors.error : colors.secondary }]}>
          {nextContribution ? formatDate(nextContribution) : "Not set yet"}
        </Text>
        {dueLabel && (
          <Text style={[styles.dueHint, { color: isOverdue ? colors.error : colors.textSecondary }]}>
            {dueLabel} · UGX {sacco?.contributionAmount?.toLocaleString() ?? "—"}
          </Text>
        )}
        <Button title="Make Contribution" onPress={() => router.push("/(member)/contribute")} variant="secondary" style={{ marginTop: 12 }} />
      </Card>

      <View style={styles.actions}>
        <Button title="Apply for Loan" onPress={() => router.push("/(member)/apply_loan")} style={styles.actionButton} />
        <Button title="Repay Loan" onPress={() => router.push("/(member)/repay_loan")} variant="outline" style={styles.actionButton} />
      </View>

      <Button title="View Statement" onPress={() => router.push("/(member)/statement")} variant="outline" style={{ marginTop: 18, marginBottom: 20 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  saccoStrip: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 20 },
  saccoAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  saccoAvatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  saccoName: { fontSize: 14, fontWeight: "700" },
  saccoMeta: { fontSize: 12, marginTop: 1 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  streakCard: { marginBottom: 20, alignItems: "center" },
  streakRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  streakText: { fontSize: 18, fontWeight: "bold" },
  streakSubtext: { fontSize: 12 },
  nextContribution: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  contributionDate: { fontSize: 20, fontWeight: "bold" },
  dueHint: { fontSize: 13, marginTop: 6 },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  actionButton: { flex: 1 },
});
