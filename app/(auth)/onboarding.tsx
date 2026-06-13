import { View, Text, StyleSheet, Image } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function Onboarding() {
  const { colors } = useTheme();

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
            Digital Savings & Loan Management
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Invite-only. Secure. Built for Uganda.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Create a SACCO"
            onPress={() => router.push("/(auth)/register-admin" as any)}
          />
          <Button
            title="Join a SACCO"
            onPress={() => router.push("/(auth)/join" as any)}
            variant="outline"
            style={{ marginTop: 12 }}
          />
          <Button
            title="Log In"
            onPress={() => router.push("/(auth)/login")}
            variant="outline"
            style={{ marginTop: 12 }}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Returning user? Log in with your phone and PIN.
          </Text>
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
  tagline: { fontSize: 13, textAlign: "center" },
  buttons: { gap: 0 },
  hint: { fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 18 },
});
