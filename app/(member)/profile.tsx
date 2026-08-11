import { View, Text, Switch, TouchableOpacity, Linking, Modal, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { NotificationsButton } from "@/components/ui/NotificationsButton";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Divider } from "@/components/ui/Divider";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { ChevronRight, X, ShieldCheck, UserCog, Fingerprint, Bell, BookOpen, Headphones, Info, Users, AlertCircle, Moon, MonitorSmartphone } from "lucide-react-native";

const PRIVACY_POLICY = `We take your privacy seriously. Here is what you need to know:

1. What we collect
We collect your name, email, phone number, and financial activity (savings, loans, repayments) so we can run your SACCO account.

2. How we use it
Your information is used only to manage your account, process transactions, and send you important updates about your savings and loans.

3. Who can see it
Only authorised SACCO staff and administrators can access your account details. We do not sell or share your data with third parties.

4. How we protect it
Your data is stored securely and only accessible through your password-protected account. We use encryption to keep your information safe.

5. Your rights
You can request to view, update, or delete your personal data at any time by contacting support.

6. Changes
If we update this policy, we will notify you through the app. Continued use of the app means you accept the updated policy.`;

const TERMS_OF_SERVICE = `By using SACCOConnect, you agree to the following:

1. Eligibility
You must be a registered member of the SACCO to use this app. Membership is subject to approval by the SACCO administration.

2. Your account
You are responsible for keeping your login details safe. Do not share your password with anyone. Report any suspicious activity to support immediately.

3. Contributions
Contributions made through the app are final once confirmed. Errors must be reported within 48 hours.

4. Loans
Applying for a loan does not guarantee approval. The SACCO reserves the right to approve or reject any application based on your savings history and eligibility.

5. Repayments
Loan repayments are due on the agreed dates. Late payments may attract penalties as defined by the SACCO policy.

6. Acceptable use
Do not use this app for any fraudulent activity. Any misuse will result in immediate account suspension and may be reported to relevant authorities.

7. Limitation of liability
SACCOConnect is a management tool. The SACCO is responsible for all financial decisions. We are not liable for losses arising from your financial choices.

8. Contact
For any questions or disputes, contact us at support@saccoconnect.ug.`;

function SectionLabel({ children }: { children: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Text style={[typography.micro, { color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginTop: spacing.xxl, marginBottom: spacing.sm }]}>
      {children}
    </Text>
  );
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
  destructive?: boolean;
}

function SettingRow({ icon, label, sublabel, onPress, right, last, destructive }: RowProps) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.lg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.sm,
          backgroundColor: destructive ? (colors.errorSoft as string) : (colors.surfaceAlt as string),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyMedium, { color: destructive ? colors.error : colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>{sublabel}</Text>
        )}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={colors.textMuted} /> : null)}
    </TouchableOpacity>
  );
}

export default function Profile() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const { theme, setTheme } = useUIStore();
  const { colors, isDark, spacing, radius, typography } = useTheme();
  const [darkMode, setDarkMode] = useState(isDark);
  const [useSystem, setUseSystem] = useState(theme === "system");
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

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

  const comingSoon = () => Alert.alert("Coming soon", "This feature will be available in a future release.");

  return (
    <ScreenWrapper header={<PageHeader title="Profile" subtitle="Manage your account & preferences" rightComponent={<NotificationsButton />} />}>

      <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
        <Avatar name={user?.name} size={80} />
        <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>{user?.name}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {user?.nationalId ? `Member ID: ${user.id ?? user.nationalId}` : `Member ID: ${user?.id ?? "—"}`}
        </Text>
        {sacco && (
          <Text style={[typography.captionMedium, { color: colors.primary, marginTop: spacing.sm }]}>{sacco.name}</Text>
        )}
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl }}>
        <SectionLabel>Account</SectionLabel>
        <SettingRow icon={<UserCog size={18} color={colors.primary} />} label="Personal Information" sublabel={user?.phone} onPress={comingSoon} />
        <SettingRow icon={<Fingerprint size={18} color={colors.primary} />} label="Security & PIN" sublabel="Change your security PIN" onPress={comingSoon} />
        <SettingRow icon={<Bell size={18} color={colors.primary} />} label="Notifications" sublabel="Manage alerts" onPress={() => router.push("/(member)/notifications")} last />

        <SectionLabel>My SACCO</SectionLabel>
        <SettingRow icon={<Users size={18} color={colors.primary} />} label={sacco?.name ?? "Your SACCO"} sublabel={sacco ? `UGX ${sacco.contributionAmount?.toLocaleString() ?? "—"} / month` : undefined} />
        <SettingRow icon={<ShieldCheck size={18} color={colors.primary} />} label="Group Rules" sublabel="Read the rules and terms" onPress={() => router.push("/(member)/group_rules")} />
        <SettingRow icon={<BookOpen size={18} color={colors.primary} />} label="Membership Details" onPress={comingSoon} last />

        <SectionLabel>Preferences</SectionLabel>
        <SettingRow icon={<Moon size={18} color={colors.primary} />} label="Dark Mode" right={<Switch value={darkMode} onValueChange={handleDarkModeToggle} disabled={useSystem} />} />
        <SettingRow icon={<MonitorSmartphone size={18} color={colors.primary} />} label="Use System Theme" right={<Switch value={useSystem} onValueChange={handleSystemToggle} />} last />

        <SectionLabel>Support</SectionLabel>
        <SettingRow icon={<Headphones size={18} color={colors.primary} />} label="Help Center" sublabel="How to use SACCOConnect" onPress={comingSoon} />
        <SettingRow icon={<AlertCircle size={18} color={colors.primary} />} label="Contact SACCO" sublabel="support@saccoconnect.ug" onPress={() => Linking.openURL("mailto:support@saccoconnect.ug")} />
        <SettingRow icon={<Info size={18} color={colors.primary} />} label="About SACCOConnect" sublabel="Version 1.0.0" onPress={() => setLegalModal("about")} last />
      </View>

      <Modal visible={legalModal !== null} transparent animationType="slide" onRequestClose={() => setLegalModal(null)}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
              <Text style={[typography.h3, { color: colors.text }]}>
                {legalModal === "privacy" ? "Privacy Policy" : legalModal === "terms" ? "Terms of Service" : "About SACCOConnect"}
              </Text>
              <TouchableOpacity onPress={() => setLegalModal(null)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Divider />
            <ScrollView showsVerticalScrollIndicator={false}>
              {legalModal === "about" ? (
                <View style={{ paddingVertical: spacing.lg }}>
                  <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
                    SACCOConnect is a modern platform for Savings and Credit Cooperative Organisations — helping members save, borrow, and grow together.
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.lg }]}>Version 1.0.0</Text>
                </View>
              ) : (
                <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
                  {legalModal === "privacy" ? PRIVACY_POLICY : TERMS_OF_SERVICE}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Button title="Logout" onPress={logout} variant="danger" style={{ marginTop: spacing.xxxl, marginBottom: spacing.huge }} />
    </ScreenWrapper>
  );
}
