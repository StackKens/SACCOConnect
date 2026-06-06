import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Wallet, Banknote, Phone, Mail, Calendar } from "lucide-react-native";

const memberData = {
  id: "1",
  name: "Alice Wanjiku",
  email: "alice@example.com",
  phone: "+254712345678",
  joined: "2024-01-15",
  status: "active",
  totalSavings: 25000,
  activeLoan: 12000,
  loanHistory: [{ id: "L1", amount: 50000, repaid: 38000, status: "active" }],
  contributions: [
    { date: "2025-05-01", amount: 5000 },
    { date: "2025-04-01", amount: 5000 },
  ],
};

export default function MemberDetail() {
  const { id: _id } = useLocalSearchParams();
  const { colors } = useTheme();
  const member = memberData;

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title={member.name}
          subtitle="Member profile"
          showBack
          rightComponent={
            <Badge
              label={member.status}
              variant={member.status === "active" ? "success" : "error"}
            />
          }
        />
      }
    >
      {/* Identity card */}
      <Card style={styles.profileCard}>
        <Avatar name={member.name} size={72} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Mail size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{member.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{member.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Joined {formatDate(member.joined)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Financial summary */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Summary</Text>
        <View style={styles.financialRow}>
          <View style={[styles.financialItem, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
            <Wallet size={20} color={colors.success} />
            <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Total Savings</Text>
            <Text style={[styles.financialValue, { color: colors.text }]}>
              {formatCurrency(member.totalSavings)}
            </Text>
          </View>
          <View style={[styles.financialItem, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "30" }]}>
            <Banknote size={20} color={colors.warning} />
            <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Active Loan</Text>
            <Text style={[styles.financialValue, { color: colors.text }]}>
              {formatCurrency(member.activeLoan)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Recent contributions */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Contributions</Text>
        {member.contributions.map((c, i) => (
          <View key={i}>
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
        ))}
      </Card>

      {/* Loan history */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan History</Text>
        {member.loanHistory.map((loan) => (
          <View key={loan.id} style={styles.loanRow}>
            <View style={styles.loanInfo}>
              <Text style={[styles.loanAmount, { color: colors.text }]}>
                {formatCurrency(loan.amount)}
              </Text>
              <Text style={[styles.loanRepaid, { color: colors.textSecondary }]}>
                {formatCurrency(loan.repaid)} repaid
              </Text>
            </View>
            <Badge label={loan.status} variant={loan.status === "active" ? "warning" : "success"} />
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        <Button title="View Transactions" onPress={() => {}} variant="outline" style={styles.actionBtn} />
        <Button title="Approve Loan" onPress={() => {}} variant="primary" style={styles.actionBtn} />
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
  loanRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  loanInfo: { gap: 2 },
  loanAmount: { fontSize: 15, fontWeight: "600" },
  loanRepaid: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1 },
});
