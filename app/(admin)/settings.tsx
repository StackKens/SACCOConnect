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
import { formatCurrency } from "@/utils/currency";
import { exportSaccoCsv } from "@/helpers/exportData";
import { CountryLanguageSettings } from "@/components/preferences/CountryLanguageSettings";
import { useTranslation } from "react-i18next";

export default function AdminSettings() {
  const { t } = useTranslation("admin");
  const { theme, setTheme } = useUIStore();
  const logout = useAuthStore((state) => state.logout);
  const clearAppCache = useAuthStore((state) => state.clearAppCache);
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const { colors, isDark } = useTheme();
  const [darkMode, setDarkMode] = useState(isDark);
  const [useSystem, setUseSystem] = useState(theme === "system");
  const adminHowTo = [
    ["settings.howToApproveTitle", "settings.howToApproveDesc"], ["settings.howToAddMemberTitle", "settings.howToAddMemberDesc"],
    ["settings.howToPostTitle", "settings.howToPostDesc"], ["settings.howToTreasuryTitle", "settings.howToTreasuryDesc"],
    ["settings.howToExportTitle", "settings.howToExportDesc"],
  ];

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
    <ScreenWrapper header={<PageHeader title={t("settings")} subtitle={t("settings.subtitle")} />}>

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
                {t("settings.monthlyRate", { amount: formatCurrency(sacco.contributionAmount ?? 0), rate: sacco.interestRate })}
              </Text>
            </View>
          </View>
        )}
        <Divider style={{ marginVertical: 12 }} />
        <Text style={[styles.adminName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.adminPhone, { color: colors.textSecondary }]}>{user?.phone}</Text>
        <Text style={[styles.adminBadge, { color: colors.secondary }]}>{t("administrator").toUpperCase()}</Text>
      </Card>

      {/* Group Settings */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings2 size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("settings.groupSettings")}</Text>
        </View>
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/edit-rules")} accessibilityRole="button" accessibilityLabel="Edit group rules">
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("editRules")}</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/contribution-schedule")} accessibilityRole="button" accessibilityLabel="Set contribution due date">
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("settings.contributionDueDate")}</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/contributions")} accessibilityRole="button" accessibilityLabel="View all contributions">
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("contributions")}</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.supportRow} onPress={() => router.push("/(admin)/active-loans")} accessibilityRole="button" accessibilityLabel="View active loans">
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("activeLoans")}</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        {sacco?.inviteCode && (
          <>
            <Divider style={styles.divider} />
            <Text style={[styles.rulesLabel, { color: colors.textSecondary }]}>{t("inviteCode")}</Text>
            <Text style={[styles.inviteCode, { color: colors.primary }]}>{sacco.inviteCode}</Text>
            <Text style={[styles.rulePreview, { color: colors.textSecondary }]}>
              {t("shareInviteCode")}
            </Text>
          </>
        )}
        <Divider style={styles.divider} />
        {sacco?.rules && sacco.rules.length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={[styles.rulesLabel, { color: colors.textSecondary }]}>
              {t("settings.activeRules", { count: sacco.rules.length })}
            </Text>
            {sacco.rules.slice(0, 3).map((r, i) => (
              <Text key={i} style={[styles.rulePreview, { color: colors.textSecondary }]} numberOfLines={1}>
                {i + 1}. {r}
              </Text>
            ))}
            {sacco.rules.length > 3 && (
              <Text style={[styles.rulesLabel, { color: colors.primary }]}>{t("settings.more", { count: sacco.rules.length - 3 })}</Text>
            )}
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("appearance")}</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("darkMode")}</Text>
          <Switch value={darkMode} onValueChange={handleDarkModeToggle} disabled={useSystem} />
        </View>
        <Divider style={styles.divider} />
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("useSystemTheme")}</Text>
          <Switch value={useSystem} onValueChange={handleSystemToggle} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("regionLanguage")}</Text>
        <CountryLanguageSettings />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("howToUse")}</Text>
        {adminHowTo.map(([title, desc], i) => (
          <View key={i}>
            {i > 0 && <Divider style={styles.divider} />}
            <View style={styles.helpItem}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>{t(title)}</Text>
              <Text style={[styles.helpDesc, { color: colors.textSecondary }]}>{t(desc)}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("data")}</Text>
        <Button
          title={t("exportData")}
          onPress={async () => {
            if (!sacco?.id) {
              Alert.alert(t("settings.unavailable"), t("settings.noDataToExport"));
              return;
            }
            try {
              await exportSaccoCsv(sacco.id, sacco.name);
            } catch {
              Alert.alert(t("settings.exportFailed"), t("settings.couldNotShare"));
            }
          }}
          variant="outline"
          style={styles.exportBtn}
        />
        <Button
          title={t("clearCache")}
          onPress={() => {
            Alert.alert(
              t("settings.clearDataTitle"), t("settings.clearDataDesc"),
              [
                { text: t("common:cancel"), style: "cancel" },
                {
                  text: t("settings.clear"),
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("support")}</Text>
        <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL("mailto:admin@saccoconnect.ug")} accessibilityRole="button" accessibilityLabel="Email admin support">
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("emailSupport")}</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <View style={styles.supportRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t("appVersion")}</Text>
          <Text style={[styles.helpDesc, { color: colors.textSecondary }]}>1.0.0</Text>
        </View>
      </Card>

      <Button
        title={t("logout")}
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
