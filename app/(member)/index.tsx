import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { Wallet, AlertCircle, Flame, FileText } from "lucide-react-native";
import { useMemberDataStore } from "@/store/member.store";
import { formatCurrency } from "@/utils/currency";
import { formatDate, dueDateLabel } from "@/utils/date";

export default function MemberDashboard() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const { totalSavings, activeLoan } = useMemberDataStore();

  const totalSavingsAmt = totalSavings();
  const activeLoanData = activeLoan();
  const activeLoanBalance = activeLoanData
    ? activeLoanData.amount - activeLoanData.repaid
    : 0;
  const nextContribution = sacco?.contributionDueDate;
  const dueLabel = nextContribution ? dueDateLabel(nextContribution) : null;
  const isOverdue = dueLabel?.startsWith("Overdue");
  const streakDays = 5;

  const logoColor = sacco?.logoColor ?? colors.primary;
  const saccoInitials = (sacco?.name ?? "SC")
    .split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join("");

  return (
    <ScreenWrapper scroll header={<PageHeader title={`Welcome, ${user?.name?.split(" ")[0] || "Member"}`} />}>

      {/* SACCO identity strip */}
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

      <View style={styles.statsRow}>
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavingsAmt)}
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
        <Text style={[styles.contributionDate, { color: isOverdue ? colors.error : colors.secondary }]}>
          {nextContribution ? formatDate(nextContribution) : "Not set yet"}
        </Text>
        {dueLabel && (
          <Text style={[styles.dueHint, { color: isOverdue ? colors.error : colors.textSecondary }]}>
            {dueLabel} · UGX {sacco?.contributionAmount?.toLocaleString() ?? "—"}
          </Text>
        )}
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
  saccoStrip: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 20 },
  saccoAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  saccoAvatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  saccoName: { fontSize: 14, fontWeight: "700" },
  saccoMeta: { fontSize: 12, marginTop: 1 },
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
  dueHint: { fontSize: 13, marginTop: 6 },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  actionButton: { flex: 1 },
});
