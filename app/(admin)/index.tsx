import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { Users, Wallet, Banknote, Clock } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";

export default function AdminDashboard() {
  const { colors } = useTheme();

  const totalMembers = 245;
  const totalSavings = 1250000;
  const activeLoans = 156000;
  const pendingApplications = 12;

  return (
    <ScreenWrapper scroll>
      <PageHeader title="Admin Dashboard" />

      <View style={styles.statsGrid}>
        <StatCard
          title="Members"
          value={totalMembers.toString()}
          icon={<Users size={24} color={colors.primary} />}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavings)}
          icon={<Wallet size={24} color={colors.secondary} />}
        />
        <StatCard
          title="Active Loans"
          value={formatCurrency(activeLoans)}
          icon={<Banknote size={24} color={colors.warning} />}
        />
        <StatCard
          title="Pending Apps"
          value={pendingApplications.toString()}
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
            title="Add Member"
            onPress={() => router.push("/(admin)/members")}
            variant="secondary"
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
          Recent Activity
        </Text>
        <Text style={{ color: colors.textSecondary }}>No recent activity</Text>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickActions: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  actionButtons: { gap: 12 },
  actionBtn: { marginBottom: 8 },
});
