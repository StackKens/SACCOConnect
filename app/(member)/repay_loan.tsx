import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { router } from "expo-router";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { getApiErrorMessage } from "@/services/auth.service";
import { enqueue } from "@/services/offlineQueue";

interface ActiveLoan {
  id: string;
  amountApproved: number;
  amountRepaid: number;
  totalRepayable: number;
  purpose: string;
  repaymentMonths: number;
  interestRate: number;
}

type RepayMethod = "MOBILE_MONEY" | "BANK_TRANSFER" | "CASH";

const METHODS: { key: RepayMethod; label: string }[] = [
  { key: "MOBILE_MONEY", label: "Mobile Money" },
  { key: "BANK_TRANSFER", label: "Bank Transfer" },
  { key: "CASH", label: "Cash" },
];

export default function RepayLoan() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<RepayMethod>("MOBILE_MONEY");
  const [loan, setLoan] = useState<ActiveLoan | null>(null);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/loans/my/active");
    setLoan(res.data.data);
  });
  const [submitting, setSubmitting] = useState(false);
  const { colors } = useTheme();

  const outstanding = loan ? loan.totalRepayable - loan.amountRepaid : 0;
  const fullyRepaid = loan ? loan.amountRepaid >= loan.totalRepayable : false;

  const handlePayment = async () => {
    if (!loan) {
      Alert.alert("No Active Loan", "You don't have an active loan to repay.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Enter a valid amount.");
      return;
    }
    if (numAmount > outstanding) {
      Alert.alert(
        "Error",
        `Amount exceeds outstanding balance of ${formatCurrency(outstanding)}.`,
      );
      return;
    }

    setSubmitting(true);
    const body = { amountPaid: numAmount, method };
    try {
      const NetInfo = require("@react-native-community/netinfo").default;
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        enqueue({
          endpoint: `/api/loans/${loan.id}/repay`,
          method: "POST",
          body,
        });
        setLoan((l) =>
          l
            ? { ...l, amountRepaid: Math.min(l.totalRepayable, l.amountRepaid + numAmount) }
            : l,
        );
        Alert.alert(
          "Saved Offline",
          `Payment of ${formatCurrency(numAmount)} queued. It will be submitted automatically when you're back online.`,
        );
        return;
      }
      const res = await api.post(`/api/loans/${loan.id}/repay`, body);
      const fullyRepaid = res.data.fullyRepaid;
      Alert.alert(
        fullyRepaid ? "Loan Fully Repaid" : "Payment Recorded",
        fullyRepaid
          ? `Congratulations! You have fully repaid your loan of ${formatCurrency(loan.amountApproved)}.`
          : `Payment of ${formatCurrency(numAmount)} recorded. Remaining: ${formatCurrency(outstanding - numAmount)}.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper header={<PageHeader title="Repay Loan" />}>
      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Outstanding Balance
        </Text>
        <Text style={[styles.outstanding, { color: colors.text }]}>
          {loading ? "Loading..." : formatCurrency(outstanding)}
        </Text>

        {loan && (
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            {loan.purpose} · {loan.repaymentMonths} months · {loan.interestRate}
            % p.a.
          </Text>
        )}

        {fullyRepaid && (
          <Text style={[styles.fullyRepaid, { color: colors.success }]}>
            Loan fully repaid.
          </Text>
        )}

        {!loading && !loan && (
          <Text style={[styles.noLoan, { color: colors.textSecondary }]}>
            You have no active loan right now.
          </Text>
        )}

        {loan && !fullyRepaid && (
          <>
            <Text style={[styles.methodLabel, { color: colors.textSecondary }]}>
              Payment Method
            </Text>
            <View style={styles.methods}>
              {METHODS.map((m) => (
                <Button
                  key={m.key}
                  title={m.label}
                  onPress={() => setMethod(m.key)}
                  variant={method === m.key ? "primary" : "outline"}
                  style={styles.methodBtn}
                />
              ))}
            </View>

            <Input
              label="Payment Amount (UGX)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder={`Max ${formatCurrency(outstanding)}`}
            />
            <Button
              title="Make Payment"
              onPress={handlePayment}
              loading={submitting}
              disabled={!loan}
            />
          </>
        )}
      </Card>
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 4 },
  outstanding: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  detail: { fontSize: 13, marginBottom: 20 },
  noLoan: { fontSize: 14, marginBottom: 16 },
  fullyRepaid: { fontSize: 14, fontWeight: "600", marginBottom: 16 },
  methodLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 8,
  },
  methods: { gap: 8, marginBottom: 16 },
  methodBtn: {},
});
