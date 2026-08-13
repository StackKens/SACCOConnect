import { View, Text, StyleSheet, Image } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { CountryLanguageSettings } from "@/components/preferences/CountryLanguageSettings";

export default function Entry() {
  const { colors } = useTheme();
  const { t } = useTranslation("auth");

  return (
    <ScreenWrapper scroll={false}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Image
            source={require("../../assets/Logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>
            SACCOConnect
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("entry.tagline")}
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            title={t("entry.createSacco")}
            onPress={() => router.push("/(auth)/register-admin" as any)}
          />
          <Button
            title={t("entry.joinSacco")}
            onPress={() => router.push("/(auth)/join" as any)}
            variant="outline"
            style={{ marginTop: 12 }}
          />
          <Button
            title={t("login")}
            onPress={() => router.push("/(auth)/login")}
            variant="outline"
            style={{ marginTop: 12 }}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t("entry.returningUser")}
          </Text>
        </View>

        <View style={styles.footer}>
          <CountryLanguageSettings />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 48,
    paddingHorizontal: 8,
  },
  top: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 110, height: 110, marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 6 },
  buttons: { gap: 0 },
  hint: { fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 18 },
  footer: { marginTop: 24 },
});
