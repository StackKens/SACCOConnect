import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/currency";

interface LoanProgressProps {
  loan: {
    id: string;
    totalAmount: number;
    repaidAmount: number;
    remainingAmount: number;
    nextPaymentDue?: string;
    interestRate?: number;
  };
  showDetails?: boolean;
}

export const LoanProgress: React.FC<LoanProgressProps> = ({
  loan,
  showDetails = true,
}) => {
  const { colors } = useTheme();
  const {
    totalAmount,
    repaidAmount,
    remainingAmount,
    nextPaymentDue,
    interestRate,
  } = loan;
  const progress = totalAmount > 0 ? repaidAmount / totalAmount : 0;

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>
        Loan Repayment Progress
      </Text>
      <ProgressBar progress={progress} height={10} />
      <View style={styles.statsRow}>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Total Loan
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Repaid
          </Text>
          <Text style={[styles.value, { color: colors.success }]}>
            {formatCurrency(repaidAmount)}
          </Text>
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Remaining
          </Text>
          <Text style={[styles.value, { color: colors.warning }]}>
            {formatCurrency(remainingAmount)}
          </Text>
        </View>
      </View>
      {showDetails && nextPaymentDue && (
        <Text style={[styles.nextPayment, { color: colors.textSecondary }]}>
          Next payment due: {nextPaymentDue}
        </Text>
      )}
      {showDetails && interestRate && (
        <Text style={[styles.interest, { color: colors.textSecondary }]}>
          Interest rate: {interestRate}% p.a.
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  label: { fontSize: 12 },
  value: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
  nextPayment: { fontSize: 12, marginTop: 12 },
  interest: { fontSize: 12, marginTop: 4 },
});
