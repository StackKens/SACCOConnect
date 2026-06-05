import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";

type PaymentMethod = "MTN" | "Airtel" | "Bank";

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "MTN", label: "MTN Mobile Money" },
  { key: "Airtel", label: "Airtel Money" },
  { key: "Bank", label: "Bank Transfer" },
];

export default function Contribute() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("MTN");
  const [phone, setPhone] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const { colors } = useTheme();

  const isMobile = method === "MTN" || method === "Airtel";

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (isMobile && phone.trim().length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid Uganda mobile number.");
      return;
    }

    if (method === "Bank" && accountNumber.trim().length < 6) {
      Alert.alert("Invalid Account", "Please enter a valid bank account number.");
      return;
    }

    if (isMobile) {
      Alert.alert(
        "Payment Request Sent",
        `A payment prompt has been sent to ${phone}.\nApprove it on your phone to complete the contribution.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Contribution Recorded", "Your bank transfer has been submitted for processing.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <ScreenWrapper>
      <PageHeader title="Make Contribution" subtitle="Choose your payment method" />

      <Card style={styles.card}>
        <Input
          label="Amount (UGX)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 50000"
        />

        <Divider style={styles.divider} />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Method</Text>
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
              placeholder="e.g. 0771234567"
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Enter the registered {method === "MTN" ? "MTN" : "Airtel"} number. You will receive a payment prompt to approve.
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
              Use your member ID as the transfer reference. Your contribution will be confirmed within 24 hours.
            </Text>
          </>
        )}
      </Card>

      <Button title="Submit Contribution" onPress={handleSubmit} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 10 },
  methodContainer: { gap: 10, marginBottom: 4 },
  methodBtn: {},
  divider: { marginVertical: 16 },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 6 },
});
