import { View, Text, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Wallet, Banknote, Phone, Calendar } from "lucide-react-native";
import { api } from "@/services/api";
import { useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";
import { SkeletonMemberDetail } from "@/components/ui/Skeleton";

interface MemberDetailData {
  id: string;
  fullName: string;
  nationalId: string | null;
  status: string;
  currentBalance: number;
  joinDate: string;
  user: { phoneNumber: string };
  contributions: { id: string; amount: number; createdAt: string; status: string }[];
  loans: { id: string; amountApproved: number | null; amountRequested: number; amountRepaid: number; status: string; purpose: string }[];
}

export default function MemberDetail() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const memberId = Array.isArray(id) ? id[0] : id;
  const { colors } = useTheme();
  const [member, setMember] = useState<MemberDetailData | null>(null);
  const { loading, error, refresh } = useApiFetch(async () => {
    if (!memberId) return;
    const res = await api.get(`/api/members/${memberId}`);
    setMember(res.data.data);
  });
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <ScreenWrapper scroll header={<PageHeader title="Member" showBack onBack={() => router.push("/(admin)/members")} />}>
        <SkeletonMemberDetail />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper header={<PageHeader title="Member" showBack onBack={() => router.push("/(admin)/members")} />}>
        <ErrorState message={error} onRetry={refresh} />
      </ScreenWrapper>
    );
  }

  if (!member) {
    return (
      <ScreenWrapper header={<PageHeader title="Member" showBack onBack={() => router.push("/(admin)/members")} />}>
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>Member not found.</Text>
      </ScreenWrapper>
    );
  }

  const confirmedContributions = member.contributions.filter((c) => c.status === "CONFIRMED");
  const activeLoans = member.loans.filter((l) => l.status === "ACTIVE");
  const activeLoanBalance = activeLoans.reduce((sum, l) => sum + ((l.amountApproved ?? l.amountRequested) - l.amountRepaid), 0);
  const recentContributions = confirmedContributions.slice(0, 5);
  const loanHistory = member.loans.filter((l) => l.status !== "AWAITING_GUARANTORS");
  const pendingLoan = member.loans.find((l) => ["PENDING", "AWAITING_GUARANTORS", "UNDER_REVIEW"].includes(l.status));

  return (
    <ScreenWrapper
      scroll
      refreshing={loading}
      onRefresh={refresh}
      header={
        <PageHeader
          title={member.fullName}
          subtitle="Member profile"
          showBack
          onBack={() => router.push("/(admin)/members")}
          rightComponent={<Badge label={member.status.toLowerCase()} variant={member.status === "ACTIVE" ? "success" : "error"} />}
        />
      }
    >
      <Card style={styles.profileCard}>
        <Avatar name={member.fullName} size={72} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Phone size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{member.user.phoneNumber}</Text>
          </View>
          {member.nationalId && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>ID: {member.nationalId}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Joined {formatDate(member.joinDate)}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Summary</Text>
        <View style={styles.financialRow}>
          <View style={[styles.financialItem, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
            <Wallet size={20} color={colors.success} />
            <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Total Savings</Text>
            <Text style={[styles.financialValue, { color: colors.text }]}>{formatCurrency(member.currentBalance)}</Text>
          </View>
          <View style={[styles.financialItem, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "30" }]}>
            <Banknote size={20} color={colors.warning} />
            <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Active Loan</Text>
            <Text style={[styles.financialValue, { color: colors.text }]}>{formatCurrency(activeLoanBalance)}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Contributions</Text>
        {recentContributions.length === 0 ? (
          <EmptyState title="No contributions yet" />
        ) : (
          recentContributions.map((c, i) => (
            <View key={c.id}>
              {i > 0 && <Divider style={styles.divider} />}
              <View style={styles.contribRow}>
                <Text style={[styles.contribDate, { color: colors.textSecondary }]}>{formatDate(c.createdAt)}</Text>
                <Text style={[styles.contribAmount, { color: colors.success }]}>+{formatCurrency(c.amount)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan History</Text>
        {loanHistory.length === 0 ? (
          <EmptyState title="No loans yet" />
        ) : (
          loanHistory.map((loan) => (
            <View key={loan.id} style={styles.loanRow}>
              <View style={styles.loanInfo}>
                <Text style={[styles.loanAmount, { color: colors.text }]}>{formatCurrency(loan.amountApproved ?? loan.amountRequested)}</Text>
                <Text style={[styles.loanRepaid, { color: colors.textSecondary }]}>{formatCurrency(loan.amountRepaid)} repaid</Text>
              </View>
              <Badge
                label={loan.status.toLowerCase().replace(/_/g, " ")}
                variant={loan.status === "ACTIVE" ? "warning" : loan.status === "REPAID" ? "success" : "error"}
              />
            </View>
          ))
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Member</Text>
        <Button
          title={member.status === "ACTIVE" ? "Deactivate Member" : "Activate Member"}
          variant={member.status === "ACTIVE" ? "outline" : "primary"}
          loading={actionLoading}
          style={{ marginBottom: 10 }}
          onPress={() => {
            const next = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            const label = next === "INACTIVE" ? "Deactivate" : "Activate";
            Alert.alert(`${label} Member`, `Are you sure you want to ${label.toLowerCase()} ${member.fullName}?`, [
              { text: "Cancel", style: "cancel" },
              {
                text: label,
                onPress: async () => {
                  setActionLoading(true);
                  try {
                    await api.patch(`/api/members/${memberId}/status`, { status: next });
                    setMember((m) => m ? { ...m, status: next } : m);
                  } catch {
                    Alert.alert("Error", "Could not update member status.");
                  } finally {
                    setActionLoading(false);
                  }
                },
              },
            ]);
          }}
        />
        <Button
          title="Delete Member"
          variant="danger"
          loading={actionLoading}
          onPress={() => {
            Alert.alert("Delete Member", `This will permanently delete ${member.fullName} and all their data. This cannot be undone.`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  setActionLoading(true);
                  try {
                    await api.delete(`/api/members/${memberId}`);
                    router.replace("/(admin)/members");
                  } catch {
                    Alert.alert("Error", "Could not delete member.");
                  } finally {
                    setActionLoading(false);
                  }
                },
              },
            ]);
          }}
        />
      </Card>

      <View style={styles.actions}>
        <Button title="View Contributions" onPress={() => router.push("/(admin)/contributions")} variant="outline" style={styles.actionBtn} />
        <Button
          title={pendingLoan ? "Review Loan" : "Loan Queue"}
          onPress={() => pendingLoan ? router.push(`/(admin)/loan-review?id=${pendingLoan.id}`) : router.push("/(admin)/loan-queue")}
          variant="primary"
          style={styles.actionBtn}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  avatar: {},
  profileInfo: { flex: 1, gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 13 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  financialRow: { flexDirection: "row", gap: 12 },
  financialItem: { flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: 10, borderWidth: 1, gap: 6 },
  financialLabel: { fontSize: 11, fontWeight: "500" },
  financialValue: { fontSize: 17, fontWeight: "700" },
  divider: { marginVertical: 8 },
  contribRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  contribDate: { fontSize: 13 },
  contribAmount: { fontSize: 14, fontWeight: "600" },
  loanRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  loanInfo: { gap: 2 },
  loanAmount: { fontSize: 15, fontWeight: "600" },
  loanRepaid: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1 },
});
