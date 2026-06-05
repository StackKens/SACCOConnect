import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthStore();
  const { colors } = useTheme();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      const role = useAuthStore.getState().user?.role;
      router.replace(role === "admin" ? "/(admin)" : "/(member)");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in to your account
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Login" onPress={handleLogin} loading={loading} />
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={[styles.link, { color: colors.primary }]}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  link: { marginTop: 20, textAlign: "center", fontSize: 14 },
});
