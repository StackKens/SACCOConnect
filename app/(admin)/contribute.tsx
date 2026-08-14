import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { PaymentMethodRow } from "@/components/ui/PaymentMethodRow";
import { SuccessState } from "@/components/ui/SuccessState";
import { useTheme } from "@/hooks/useTheme";
import { useCountry } from "@/hooks/useCountry";
import { useAuthStore, syncMemberData } from "@/store/auth.store";
import { dueDateLabel, formatDate } from "@/utils/date";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/services/auth.service";
import { enqueue } from "@/services/offlineQueue";
import { formatCurrency } from "@/utils/currency";
import { formatPhoneNumber } from "@/shared/formatters/phone";
import { checkMobileMoneyNumber, isValidBankAccount } from "@/shared/formatters/mobileMoney";
import { Smartphone, Landmark } from "lucide-react-native";
import { useTranslation } from "react-i18next";

type PaymentMethod = "MTN" | "Airtel" | "Bank";
type Step = "details" | "confirm" | "success";

const METHODS: { key: PaymentMethod; label: string; sublabel: string; apiValue: string; icon: "mobile" | "bank" }[] = [
  { key: "MTN", label: "MTN Mobile Money", sublabel: "Pay via mobile money", apiValue: "MOBILE_MONEY", icon: "mobile" },
  { key: "Airtel", label: "Airtel Money", sublabel: "Pay via mobile money", apiValue: "MOBILE_MONEY", icon: "mobile" },
  { key: "Bank", label: "Bank Transfer", sublabel: "Transfer from your bank account", apiValue: "BANK_TRANSFER", icon: "bank" },
];

function mask(value: string) {
  if (value.length <= 4) return value;
  return `${value.slice(0, 4)}••••${value.slice(-3)}`;
}

