import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!phone.trim() || pin.length < 4) {
      Alert.alert("Missing info", "Enter your phone number and 4-digit PIN.");
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
      Alert.alert("Login Failed", e?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in with your phone & PIN
          </Text>
        </View>

        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="e.g. 0712345678"
          autoCapitalize="none"
        />
        <Input
          label="4-Digit PIN"
          value={pin}
          onChangeText={(v) => { if (v.length <= 4) setPin(v); }}
          keyboardType="number-pad"
          secureTextEntry
          placeholder="••••"
          maxLength={4}
        />

        <Button title="Log In" onPress={handleLogin} loading={loading} style={styles.btn} />

        <TouchableOpacity onPress={() => router.push("/(auth)/onboarding")}>
          <Text style={[styles.link, { color: colors.primary }]}>
            Back to welcome
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
