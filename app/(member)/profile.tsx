import { View, Text, StyleSheet, Switch } from "react-native";
import { useState, useEffect } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";

export default function Profile() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useUIStore();
  const { colors, isDark } = useTheme();
  const [darkMode, setDarkMode] = useState(isDark);
  const [useSystem, setUseSystem] = useState(theme === "system");

  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark]);

  const handleDarkModeToggle = (val: boolean) => {
    setDarkMode(val);
    setTheme(val ? "dark" : "light");
    setUseSystem(false);
  };

  const handleSystemToggle = (val: boolean) => {
    setUseSystem(val);
    if (val) {
      setTheme("system");
    } else {
      setTheme(isDark ? "dark" : "light");
    }
  };

  return (
    <ScreenWrapper>
      <PageHeader title="Profile" subtitle="Manage your account & preferences" />
      <Card style={styles.profileCard}>
        <Avatar name={user?.name} size={80} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
        <Text style={[styles.role, { color: colors.primary }]}>
          {user?.role?.toUpperCase()}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        <View style={styles.settingRow}>
          <Text style={{ color: colors.text }}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            disabled={useSystem}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={{ color: colors.text }}>Use System Theme</Text>
          <Switch value={useSystem} onValueChange={handleSystemToggle} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Account
        </Text>
        <Button
          title="Change Password"
          onPress={() => {}}
          variant="outline"
          style={styles.accountBtn}
        />
        <Button
          title="Contact Support"
          onPress={() => {}}
          variant="outline"
          style={styles.accountBtn}
        />
      </Card>

      <Button
        title="Logout"
        onPress={() => {
          logout();
          router.replace("/(auth)/login");
        }}
        variant="danger"
        style={styles.logout}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: "center", marginBottom: 24 },
  avatar: { marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 4 },
  role: { fontSize: 12, fontWeight: "600" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  accountBtn: { marginBottom: 12 },
  logout: { marginTop: 8 },
});
