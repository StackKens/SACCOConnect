import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { HelpCircle, Mail, Phone, ChevronRight, BookOpen } from "lucide-react-native";

const SUPPORT_EMAIL = "support@saccoconnect.app";
const SUPPORT_PHONE = "+256700000000";

export default function Help() {
  const { colors } = useTheme();

  const sendEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=SACCOConnect%20Support`);
  };

  return (
    <ScreenWrapper
      header={<PageHeader title="Help Center" subtitle="Get support" showBack />}
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <HelpCircle size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>How can we help?</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find quick answers in the FAQ or reach out to the support team directly.
        </Text>
      </Card>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Quick links</Text>
      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/(member)/faq")}
          accessibilityRole="button"
        >
          <BookOpen size={20} color={colors.primary} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              Answers to common questions
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Contact us</Text>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={sendEmail} accessibilityRole="button">
          <Mail size={20} color={colors.primary} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Email support</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{SUPPORT_EMAIL}</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
          accessibilityRole="button"
        >
          <Phone size={20} color={colors.primary} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Call support</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{SUPPORT_PHONE}</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 17, fontWeight: "700" },
  subtitle: { fontSize: 13, lineHeight: 20, marginTop: 8 },
  sectionLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", marginTop: 20, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(128,128,128,0.2)" },
});
