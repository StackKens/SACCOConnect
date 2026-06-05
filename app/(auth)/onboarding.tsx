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
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>SACCOConnect</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Digital Savings & Loan Management
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Powered by Financial Inclusion
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: { width: 120, height: 120, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 8 },
  tagline: { fontSize: 14, marginBottom: 48 },
  buttonContainer: { width: "100%" },
});
