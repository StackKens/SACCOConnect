import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react-native";

const ADMIN_HOW_TO = [
  { title: "Approving a Loan", desc: "Go to Loan Queue, tap any pending application to open the review screen, then tap Approve or Reject." },
  { title: "Adding a Member", desc: "Go to Members and tap Add Member. Fill in their details. An invite code will be generated for them to register." },
  { title: "Posting Announcements", desc: "Go to Settings or use the Announcements screen to compose and publish a message to all members." },
  { title: "Viewing Treasury", desc: "The Treasury tab shows total savings, disbursed loans, repayments, and outstanding balances in real time." },
  { title: "Exporting Data", desc: "Use the Export Data button below to download a CSV of all transactions for reporting." },
];

export default function AdminSettings() {
  const { theme, setTheme } = useUIStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
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
      <PageHeader title="Settings" subtitle="Admin controls & preferences" />

      <Card style={styles.profileRow}>
        <Text style={[styles.adminName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.adminEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        <Text style={[styles.adminBadge, { color: colors.secondary }]}>ADMINISTRATOR</Text>
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
        {ADMIN_HOW_TO.map((item, i) => (
          <View key={i}>
            {i > 0 && <Divider style={styles.divider} />}
            <View style={styles.helpItem}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.helpDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
        <Button title="Export Data (CSV)" onPress={() => {}} variant="outline" style={styles.exportBtn} />
        <Button title="Clear Cache" onPress={() => {}} variant="danger" />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL("mailto:admin@saccoconnect.ug")}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Email Support</Text>
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
  profileRow: { marginBottom: 20 },
  adminName: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  adminEmail: { fontSize: 14, marginBottom: 4 },
  adminBadge: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  settingLabel: { fontSize: 14 },
  divider: { marginVertical: 10 },
  helpItem: { paddingVertical: 6 },
  helpTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  helpDesc: { fontSize: 13, lineHeight: 18 },
  supportRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  exportBtn: { marginBottom: 12 },
  logout: { marginTop: 8, marginBottom: 24 },
});
