import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Wallet, Banknote, Phone, Calendar } from "lucide-react-native";
import { findMemberById } from "@/helpers/members";
import { getMemberData } from "@/store/member.store";
import { useLoanStore } from "@/store/loan.store";

export default function MemberDetail() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const memberId = Array.isArray(id) ? id[0] : id;
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const { loans } = useLoanStore();

  const stored = memberId ? findMemberById(memberId) : null;
  const member = stored?.user;
  const data = memberId ? getMemberData(memberId) : null;

  if (!member || !data) {
    return (
      <ScreenWrapper header={<PageHeader title="Member" showBack onBack={() => router.push("/(admin)/members")} />}>
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>
          Member not found.
        </Text>
      </ScreenWrapper>
    );
  }

  const totalSavings = data.contributions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.amount, 0);
  const activeLoanRecord = data.loans.find((l) => l.status === "active");
  const activeLoanBalance = activeLoanRecord
    ? activeLoanRecord.amount - activeLoanRecord.repaid
    : 0;
  const pendingApplication = loans.find(
    (l) => l.memberId === member.id && l.status === "pending",
  );
  const recentContributions = data.contributions.slice(0, 5);
  const loanHistory = data.loans.filter((l) => l.status !== "pending");

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title={member.name}
          subtitle="Member profile"
          showBack
          onBack={() => router.push("/(admin)/members")}
          rightComponent={
            <Badge label="active" variant="success" />
          }
        />
      }
    >
      <Card style={styles.profileCard}>
        <Avatar name={member.name} size={72} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Phone size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{member.phone}</Text>
          </View>
          {member.nationalId && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>ID: {member.nationalId}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {sacco?.name ?? member.saccoName ?? "SACCO member"}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Summary</Text>
        <View style={styles.financialRow}>
          <View style={[styles.financialItem, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
            <Wallet size={20} color={colors.success} />
            <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Total Savings</Text>
            <Text style={[styles.financialValue, { color: colors.text }]}>
              {formatCurrency(totalSavings)}
            </Text>
          </View>
          <View style={[styles.financialItem, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "30" }]}>
            <Banknote size={20} color={colors.warning} />
            <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Active Loan</Text>
            <Text style={[styles.financialValue, { color: colors.text }]}>
              {formatCurrency(activeLoanBalance)}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Contributions</Text>
        {recentContributions.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No contributions yet</Text>
        ) : (
          recentContributions.map((c, i) => (
            <View key={c.id}>
              {i > 0 && <Divider style={styles.divider} />}
              <View style={styles.contribRow}>
                <Text style={[styles.contribDate, { color: colors.textSecondary }]}>
                  {formatDate(c.date)}
                </Text>
                <Text style={[styles.contribAmount, { color: colors.success }]}>
                  +{formatCurrency(c.amount)}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan History</Text>
        {loanHistory.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No loans yet</Text>
        ) : (
          loanHistory.map((loan) => (
            <View key={loan.id} style={styles.loanRow}>
              <View style={styles.loanInfo}>
                <Text style={[styles.loanAmount, { color: colors.text }]}>
                  {formatCurrency(loan.amount)}
                </Text>
                <Text style={[styles.loanRepaid, { color: colors.textSecondary }]}>
                  {formatCurrency(loan.repaid)} repaid
                </Text>
              </View>
              <Badge
                label={loan.status}
                variant={
                  loan.status === "active"
                    ? "warning"
                    : loan.status === "repaid"
                      ? "success"
                      : "error"
                }
              />
            </View>
          ))
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="View Contributions"
          onPress={() => router.push("/(admin)/contributions")}
          variant="outline"
          style={styles.actionBtn}
        />
        <Button
          title={pendingApplication ? "Review Loan" : "Loan Queue"}
          onPress={() =>
            pendingApplication
              ? router.push(`/(admin)/loan-review?id=${pendingApplication.id}`)
              : router.push("/(admin)/loan-queue")
          }
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
  emptyText: { fontSize: 13, fontStyle: "italic" },
  actions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1 },
});
