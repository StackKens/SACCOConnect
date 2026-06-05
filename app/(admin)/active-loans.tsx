import { View, Text, FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";

const activeLoansData = [
  {
    id: "L1",
    member: "Alice Wanjiku",
    amount: 50000,
    repaid: 20000,
    status: "active",
    dueDate: "2025-07-15",
  },
  {
    id: "L2",
    member: "Bob Omondi",
    amount: 30000,
    repaid: 30000,
    status: "completed",
    dueDate: "2025-05-10",
  },
];

export default function ActiveLoans() {
  const { colors } = useTheme();

  const renderItem = ({ item }) => {
    const progress = item.repaid / item.amount;
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.memberName, { color: colors.text }]}>
            {item.member}
          </Text>
          <Badge
            label={item.status}
            variant={item.status === "active" ? "warning" : "success"}
          />
        </View>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(item.amount)}
        </Text>
        <ProgressBar progress={progress} height={8} />
        <View style={styles.progressLabels}>
          <Text style={{ color: colors.textSecondary }}>
            Repaid: {formatCurrency(item.repaid)}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Remaining: {formatCurrency(item.amount - item.repaid)}
          </Text>
        </View>
        <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
          Due: {item.dueDate}
        </Text>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <PageHeader title="Active Loans" />
      <FlatList
        data={activeLoansData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  memberName: { fontSize: 16, fontWeight: "600" },
  amount: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  dueDate: { fontSize: 12, marginTop: 8 },
});
