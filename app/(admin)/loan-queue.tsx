import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Search, Inbox } from "lucide-react-native";
import { useLoanStore } from "@/store/loan.store";

export default function LoanQueue() {
  const { colors } = useTheme();
  const { loans } = useLoanStore();
  const [query, setQuery] = useState("");

  const pending = loans.filter((l) => l.status === "pending");

  const filtered = pending.filter(
    (l) =>
      l.memberName.toLowerCase().includes(query.toLowerCase()) ||
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
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Inbox size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {pending.length === 0 ? "No pending applications" : "No results found"}
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
                  <Text style={[styles.memberName, { color: colors.text }]}>{item.memberName}</Text>
                  <Badge label={item.status} variant="warning" />
                </View>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                <Text style={[styles.details, { color: colors.textSecondary }]}>
                  Term: {item.term} months • {item.purpose}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  Applied: {formatDate(item.date)}
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
