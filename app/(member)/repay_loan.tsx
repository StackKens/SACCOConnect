import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { router } from "expo-router";

export default function RepayLoan() {
  const [amount, setAmount] = useState("");
  const { colors } = useTheme();
  const outstanding = 25000; // Mock – fetch from API

  const handlePayment = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    if (numAmount > outstanding) {
      Alert.alert("Error", "Amount exceeds outstanding balance");
      return;
    }
    // API call to process repayment
    Alert.alert("Success", `Payment of ${formatCurrency(numAmount)} received`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenWrapper header={<PageHeader title="Repay Loan" />}>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Outstanding Balance
        </Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(outstanding)}
        </Text>
        <Input
          label="Payment Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
        />
        <Button title="Make Payment" onPress={handlePayment} />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  card: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 4 },
  amount: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
});
