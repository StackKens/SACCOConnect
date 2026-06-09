import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { dueDateLabel, formatDate } from "@/utils/date";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/services/auth.service";
import { enqueue } from "@/services/offlineQueue";

type PaymentMethod = "MTN" | "Airtel" | "Bank";

const METHODS: { key: PaymentMethod; label: string; apiValue: string }[] = [
  { key: "MTN", label: "MTN Mobile Money", apiValue: "MOBILE_MONEY" },
  { key: "Airtel", label: "Airtel Money", apiValue: "MOBILE_MONEY" },
  { key: "Bank", label: "Bank Transfer", apiValue: "BANK_TRANSFER" },
];

export default function Contribute() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("MTN");
  const [phone, setPhone] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const dueDate = sacco?.contributionDueDate;
  const isMobile = method === "MTN" || method === "Airtel";
  const selectedMethod = METHODS.find((m) => m.key === method)!;

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (isMobile && phone.trim().length < 9) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid Uganda mobile number.",
      );
      return;
    }
    if (method === "Bank" && accountNumber.trim().length < 6) {
      Alert.alert(
        "Invalid Account",
        "Please enter a valid bank account number.",
      );
      return;
    }

    setLoading(true);
    const body = {
      amount: numAmount,
      method: selectedMethod.apiValue,
      transactionRef: isMobile
        ? phone.trim()
        : accountNumber.trim() || undefined,
    };

    try {
      const NetInfo = require("@react-native-community/netinfo").default;
      const net = await NetInfo.fetch();

      if (!net.isConnected) {
        // offline — queue it
        enqueue({ endpoint: "/api/contributions", method: "POST", body });
        Alert.alert(
          "Saved Offline",
          `UGX ${numAmount.toLocaleString()} contribution saved. It will be submitted automatically when you're back online.`,
          [{ text: "OK", onPress: () => router.back() }],
        );
        return;
      }

      await api.post("/api/contributions", body);

      Alert.alert(
        isMobile ? "Payment Request Sent" : "Contribution Recorded",
        isMobile
          ? `A payment prompt will be sent to ${phone}. Approve it to complete your contribution.`
          : "Your bank transfer has been submitted for processing.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      header={
        <PageHeader
          title="Make Contribution"
          subtitle="Choose your payment method"
        />
      }
    >
      {dueDate && (
        <View
          style={[
            styles.dueBanner,
            {
              backgroundColor: colors.primary + "12",
              borderColor: colors.primary + "30",
            },
          ]}
        >
          <Text style={[styles.dueBannerText, { color: colors.text }]}>
            Due by {formatDate(dueDate)} · {dueDateLabel(dueDate)}
          </Text>
          <Text style={[styles.dueBannerSub, { color: colors.textSecondary }]}>
            Expected amount: UGX{" "}
            {sacco?.contributionAmount?.toLocaleString() ?? "—"}
          </Text>
        </View>
      )}

      <Card style={styles.card}>
        <Input
          label="Amount (UGX)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 50000"
        />
        <Divider style={styles.divider} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Payment Method
        </Text>
        <View style={styles.methodContainer}>
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

        {isMobile && (
          <>
            <Divider style={styles.divider} />
            <Input
              label={`${method === "MTN" ? "MTN" : "Airtel"} Mobile Money Number`}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder={method === "MTN" ? "0771234567" : "0751234567"}
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Enter the registered {method === "MTN" ? "MTN" : "Airtel"} number.
              You will receive a payment prompt to approve.
            </Text>
          </>
        )}

        {method === "Bank" && (
          <>
            <Divider style={styles.divider} />
            <Input
              label="Bank Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              placeholder="e.g. 1234567890"
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Use your member ID as the transfer reference. Your contribution
              will be confirmed within 24 hours.
            </Text>
          </>
        )}
      </Card>

      <Button
        title="Submit Contribution"
        onPress={handleSubmit}
        loading={loading}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  dueBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  dueBannerText: { fontSize: 14, fontWeight: "600" },
  dueBannerSub: { fontSize: 12, marginTop: 4 },
  card: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 10 },
  methodContainer: { gap: 10, marginBottom: 4 },
  methodBtn: {},
  divider: { marginVertical: 16 },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 6 },
});
