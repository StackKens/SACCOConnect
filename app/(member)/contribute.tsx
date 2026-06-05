import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";

export default function Contribute() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  const { colors } = useTheme();

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    // API call
    Alert.alert("Success", "Contribution recorded", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenWrapper>
      <PageHeader title="Make Contribution" />
      <Card style={styles.card}>
        <Input
          label="Amount (UGX)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g., 5000"
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Payment Method
        </Text>
        <View style={styles.methodContainer}>
          <Button
            title="M-Pesa"
            onPress={() => setPaymentMethod("M-Pesa")}
            variant={paymentMethod === "M-Pesa" ? "primary" : "outline"}
            style={styles.methodBtn}
          />
          <Button
            title="Bank"
            onPress={() => setPaymentMethod("Bank")}
            variant={paymentMethod === "Bank" ? "primary" : "outline"}
            style={styles.methodBtn}
          />
        </View>
        <Button title="Submit Contribution" onPress={handleSubmit} />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  card: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, marginTop: 16 },
  methodContainer: { flexDirection: "row", gap: 12, marginBottom: 24 },
  methodBtn: { flex: 1 },
});
