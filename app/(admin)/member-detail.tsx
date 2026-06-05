import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { Wallet, Banknote } from "lucide-react-native";

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
  <ScreenWrapper scroll>
    <Card style={styles.profileCard}>
      <Avatar name={member.name} size={80} style={styles.avatar} />
      <Text style={[styles.name, { color: colors.text }]}>{member.name}</Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>
        {member.email}
      </Text>
      <Text style={[styles.phone, { color: colors.textSecondary }]}>
        {member.phone}
      </Text>
      <Badge
        label={member.status}
        variant={member.status === "active" ? "success" : "error"}
      />
    </Card>

    <Card style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Financial Summary
      </Text>
      <View style={styles.financialRow}>
        <View style={styles.financialItem}>
          <Wallet size={24} color={colors.secondary} />
          <Text
            style={[styles.financialLabel, { color: colors.textSecondary }]}
          >
            Total Savings
          </Text>
          <Text style={[styles.financialValue, { color: colors.text }]}>
            {formatCurrency(member.totalSavings)}
          </Text>
        </View>
        <View style={styles.financialItem}>
          <Banknote size={24} color={colors.warning} />
          <Text
            style={[styles.financialLabel, { color: colors.textSecondary }]}
          >
            Active Loan
          </Text>
          <Text style={[styles.financialValue, { color: colors.text }]}>
            {formatCurrency(member.activeLoan)}
          </Text>
        </View>
      </View>
    </Card>

    <View style={styles.actions}>
      <Button
        title="View Transactions"
        onPress={() => {}}
        variant="outline"
        style={styles.actionBtn}
      />
      <Button
        title="Approve Loan"
        onPress={() => {}}
        variant="primary"
        style={styles.actionBtn}
      />
    </View>
  </ScreenWrapper>;
}

const styles = StyleSheet.create({
  profileCard: { alignItems: "center", marginBottom: 20 },
  avatar: { marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 2 },
  phone: { fontSize: 14, marginBottom: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  financialRow: { flexDirection: "row", justifyContent: "space-around" },
  financialItem: { alignItems: "center" },
  financialLabel: { fontSize: 12, marginTop: 8 },
  financialValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1 },
});
