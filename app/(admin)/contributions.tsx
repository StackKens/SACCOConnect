import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { router } from "expo-router";
import { useState } from "react";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { getApiErrorMessage } from "@/services/auth.service";
import { SkeletonMemberList } from "@/components/ui/Skeleton";

interface Contribution {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  transactionRef: string | null;
  member: { fullName: string };
}

export default function AdminContributions() {
  const { colors } = useTheme();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/contributions");
    setContributions(res.data.data);
  });
  const [confirming, setConfirming] = useState<string | null>(null);

  const handleConfirm = (id: string, memberName: string, amount: number) => {
    Alert.alert(
      "Confirm Contribution",
      `Confirm UGX ${amount.toLocaleString()} cash payment from ${memberName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setConfirming(id);
            try {
              await api.post(`/api/contributions/${id}/confirm`);
              setContributions((prev) =>
                prev.map((c) => c.id === id ? { ...c, status: "CONFIRMED" } : c)
              );
            } catch (e) {
              Alert.alert("Error", getApiErrorMessage(e));
            } finally {
              setConfirming(null);
            }
          },
        },
      ],
    );
  };

  const total = contributions
    .filter((c) => c.status === "CONFIRMED")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScreenWrapper scroll header={<PageHeader title="Contributions" subtitle="All member savings contributions" showBack onBack={() => router.back()} />}>

      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Confirmed</Text>
        <Text style={[styles.summaryAmount, { color: colors.text }]}>{formatCurrency(total)}</Text>
      </Card>

      {error ? <ErrorState message={error} onRetry={refresh} /> : loading ? <SkeletonMemberList /> : (
        <View style={styles.list}>
          {contributions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No contributions yet.</Text>
          ) : contributions.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{item.member.fullName}</Text>
                  <Text style={[styles.detail, { color: colors.textSecondary }]}>
                    {formatDate(item.createdAt)} · {item.method.replace(/_/g, " ")}
                  </Text>
                  {item.transactionRef && (
                    <Text style={[styles.ref, { color: colors.textSecondary }]}>Ref: {item.transactionRef}</Text>
                  )}
                </View>
                <View style={styles.right}>
                  <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                  <Badge
                    label={item.status.toLowerCase()}
                    variant={item.status === "CONFIRMED" ? "success" : "warning"}
                  />
                  {item.status === "PENDING" && (
                    <Button
                      title="Confirm"
                      variant="primary"
                      style={styles.confirmBtn}
                      loading={confirming === item.id}
                      onPress={() => handleConfirm(item.id, item.member.fullName, item.amount)}
                    />
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  left: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: "600" },
  detail: { fontSize: 12, marginTop: 2 },
  ref: { fontSize: 11, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 16, fontWeight: "bold" },
  confirmBtn: { marginTop: 4, paddingHorizontal: 12, height: 32 },
});
