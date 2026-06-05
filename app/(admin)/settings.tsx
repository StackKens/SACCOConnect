import { View, Text, StyleSheet, Switch } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const { theme, setTheme } = useUIStore();
  const logout = useAuthStore((state) => state.logout);
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
      <PageHeader title="Settings" />

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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
        <Button
          title="Export Data (CSV)"
          onPress={() => {}}
          variant="outline"
          style={styles.exportBtn}
        />
        <Button
          title="Clear Cache"
          onPress={() => {}}
          variant="danger"
        />
      </Card>

      <Button title="Logout" onPress={() => { logout(); router.replace("/(auth)/login"); }} variant="danger" />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exportBtn: { marginBottom: 12 },
});
