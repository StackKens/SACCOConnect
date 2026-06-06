import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { Wallet, AlertCircle, Flame, FileText } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";

export default function MemberDashboard() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  // Mock data – replace with API
  const totalSavings = 12500;
  const activeLoanBalance = 8000;
  const nextContribution = "2025-06-10";
  const streakDays = 5;

  return (
    <ScreenWrapper scroll header={<PageHeader title={`Welcome, ${user?.name?.split(" ")[0] || "Member"}`} />}>

      <View style={styles.statsRow}>
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavings)}
          icon={<Wallet size={24} color={colors.secondary} />}
        />
        <StatCard
          title="Loan Balance"
          value={formatCurrency(activeLoanBalance)}
          icon={<AlertCircle size={24} color={colors.warning} />}
        />
      </View>

      <Card style={styles.streakCard}>
        <View style={styles.streakRow}>
          <Flame size={28} color={colors.warning} />
          <Text style={[styles.streakText, { color: colors.text }]}>
            {" "}
            {streakDays} month streak!
          </Text>
        </View>
        <Text style={[styles.streakSubtext, { color: colors.textSecondary }]}>
          Keep contributing to maintain your streak
        </Text>
      </Card>

      <Card style={styles.nextContribution}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Next Contribution
        </Text>
        <Text style={[styles.contributionDate, { color: colors.secondary }]}>
          {nextContribution}
        </Text>
        <Button
          title="Make Contribution"
          onPress={() => router.push("/(member)/contribute")}
          variant="secondary"
          style={{ marginTop: 12 }}
        />
      </Card>

      <View style={styles.actions}>
        <Button
          title="Apply for Loan"
          onPress={() => router.push("/(member)/apply_loan")}
          style={styles.actionButton}
        />
        <Button
          title="Repay Loan"
          onPress={() => router.push("/(member)/repay_loan")}
          variant="outline"
          style={styles.actionButton}
        />
      </View>

      <Button
        title="View Statement"
        onPress={() => router.push("/(member)/statement")}
        variant="outline"
        style={{ marginTop: 18, marginBottom: 20 }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  welcome: { fontSize: 24, fontWeight: "bold" },
  date: { fontSize: 14, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  streakCard: { marginBottom: 20, alignItems: "center" },
  streakRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  streakText: { fontSize: 18, fontWeight: "bold" },
  streakSubtext: { fontSize: 12 },
  nextContribution: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  contributionDate: { fontSize: 20, fontWeight: "bold" },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  actionButton: { flex: 1 },
});