export default function AdminContribute() {
  const { t } = useTranslation("admin");
  const [step, setStep] = useState<Step>("details");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("MTN");
  const [phone, setPhone] = useState(() => useAuthStore.getState().user?.phone ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [offline, setOffline] = useState(false);
  const { colors, spacing, radius, typography } = useTheme();
  const { country } = useCountry();
  const sacco = useAuthStore((state) => state.sacco);
  const user = useAuthStore((state) => state.user);
  const dueDate = sacco?.contributionDueDate;
  const isMobile = method === "MTN" || method === "Airtel";
  const selectedMethod = METHODS.find((m) => m.key === method)!;
  const numAmount = parseFloat(amount);
  const validAmount = !isNaN(numAmount) && numAmount > 0;
  const mobileCheck = isMobile ? checkMobileMoneyNumber(phone, country, method) : null;
  const bankValid = method !== "Bank" || isValidBankAccount(accountNumber);
  const mobileError =
    isMobile && phone.trim().length > 0 && mobileCheck && !mobileCheck.valid
      ? mobileCheck.reason === "wrong_provider"
        ? t("contribute.invalidProvider", { provider: method })
        : t("contribute.enterValidNumber")
      : undefined;
  const bankError = method === "Bank" && accountNumber.trim().length > 0 && !bankValid ? t("contribute.enterValidAccount") : undefined;

  const handleContinue = () => {
    if (!validAmount) {
      Alert.alert(t("contribute.invalidAmount"), t("contribute.enterValidAmount"));
      return;
    }
    if (isMobile && mobileCheck && !mobileCheck.valid) {
      Alert.alert(
        t("contribute.invalidNumber"),
        mobileCheck.reason === "wrong_provider"
          ? t("contribute.invalidProvider", { provider: method })
          : t("contribute.enterValidNumber"),
      );
      return;
    }
    if (method === "Bank" && !bankValid) {
      Alert.alert(t("contribute.invalidAccount"), t("contribute.enterValidAccount"));
      return;
    }
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setLoading(true);
    const body = {
      amount: numAmount,
      method: selectedMethod.apiValue,
      transactionRef: isMobile ? phone.trim() : accountNumber.trim() || undefined,
    };
    const year = new Date().getFullYear();

    try {
      const NetInfo = require("@react-native-community/netinfo").default;
      const net = await NetInfo.fetch();

      if (!net.isConnected) {
        enqueue({ endpoint: "/api/contributions", method: "POST", body });
        setOffline(true);
        setReference(`SC-${year}-${Date.now().toString().slice(-6)}`);
        setStep("success");
        return;
      }

      const res = await api.post("/api/contributions", body);
      const userId = user?.id;
      if (userId) await syncMemberData(userId);
      setOffline(false);
      setReference((res.data?.data?.reference as string) ?? `SC-${year}-${Date.now().toString().slice(-6)}`);
      setStep("success");
    } catch (e) {
      Alert.alert(t("contribute.error"), getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <PageHeader
      title={t("contribute.title")}
      subtitle={step === "confirm" ? t("contribute.reviewConfirm") : step === "success" ? "" : t("contribute.chooseMethod")}
      showBack
      onBack={() => (step === "confirm" ? setStep("details") : router.back())}
    />
  );

  if (step === "success") {
    return (
      <ScreenWrapper header={renderHeader()}>
        <SuccessState
          title={offline ? t("contribute.savedOffline") : t("contribute.initiated")}
          subtitle={
            offline
              ? t("contribute.offlineMsg", { amount: formatCurrency(numAmount) })
              : isMobile
                ? t("contribute.mobilePrompt", { amount: formatCurrency(numAmount) })
                : t("contribute.bankSubmitted", { amount: formatCurrency(numAmount) })
          }
          reference={reference}
          primaryActionLabel={t("admin.done")}
          onPrimaryAction={() => router.replace("/(admin)/account")}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper header={renderHeader()}>
      {dueDate && step === "details" && (
        <View style={{ backgroundColor: colors.infoSoft as string, borderWidth: 1, borderColor: colors.info + "30", borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.xl }}>
          <Text style={[typography.captionMedium, { color: colors.text }]}>{t("contribute.dueBy", { date: formatDate(dueDate), label: dueDateLabel(dueDate) })}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {t("contribute.expectedAmount", { amount: formatCurrency(sacco?.contributionAmount ?? 0) })}
          </Text>
        </View>
      )}

      {step === "details" ? (
        <>
          <View style={{ marginBottom: spacing.xxl }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t("amount")}</Text>
            <Text style={[typography.display, { color: colors.text, marginTop: spacing.xs, fontVariant: ["tabular-nums"] }]}>
              {formatCurrency(validAmount ? numAmount : 0)}
            </Text>
            <Input
              label={t("contribute.amountLabel", { currency: country.currency })}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder={t("contribute.amountPlaceholder")}
              containerStyle={{ marginTop: spacing.lg }}
            />
          </View>

          <Text style={[typography.captionMedium, { color: colors.text, marginBottom: spacing.md }]}>{t("contribute.paymentMethod")}</Text>
          <View style={{ gap: spacing.md }}>
            {METHODS.map((m) => (
              <PaymentMethodRow
                key={m.key}
                label={m.key === "MTN" ? t("contribute.mtnLabel") : m.key === "Airtel" ? t("contribute.airtelLabel") : t("contribute.bankLabel")}
                sublabel={m.key === "MTN" || m.key === "Airtel" ? t("contribute.mobileMoneySublabel") : t("contribute.bankSublabel")}
                icon={
                  m.icon === "mobile"
                    ? <Smartphone size={22} color={method === m.key ? colors.secondary : colors.textMuted} />
                    : <Landmark size={22} color={method === m.key ? colors.secondary : colors.textMuted} />
                }
                selected={method === m.key}
                onPress={() => setMethod(m.key)}
              />
            ))}
          </View>

          {isMobile && (
            <>
              <Divider style={{ marginVertical: spacing.xl }} />
              <Input
                label={t("contribute.mobileMoneyNumber", { provider: method === "MTN" ? "MTN" : "Airtel" })}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder={formatPhoneNumber("000000000", country).replace(country.phoneCode + " ", "")}
                error={mobileError}
              />
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: -10 }]}>
                {t("contribute.paymentPromptNote")}
              </Text>
            </>
          )}

          {method === "Bank" && (
            <>
              <Divider style={{ marginVertical: spacing.xl }} />
              <Input
                label={t("contribute.bankAccountNumber")}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                placeholder={t("contribute.accountPlaceholder")}
                error={bankError}
              />
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: -10 }]}>
                {t("contribute.bankNote")}
              </Text>
            </>
          )}

          <Button title={t("common.continue")} onPress={handleContinue} style={{ marginTop: spacing.xl, marginBottom: spacing.huge }} />
        </>
      ) : (
        <View>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl }}>
            <Text style={[typography.micro, { color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }]}>{t("contribute.youAreContributing")}</Text>
            <Text style={[typography.display, { color: colors.text, marginTop: spacing.sm, fontVariant: ["tabular-nums"] }]}>{formatCurrency(numAmount)}</Text>

            <Divider style={{ marginVertical: spacing.xl }} />

            <View style={{ gap: spacing.lg }}>
              <ConfirmRow label={t("contribute.paymentMethod")} value={selectedMethod.label} />
              {isMobile && <ConfirmRow label={t("contribute.phoneLabel")} value={mask(phone.trim())} />}
              {method === "Bank" && <ConfirmRow label={t("contribute.accountLabel")} value={mask(accountNumber.trim())} />}
              {sacco && <ConfirmRow label={t("admin.member")} value={sacco.name} />}
            </View>
          </View>

          <Button title={t("contribute.confirmPayment")} onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.xl }} />
          <Button title={t("apply.back")} onPress={() => setStep("details")} variant="ghost" style={{ marginTop: spacing.md, marginBottom: spacing.huge }} />
        </View>
      )}
    </ScreenWrapper>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}
