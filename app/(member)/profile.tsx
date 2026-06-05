import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking } from "react-native";
import { useState, useEffect } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Divider } from "@/components/ui/Divider";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";

const HOW_TO_USE = [
  { title: "Making a Contribution", desc: "Go to Savings and tap Make Contribution. Enter the amount, select your payment method, and confirm." },
  { title: "Applying for a Loan", desc: "Go to Loans and tap the + button. Fill in the amount, purpose, repayment term, and monthly income." },
  { title: "Repaying a Loan", desc: "Open an active loan card and tap Repay Loan. Enter the payment amount and confirm." },
  { title: "Viewing Statements", desc: "Open the side menu or navigate to Statement to download your full transaction history." },
];

export default function Profile() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useUIStore();
  const { colors, isDark } = useTheme();
  const [darkMode, setDarkMode] = useState(isDark);
  const [useSystem, setUseSystem] = useState(theme === "system");

  useEffect(() => { setDarkMode(isDark); }, [isDark]);

  const handleDarkModeToggle = (val: boolean) => {
    setDarkMode(val);
    setTheme(val ? "dark" : "light");
    setUseSystem(false);
  };

  const handleSystemToggle = (val: boolean) => {
    setUseSystem(val);
    setTheme(val ? "system" : isDark ? "dark" : "light");
  };

  return (
    <ScreenWrapper>
      <PageHeader title="Profile" subtitle="Manage your account & preferences" />

      <Card style={styles.profileCard}>
        <Avatar name={user?.name} size={80} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        <Text style={[styles.role, { color: colors.secondary }]}>
          {user?.role?.toUpperCase()}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={handleDarkModeToggle} disabled={useSystem} />
        </View>
        <Divider style={styles.divider} />
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Use System Theme</Text>
          <Switch value={useSystem} onValueChange={handleSystemToggle} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Use</Text>
        {HOW_TO_USE.map((item, i) => (
          <View key={i}>
            {i > 0 && <Divider style={styles.divider} />}
            <View style={styles.helpItem}>
              <View style={styles.helpText}>
                <Text style={[styles.helpTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.helpDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <TouchableOpacity
          style={styles.supportRow}
          onPress={() => Linking.openURL("mailto:support@saccoconnect.ug")}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Email Support</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity
          style={styles.supportRow}
          onPress={() => Linking.openURL("tel:+256800100200")}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Call Support Line</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <View style={styles.supportRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>App Version</Text>
          <Text style={[styles.helpDesc, { color: colors.textSecondary }]}>1.0.0</Text>
        </View>
      </Card>

      <Button
        title="Logout"
        onPress={() => { logout(); router.replace("/(auth)/login"); }}
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
  role: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  settingLabel: { fontSize: 14 },
  divider: { marginVertical: 10 },
  helpItem: { paddingVertical: 6 },
  helpText: { flex: 1 },
  helpTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  helpDesc: { fontSize: 13, lineHeight: 18 },
  supportRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  logout: { marginTop: 8, marginBottom: 24 },
});
