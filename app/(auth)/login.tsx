import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { useCountry } from "@/hooks/useCountry";
import { formatPhoneNumber } from "@/shared/formatters/phone";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useTranslation("auth");
  const { country } = useCountry();

  const handleLogin = async () => {
    if (!phone.trim() || pin.length < 4) {
      Alert.alert(t("login.missingInfo"), t("login.missingInfoMessage"));
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), pin);
      const { user: loggedInUser } = useAuthStore.getState();
      if (loggedInUser?.role === "admin") {
        router.replace("/(admin)");
      } else {
        router.replace("/(member)");
      }
    } catch (e: any) {
      Vibration.vibrate(80);
      Alert.alert(t("login.failed"), e?.message || t("login.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t("welcomeBack")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("login.subtitle")}
          </Text>
        </View>

        <Input
          label={t("common:phone")}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder={formatPhoneNumber("000000000", country).replace(country.phoneCode + " ", "")}
          autoCapitalize="none"
        />
        <Input
          label={t("login.pinLabel")}
          value={pin}
          onChangeText={(v) => { if (v.length <= 4) setPin(v); }}
          keyboardType="number-pad"
          secureTextEntry
          placeholder="••••"
          maxLength={4}
        />

        <Button title={t("login")} onPress={handleLogin} loading={loading} style={styles.btn} />

        <TouchableOpacity onPress={() => router.push("/(auth)/entry")}>
          <Text style={[styles.link, { color: colors.primary }]}>
            {t("login.backToWelcome")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 15 },
  btn: { marginTop: 8, marginBottom: 20 },
  link: { textAlign: "center", fontSize: 14, marginTop: 8 },
});
