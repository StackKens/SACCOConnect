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
import { useTranslation } from "react-i18next";

export default function Security() {
  const { t } = useTranslation("profile");
  const { colors } = useTheme();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validate = (): string | undefined => {
    if (!/^\d{4}$/.test(currentPin)) return t("currentPinRequired");
    if (!/^\d{4}$/.test(newPin)) return t("newPinRequired");
    if (newPin === currentPin) return t("pinSame");
    if (newPin !== confirmPin) return t("pinMismatchNew");
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
      Alert.alert(t("pinUpdated"), t("pinUpdatedMsg"), [
        { text: t("apply.done"), onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(t("couldNotChangePin"), getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      header={<PageHeader title={t("securityTitle")} subtitle={t("securitySub")} showBack />}
    >
      <Card style={styles.card}>
        <View style={styles.iconRow}>
          <Fingerprint size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("changePin")}</Text>
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {t("pinHint")}
        </Text>
        <Input
          label={t("currentPin")}
          value={currentPin}
          onChangeText={(v) => setCurrentPin(v.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
        />
        <Input
          label={t("newPin")}
          value={newPin}
          onChangeText={(v) => setNewPin(v.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
        />
        <Input
          label={t("confirmNewPin")}
          value={confirmPin}
          onChangeText={(v) => setConfirmPin(v.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          error={error}
        />
        <Button title={t("updatePin")} onPress={handleSubmit} loading={loading} disabled={loading} />
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
