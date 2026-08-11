import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { PaymentMethodRow } from "@/components/ui/PaymentMethodRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { router } from "expo-router";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { getApiErrorMessage } from "@/services/auth.service";
import { enqueue } from "@/services/offlineQueue";
import { Smartphone, Landmark, Banknote } from "lucide-react-native";

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

const METHODS: { key: RepayMethod; label: string; icon: React.ReactNode }[] = [
  { key: "MOBILE_MONEY", label: "Mobile Money", icon: <Smartphone size={22} color="#64748B" /> },
  { key: "BANK_TRANSFER", label: "Bank Transfer", icon: <Landmark size={22} color="#64748B" /> },
  { key: "CASH", label: "Cash", icon: <Banknote size={22} color="#64748B" /> },
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
  const { colors, spacing, radius, typography } = useTheme();

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
      Alert.alert("Error", `Amount exceeds outstanding balance of ${formatCurrency(outstanding)}.`);
      return;
    }

    setSubmitting(true);
    const body = { amountPaid: numAmount, method };
    try {
      const NetInfo = require("@react-native-community/netinfo").default;
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        enqueue({ endpoint: `/api/loans/${loan.id}/repay`, method: "POST", body });
        setLoan((l) => (l ? { ...l, amountRepaid: Math.min(l.totalRepayable, l.amountRepaid + numAmount) } : l));
        Alert.alert(
          "Saved Offline",
          `Payment of ${formatCurrency(numAmount)} queued. It will be submitted automatically when you're back online.`,
        );
        return;
      }
      const res = await api.post(`/api/loans/${loan.id}/repay`, body);
      const repaid = res.data.fullyRepaid;
      Alert.alert(
        repaid ? "Loan Fully Repaid" : "Payment Recorded",
        repaid
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
    <ScreenWrapper header={<PageHeader title="Repay Loan" showBack onBack={() => router.back()} />}>
      {error ? (
        <ErrorState title="Unable to load loan" message={error} onRetry={refresh} />
      ) : (
        <View style={{ paddingBottom: spacing.huge }}>
          <BalanceCard
            label="Outstanding Balance"
            amount={loading ? 0 : outstanding}
            hint={loan ? `${loan.purpose} · ${loan.repaymentMonths} months · ${loan.interestRate}% p.a.` : undefined}
            icon={<Banknote size={18} color={colors.primary} />}
          />

          {!loading && !loan && (
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xl }]}>
              You have no active loan right now.
            </Text>
          )}

          {fullyRepaid && (
            <View style={{ marginTop: spacing.xl, backgroundColor: colors.successSoft as string, borderRadius: radius.md, padding: spacing.lg }}>
              <Text style={[typography.bodyMedium, { color: colors.success }]}>Loan fully repaid.</Text>
            </View>
          )}

          {loan && !fullyRepaid && (
            <>
              <Text style={[typography.captionMedium, { color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md }]}>
                Payment Method
              </Text>
              <View style={{ gap: spacing.md }}>
                {METHODS.map((m) => (
                  <PaymentMethodRow
                    key={m.key}
                    label={m.label}
                    icon={m.icon}
                    selected={method === m.key}
                    onPress={() => setMethod(m.key)}
                  />
                ))}
              </View>

              <Input
                label="Payment Amount (UGX)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder={`Max ${formatCurrency(outstanding)}`}
                containerStyle={{ marginTop: spacing.xl }}
              />

              <Button title="Make Payment" onPress={handlePayment} loading={submitting} style={{ marginTop: spacing.xl }} />
            </>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}
