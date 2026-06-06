import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { Phone, Lock } from "lucide-react-native";

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
      const role = useAuthStore.getState().user?.role;
      router.replace(role === "admin" ? "/(admin)" : "/(member)");
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

        <TouchableOpacity onPress={() => router.push("/(auth)/join")}>
          <Text style={[styles.link, { color: colors.primary }]}>
            New member? Join with an invite code
          </Text>
        </TouchableOpacity>

        {/* Demo credentials */}
        <View style={[styles.demo, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.demoTitle, { color: colors.text }]}>Demo Admin Login</Text>
          <Text style={[styles.demoText, { color: colors.textSecondary }]}>
            Phone: 0700000000{"\n"}PIN: 0000
          </Text>
          <TouchableOpacity
            onPress={() => { setPhone("0700000000"); setPin("0000"); }}
            style={[styles.demoFill, { borderColor: colors.border }]}
          >
            <Text style={[styles.demoFillText, { color: colors.primary }]}>Fill credentials</Text>
          </TouchableOpacity>
        </View>
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
  link: { textAlign: "center", fontSize: 14 },
  demo: { marginTop: 36, padding: 14, borderRadius: 10, borderWidth: 1 },
  demoTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  demoText: { fontSize: 12, lineHeight: 20 },
  demoFill: { marginTop: 10, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  demoFillText: { fontSize: 13, fontWeight: "600" },
});
