import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking, Alert } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { ChevronRight, Settings2 } from "lucide-react-native";
import { formatDate } from "@/utils/date";
import { exportSaccoCsv } from "@/helpers/exportData";

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
  const clearAppCache = useAuthStore((state) => state.clearAppCache);
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
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
    <ScreenWrapper header={<PageHeader title="Settings" subtitle="Admin controls & preferences" />}>

      <Card style={styles.profileRow}>
        {sacco && (
          <View style={styles.saccoIdentity}>
            <View style={[styles.saccoAvatar, { backgroundColor: sacco.logoColor ?? colors.primary }]}>
              <Text style={styles.saccoAvatarText}>
                {sacco.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.saccoName, { color: colors.text }]}>{sacco.name}</Text>
              <Text style={[styles.saccoMeta, { color: colors.textSecondary }]}>
                UGX {sacco.contributionAmount?.toLocaleString()} / month  •  {sacco.interestRate}% p.a.
              </Text>
            </View>
          </View>
        )}
        <Divider style={{ marginVertical: 12 }} />
        <Text style={[styles.adminName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.adminPhone, { color: colors.textSecondary }]}>{user?.phone}</Text>
        <Text style={[styles.adminBadge, { color: colors.secondary }]}>ADMINISTRATOR</Text>
      </Card>

      {/* Group Settings */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings2 size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Settings</Text>
        </View>
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/edit-rules")} accessibilityRole="button" accessibilityLabel="Edit group rules">
          <Text style={[styles.settingLabel, { color: colors.text }]}>Edit Group Rules</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/contribution-schedule")} accessibilityRole="button" accessibilityLabel="Set contribution due date">
          <Text style={[styles.settingLabel, { color: colors.text }]}>Contribution Due Date</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/contributions")} accessibilityRole="button" accessibilityLabel="View all contributions">
          <Text style={[styles.settingLabel, { color: colors.text }]}>All Contributions</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/active-loans")} accessibilityRole="button" accessibilityLabel="View active loans">
          <Text style={[styles.settingLabel, { color: colors.text }]}>Active Loans</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        {sacco?.inviteCode && (
          <>
            <Divider style={styles.divider} />
            <Text style={[styles.rulesLabel, { color: colors.textSecondary }]}>Member invite code</Text>
            <Text style={[styles.inviteCode, { color: colors.primary }]}>{sacco.inviteCode}</Text>
            <Text style={[styles.rulePreview, { color: colors.textSecondary }]}>
              Share this code so new members can join in the app.
            </Text>
          </>
        )}
        <Divider style={styles.divider} />
        {sacco?.rules && sacco.rules.length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={[styles.rulesLabel, { color: colors.textSecondary }]}>
              {sacco.rules.length} active rule{sacco.rules.length !== 1 ? "s" : ""}
            </Text>
            {sacco.rules.slice(0, 3).map((r, i) => (
              <Text key={i} style={[styles.rulePreview, { color: colors.textSecondary }]} numberOfLines={1}>
                {i + 1}. {r}
              </Text>
            ))}
            {sacco.rules.length > 3 && (
              <Text style={[styles.rulesLabel, { color: colors.primary }]}>+{sacco.rules.length - 3} more...</Text>
            )}
          </View>
        )}
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
        <Button
          title="Export Data (CSV)"
          onPress={async () => {
            if (!sacco?.id) {
              Alert.alert("Unavailable", "No SACCO data to export.");
              return;
            }
            try {
              await exportSaccoCsv(sacco.id, sacco.name);
            } catch {
              Alert.alert("Export failed", "Could not share the export file.");
            }
          }}
          variant="outline"
          style={styles.exportBtn}
        />
        <Button
          title="Clear Cache"
          onPress={() => {
            Alert.alert(
              "Clear all local data?",
              "This removes saved members, loans, and preferences from this device.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear",
                  style: "destructive",
                  onPress: clearAppCache,
                },
              ],
            );
          }}
          variant="danger"
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL("mailto:admin@saccoconnect.ug")} accessibilityRole="button" accessibilityLabel="Email admin support">
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
        onPress={logout}
        variant="danger"
        style={styles.logout}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileRow: { marginBottom: 20 },
  saccoIdentity: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  saccoAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  saccoAvatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  saccoName: { fontSize: 15, fontWeight: "700" },
  saccoMeta: { fontSize: 12, marginTop: 2 },
  adminName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  adminPhone: { fontSize: 14, marginBottom: 4 },
  adminBadge: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  inviteCode: { fontSize: 28, fontWeight: "800", letterSpacing: 4, marginVertical: 6 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  rulesLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  rulePreview: { fontSize: 12, lineHeight: 18, marginBottom: 2 },
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
