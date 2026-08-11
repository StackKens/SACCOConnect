import { useState } from "react";
import { View, Text, StyleSheet, Alert, Keyboard } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/services/auth.service";
import { Fingerprint } from "lucide-react-native";
import { router } from "expo-router";

export default function Security() {
  const { colors } = useTheme();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validate = (): string | undefined => {
    if (!/^\d{4}$/.test(currentPin)) return "Enter your current 4-digit PIN.";
    if (!/^\d{4}$/.test(newPin)) return "Your new PIN must be 4 digits.";
    if (newPin === currentPin) return "New PIN must be different from the current PIN.";
    if (newPin !== confirmPin) return "New PINs do not match.";
    return undefined;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    Keyboard.dismiss();
    setLoading(true);
    try {
      await api.put("/api/auth/pin", { currentPin, newPin });
      Alert.alert("PIN updated", "Your PIN has been changed successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Could not change PIN", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      header={<PageHeader title="Security & PIN" subtitle="Change your login PIN" showBack />}
    >
      <Card style={styles.card}>
        <View style={styles.iconRow}>
          <Fingerprint size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Change PIN</Text>
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Your PIN is used to log in to SACCOConnect. It must be 4 digits.
        </Text>
        <Input
          label="Current PIN"
          value={currentPin}
          onChangeText={(t) => setCurrentPin(t.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
        />
        <Input
          label="New PIN"
          value={newPin}
          onChangeText={(t) => setNewPin(t.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
        />
        <Input
          label="Confirm New PIN"
          value={confirmPin}
          onChangeText={(t) => setConfirmPin(t.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          error={error}
        />
        <Button title="Update PIN" onPress={handleSubmit} loading={loading} disabled={loading} />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 4 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  hint: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
});
