import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking, Modal, ScrollView } from "react-native";
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
import { ChevronRight, X, ShieldCheck } from "lucide-react-native";

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

const HOW_TO_USE = [
  { title: "Making a Contribution", desc: "Go to Savings and tap Make Contribution. Enter the amount, select your payment method, and confirm." },
  { title: "Applying for a Loan", desc: "Go to Loans and tap the + button. Fill in the amount, purpose, repayment term, and monthly income." },
  { title: "Repaying a Loan", desc: "Open an active loan card and tap Repay Loan. Enter the payment amount and confirm." },
  { title: "Viewing Statements", desc: "Open the side menu or navigate to Statement to download your full transaction history." },
];

export default function Profile() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const { theme, setTheme } = useUIStore();
  const { colors, isDark } = useTheme();
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

  return (
    <ScreenWrapper header={<PageHeader title="Profile" subtitle="Manage your account & preferences" />}>

      <Card style={styles.profileCard}>
        <Avatar name={user?.name} size={80} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.phone, { color: colors.textSecondary }]}>{user?.phone}</Text>
        {user?.nationalId && (
          <Text style={[styles.phone, { color: colors.textSecondary }]}>ID: {user.nationalId}</Text>
        )}
        {sacco && (
          <Text style={[styles.saccoTag, { color: colors.primary }]}>{sacco.name}</Text>
        )}
        <Text style={[styles.role, { color: colors.secondary }]}>
          {user?.role?.toUpperCase()}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My SACCO</Text>
        <TouchableOpacity
          style={styles.supportRow}
          onPress={() => router.push("/(member)/group_rules")}
          accessibilityRole="button"
          accessibilityLabel="View group rules"
        >
          <View style={styles.helpText}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Group Rules</Text>
            <Text style={[styles.helpDesc, { color: colors.textSecondary }]}>
              Read the rules and terms for {sacco?.name ?? "your SACCO"}
            </Text>
          </View>
          <ShieldCheck size={18} color={colors.primary} />
        </TouchableOpacity>
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
          accessibilityRole="button"
          accessibilityLabel="Email support"
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Email Support</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity
          style={styles.supportRow}
          onPress={() => Linking.openURL("tel:+256800100200")}
          accessibilityRole="button"
          accessibilityLabel="Call support line"
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

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
        <TouchableOpacity style={styles.supportRow} onPress={() => setLegalModal("privacy")} accessibilityRole="button" accessibilityLabel="View privacy policy">
          <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.supportRow} onPress={() => setLegalModal("terms")} accessibilityRole="button" accessibilityLabel="View terms of service">
          <Text style={[styles.settingLabel, { color: colors.text }]}>Terms of Service</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      <Modal visible={legalModal !== null} transparent animationType="slide" onRequestClose={() => setLegalModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {legalModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </Text>
              <TouchableOpacity onPress={() => setLegalModal(null)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Divider />
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.legalText, { color: colors.textSecondary }]}>
                {legalModal === "privacy" ? PRIVACY_POLICY : TERMS_OF_SERVICE}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  profileCard: { alignItems: "center", marginBottom: 24 },
  avatar: { marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  phone: { fontSize: 14, marginBottom: 2 },
  saccoTag: { fontSize: 12, fontWeight: "600", marginBottom: 4, marginTop: 2 },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: "700" },
  modalBody: { marginTop: 12 },
  legalText: { fontSize: 13, lineHeight: 22 },
});
