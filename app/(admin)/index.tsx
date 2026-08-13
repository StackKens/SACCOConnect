import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { Users, Wallet, Banknote, Clock, Settings } from "lucide-react-native";
import { Pressable } from "react-native";
import { formatCurrency } from "@/utils/currency";
import { useState } from "react";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation("admin");
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSavings: 0,
    activeLoans: 0,
    pendingApplications: 0,
  });
  const { loading, error, refresh } = useApiFetch(async () => {
    const [membersRes, treasuryRes, queueRes] = await Promise.all([
      api.get("/api/members"),
      api.get("/api/contributions/treasury"),
      api.get("/api/loans/queue"),
    ]);
    setStats({
      totalMembers: membersRes.data.data.length,
      totalSavings: treasuryRes.data.data.totalSavings,
      activeLoans: treasuryRes.data.data.outstanding,
      pendingApplications: queueRes.data.data.length,
    });
  });

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title={t("dashboard.title")}
          subtitle={t("dashboard.subtitle")}
          rightComponent={
            <Pressable
              onPress={() => router.push("/(admin)/settings")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.openSettings")}
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.5 }]}
            >
              <Settings size={22} color={colors.text} strokeWidth={2} />
            </Pressable>
          }
        />
      }
    >
      <View style={styles.statsGrid}>
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonDashboard />
        ) : (
          <>
            <StatCard
              title={t("totalMembers")}
              value={stats.totalMembers.toString()}
              icon={<Users size={24} color={colors.primary} />}
            />
            <StatCard
              title={t("totalSavings")}
              value={formatCurrency(stats.totalSavings)}
              icon={<Wallet size={24} color={colors.secondary} />}
            />
            <StatCard
              title={t("activeLoans")}
              value={formatCurrency(stats.activeLoans)}
              icon={<Banknote size={24} color={colors.warning} />}
            />
            <StatCard
              title={t("dashboard.pendingApplications")}
              value={stats.pendingApplications.toString()}
              icon={<Clock size={24} color={colors.error} />}
            />
          </>
        )}
      </View>

      <Card style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("dashboard.quickActions")}
        </Text>
        <View style={styles.actionButtons}>
          <Button
            title={t("dashboard.reviewLoans")}
            onPress={() => router.push("/(admin)/loan-queue")}
            variant="primary"
            style={styles.actionBtn}
          />
          <Button
            title={t("dashboard.manageMembers")}
            onPress={() => router.push("/(admin)/members")}
            variant="secondary"
            style={styles.actionBtn}
          />
          <Button
            title={t("dashboard.viewTreasury")}
            onPress={() => router.push("/(admin)/treasury")}
            variant="outline"
            style={styles.actionBtn}
          />
          <Button
            title={t("dashboard.postAnnouncement")}
            onPress={() => router.push("/(admin)/announcements")}
            variant="outline"
            style={styles.actionBtn}
          />
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("dashboard.quickData")}
        </Text>
        <View style={styles.actionButtons}>
          <Button
            title={t("dashboard.allContributions")}
            onPress={() => router.push("/(admin)/contributions")}
            variant="outline"
            style={styles.actionBtn}
          />

          <Button
            title={t("activeLoans")}
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
  headerBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
});
