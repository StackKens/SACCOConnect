import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { useAuthStore } from "@/store/auth.store";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import { getContributionsForSacco, AdminContribution } from "@/helpers/members";

export default function AdminContributions() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const [contributions, setContributions] = useState<AdminContribution[]>([]);

  const refresh = useCallback(() => {
    if (!sacco?.id) {
      setContributions([]);
      return;
    }
    setContributions(getContributionsForSacco(sacco.id));
  }, [sacco?.id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const total = contributions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScreenWrapper
      scroll
      header={<PageHeader title="Contributions" subtitle="All member savings contributions" showBack onBack={() => router.back()} />}
    >

      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Collected</Text>
        <Text style={[styles.summaryAmount, { color: colors.text }]}>{formatCurrency(total)}</Text>
      </Card>

      <View style={styles.list}>
        {contributions.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No contributions recorded yet.
          </Text>
        ) : (
          contributions.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{item.memberName}</Text>
                  <Text style={[styles.detail, { color: colors.textSecondary }]}>
                    {formatDate(item.date)} • {item.method}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                  <Badge label={item.status} variant={item.status === "completed" ? "success" : "warning"} />
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  summaryCard: { alignItems: "center", marginBottom: 20 },
  summaryLabel: { fontSize: 14 },
  summaryAmount: { fontSize: 32, fontWeight: "bold", marginTop: 4 },
  list: { paddingBottom: 20 },
  emptyText: { textAlign: "center", fontSize: 14, marginTop: 24 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: "600" },
  detail: { fontSize: 12, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 16, fontWeight: "bold" },
});
