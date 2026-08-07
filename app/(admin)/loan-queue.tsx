import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Search, Inbox } from "lucide-react-native";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { SkeletonLoanQueue } from "@/components/ui/Skeleton";

interface LoanQueueItem {
  id: string;
  amountRequested: number;
  purpose: string;
  status: string;
  repaymentMonths: number;
  createdAt: string;
  member: { fullName: string };
}

export default function LoanQueue() {
  const { colors } = useTheme();
  const [loans, setLoans] = useState<LoanQueueItem[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/loans/queue");
    setLoans(res.data.data);
  });
  const [query, setQuery] = useState("");

  const filtered = loans.filter(
    (l) =>
      l.member.fullName.toLowerCase().includes(query.toLowerCase()) ||
      l.purpose.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ScreenWrapper header={<PageHeader title="Loan Applications" subtitle="Review and action pending requests" />}>
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or purpose..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.list}>
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonLoanQueue />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Inbox size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {loans.length === 0 ? "No pending applications" : "No results found"}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/(admin)/loan-review?id=${item.id}`)}
            >
              <Card style={styles.card}>
                <View style={styles.header}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{item.member.fullName}</Text>
                  <Badge label={item.status.replace(/_/g, " ").toLowerCase()} variant="warning" />
                </View>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amountRequested)}</Text>
                <Text style={[styles.details, { color: colors.textSecondary }]}>
                  Term: {item.repaymentMonths} months • {item.purpose}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  Applied: {formatDate(item.createdAt)}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  memberName: { fontSize: 16, fontWeight: "600" },
  amount: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  details: { fontSize: 14, marginBottom: 4 },
  date: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 48, gap: 10 },
  emptyText: { fontSize: 14 },
});
