import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { router, useFocusEffect } from "expo-router";
import { Users, Wallet, Banknote, Clock } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";
import { useAuthStore } from "@/store/auth.store";
import { useLoanStore } from "@/store/loan.store";
import { getMemberSummaries } from "@/helpers/members";
import { useCallback, useState } from "react";

export default function AdminDashboard() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const { loans } = useLoanStore();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSavings: 0,
    activeLoans: 0,
    pendingApplications: 0,
  });

  const refreshStats = useCallback(() => {
    if (!sacco?.id) return;
    const members = getMemberSummaries(sacco.id);
    const saccoLoans = loans.filter((l) => l.saccoId === sacco.id);
    const totalSavings = members.reduce((sum, m) => sum + m.savings, 0);
    const activeLoans = members.reduce((sum, m) => sum + m.activeLoan, 0);
    const pendingApplications = saccoLoans.filter((l) => l.status === "pending").length;

    setStats({
      totalMembers: members.length,
      totalSavings,
      activeLoans,
      pendingApplications,
    });
  }, [loans, sacco?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats]),
  );

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title="Admin Dashboard"
          subtitle="Overview of SACCO operations"
        />
      }
    >
      <View style={styles.statsGrid}>
        <StatCard
          title="Members"
          value={stats.totalMembers.toString()}
          icon={<Users size={24} color={colors.primary} />}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(stats.totalSavings)}
          icon={<Wallet size={24} color={colors.secondary} />}
        />
        <StatCard
          title="Active Loans"
          value={formatCurrency(stats.activeLoans)}
          icon={<Banknote size={24} color={colors.warning} />}
        />
        <StatCard
          title="Pending Applications"
          value={stats.pendingApplications.toString()}
          icon={<Clock size={24} color={colors.error} />}
        />
      </View>

      <Card style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <Button
            title="Review Loans"
            onPress={() => router.push("/(admin)/loan-queue")}
            variant="primary"
            style={styles.actionBtn}
          />
          <Button
            title="Manage Members"
            onPress={() => router.push("/(admin)/members")}
            variant="secondary"
            style={styles.actionBtn}
          />
          <Button
            title="View Treasury"
            onPress={() => router.push("/(admin)/treasury")}
            variant="outline"
            style={styles.actionBtn}
          />
          <Button
            title="Post Announcement"
            onPress={() => router.push("/(admin)/announcements")}
            variant="outline"
            style={styles.actionBtn}
          />
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          More
        </Text>
        <View style={styles.actionButtons}>
          <Button
            title="All Contributions"
            onPress={() => router.push("/(admin)/contributions")}
            variant="outline"
            style={styles.actionBtn}
          />
          <Button
            title="Active Loans"
            onPress={() => router.push("/(admin)/active-loans")}
            variant="outline"
            style={styles.actionBtn}
          />
        </View>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quickActions: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  actionButtons: { gap: 10 },
  actionBtn: {},
});
