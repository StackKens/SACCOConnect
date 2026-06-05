import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";

const loanDetail = {
  id: "LA1",
  memberName: "John Doe",
  amount: 100000,
  term: 12,
  interestRate: 12,
  purpose: "Business expansion",
  date: "2025-06-01",
  status: "pending",
  memberSince: "2023-01-10",
  totalSavings: 45000,
};

export default function LoanReview() {
  const { id: _id } = useLocalSearchParams();
  const { colors } = useTheme();

  const handleApprove = () => {
    // API call to approve loan
    router.back();
  };

  const handleReject = () => {
    // API call to reject loan
    router.back();
  };

  return (
    <ScreenWrapper scroll>
      <PageHeader title="Loan Review" />

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Applicant
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {loanDetail.memberName}
        </Text>

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}
        >
          Amount Requested
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {formatCurrency(loanDetail.amount)}
        </Text>

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}
        >
          Term
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {loanDetail.term} months
        </Text>

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}
        >
          Interest Rate
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {loanDetail.interestRate}% p.a.
        </Text>

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}
        >
          Purpose
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {loanDetail.purpose}
        </Text>

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}
        >
          Member Since
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {loanDetail.memberSince}
        </Text>

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}
        >
          Total Savings
        </Text>
        <Text style={[styles.value, { color: colors.success }]}>
          {formatCurrency(loanDetail.totalSavings)}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Approve"
          onPress={handleApprove}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Reject"
          onPress={handleReject}
          variant="danger"
          style={styles.button}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  value: { fontSize: 16, marginBottom: 8 },
  actions: { flexDirection: "row", gap: 12 },
  button: { flex: 1 },
});
