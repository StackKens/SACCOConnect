import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { PaymentMethodRow } from "@/components/ui/PaymentMethodRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { useCountry } from "@/hooks/useCountry";
import { formatCurrency } from "@/utils/currency";
import { router } from "expo-router";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { getApiErrorMessage } from "@/services/auth.service";
import { enqueue } from "@/services/offlineQueue";
import { Smartphone, Landmark, Banknote } from "lucide-react-native";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("loans");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<RepayMethod>("MOBILE_MONEY");
  const [loan, setLoan] = useState<ActiveLoan | null>(null);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/loans/my/active");
    setLoan(res.data.data);
  });
  const [submitting, setSubmitting] = useState(false);
  const { colors, spacing, radius, typography } = useTheme();
  const { country } = useCountry();

  const outstanding = loan ? loan.totalRepayable - loan.amountRepaid : 0;
  const fullyRepaid = loan ? loan.amountRepaid >= loan.totalRepayable : false;

  const handlePayment = async () => {
    if (!loan) {
      Alert.alert(t("repay.noActiveLoanTitle"), t("repay.noActiveLoanMsg"));
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(t("repay.error"), t("repay.enterValidAmount"));
      return;
    }
    if (numAmount > outstanding) {
      Alert.alert(t("repay.error"), t("repay.amountExceeds", { amount: formatCurrency(outstanding) }));
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
          t("repay.savedOffline"),
          t("repay.savedOfflineMsg", { amount: formatCurrency(numAmount) }),
        );
        return;
      }
      const res = await api.post(`/api/loans/${loan.id}/repay`, body);
      const repaid = res.data.fullyRepaid;
      Alert.alert(
        repaid ? t("repay.loanFullyRepaid") : t("repay.paymentRecorded"),
        repaid
          ? t("repay.congrats", { amount: formatCurrency(loan.amountApproved) })
          : t("repay.remaining", { amount: formatCurrency(numAmount), remaining: formatCurrency(outstanding - numAmount) }),
        [{ text: t("apply.done"), onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert(t("repay.error"), getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper header={<PageHeader title={t("repay.title")} showBack onBack={() => router.back()} />}>
      {error ? (
        <ErrorState title={t("repay.error")} message={error} onRetry={refresh} />
      ) : (
        <View style={{ paddingBottom: spacing.huge }}>
          <BalanceCard
            label={t("repay.outstandingBalance")}
            amount={loading ? 0 : outstanding}
            hint={loan ? `${loan.purpose} · ${loan.repaymentMonths} months · ${loan.interestRate}% p.a.` : undefined}
            icon={<Banknote size={18} color={colors.primary} />}
          />

          {!loading && !loan && (
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xl }]}>
              {t("repay.noActiveLoan")}
            </Text>
          )}

          {fullyRepaid && (
            <View style={{ marginTop: spacing.xl, backgroundColor: colors.successSoft as string, borderRadius: radius.md, padding: spacing.lg }}>
              <Text style={[typography.bodyMedium, { color: colors.success }]}>{t("repay.fullyRepaid")}</Text>
            </View>
          )}

          {loan && !fullyRepaid && (
            <>
              <Text style={[typography.captionMedium, { color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md }]}>
                {t("repay.paymentMethod")}
              </Text>
              <View style={{ gap: spacing.md }}>
                {METHODS.map((m) => (
                  <PaymentMethodRow
                    key={m.key}
                    label={m.label}
                    icon={
                      m.key === "MOBILE_MONEY"
                        ? <Smartphone size={22} color={method === m.key ? colors.secondary : colors.textMuted} />
                        : m.key === "BANK_TRANSFER"
                          ? <Landmark size={22} color={method === m.key ? colors.secondary : colors.textMuted} />
                          : <Banknote size={22} color={method === m.key ? colors.secondary : colors.textMuted} />
                    }
                    selected={method === m.key}
                    onPress={() => setMethod(m.key)}
                  />
                ))}
              </View>

              <Input
                label={t("repay.paymentAmount", { currency: country.currency })}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder={t("repay.maxAmount", { amount: formatCurrency(outstanding) })}
                containerStyle={{ marginTop: spacing.xl }}
              />

              <Button title={t("repay.makePayment")} onPress={handlePayment} loading={submitting} style={{ marginTop: spacing.xl }} />
            </>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}
