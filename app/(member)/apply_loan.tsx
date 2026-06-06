import { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";

export default function ApplyLoan() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [term, setTerm] = useState("");
  const [income, setIncome] = useState("");
  const { colors } = useTheme();

  const handleSubmit = () => {
    if (!amount || !purpose || !term || !income) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    // API call to submit loan application
    Alert.alert("Success", "Loan application submitted for review", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenWrapper scroll header={<PageHeader title="Apply for a Loan" />}>

      <Card style={styles.card}>
        <Input
          label="Loan Amount (UGX)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g., 50000"
        />
        <Input
          label="Purpose"
          value={purpose}
          onChangeText={setPurpose}
          placeholder="e.g., Business, Education, Emergency"
        />
        <Input
          label="Repayment Term (months)"
          value={term}
          onChangeText={setTerm}
          keyboardType="numeric"
          placeholder="e.g., 12"
        />
        <Input
          label="Monthly Income (UGX)"
          value={income}
          onChangeText={setIncome}
          keyboardType="numeric"
          placeholder="e.g., 30000"
        />
        <Button title="Submit Application" onPress={handleSubmit} />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  card: { marginBottom: 20 },
});
