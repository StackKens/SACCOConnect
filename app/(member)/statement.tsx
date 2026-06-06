import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Download } from "lucide-react-native";
import { useMemberDataStore } from "@/store/member.store";

export default function Statement() {
  const { colors } = useTheme();
  const { transactions } = useMemberDataStore();

  return (
    <ScreenWrapper header={
      <PageHeader
        title="Statement"
        rightComponent={
          <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert("Coming Soon", "PDF export will be available after backend integration.")}>
            <Download size={20} color={colors.primary} />
            <Text style={{ color: colors.primary }}>Export PDF</Text>
          </TouchableOpacity>
        }
      />
    }>
      <View style={styles.list}>
        {transactions.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.left}>
                <Text style={[styles.type, { color: colors.text }]}>
                  {item.type.replace(/_/g, " ").toUpperCase()}
                </Text>
                <Text style={[styles.reference, { color: colors.textSecondary }]}>
                  {item.reference}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {formatDate(item.date)}
                </Text>
              </View>
              <Text style={[styles.amount, { color: item.amount > 0 ? colors.success : colors.error }]}>
                {item.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(item.amount))}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flex: 1 },
  type: { fontSize: 16, fontWeight: "600" },
  reference: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "bold" },
});
