import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";

export default function CreateSACCO() {
  const { colors } = useTheme();
  const { createSACCO } = useAuthStore();

  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [interest, setInterest] = useState("");
  const [rules, setRules] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert("Required", "Enter a SACCO name.");
    if (!contribution || isNaN(Number(contribution)))
      return Alert.alert("Required", "Enter a valid monthly contribution amount.");
    if (!interest || isNaN(Number(interest)))
      return Alert.alert("Required", "Enter a valid interest rate.");

    setLoading(true);
    try {
      await createSACCO({
        name: name.trim(),
        contributionAmount: Number(contribution),
        interestRate: Number(interest),
        rules: rules.trim(),
      });
      Alert.alert("SACCO Created ✅", `${name} is ready. You can now invite members.`, [
        { text: "Invite Members", onPress: () => router.replace("/(admin)/members") },
        { text: "Go to Dashboard", onPress: () => router.replace("/(admin)") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not create SACCO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      scroll
      header={<PageHeader title="Create SACCO" subtitle="Set up your group" showBack onBack={() => router.back()} />}
    >
      <Card style={styles.card}>
        <Input
          label="SACCO Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. UgandaSavings SACCO"
          autoCapitalize="words"
        />
        <Input
          label="Monthly Contribution (UGX)"
          value={contribution}
          onChangeText={setContribution}
          keyboardType="numeric"
          placeholder="e.g. 50000"
        />
        <Input
          label="Interest Rate (% per annum)"
          value={interest}
          onChangeText={setInterest}
          keyboardType="numeric"
          placeholder="e.g. 12"
        />
        <Input
          label="Rules & Notes (optional)"
          value={rules}
          onChangeText={setRules}
          placeholder="e.g. Loan limit is 3x savings. Late fee: 5%."
          multiline
          numberOfLines={4}
        />
        <Button title="Create SACCO" onPress={handleCreate} loading={loading} style={styles.btn} />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 24 },
  btn: { marginTop: 8 },
});
