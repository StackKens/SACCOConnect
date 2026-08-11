import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { formatDate } from "@/utils/date";
import { ShieldCheck } from "lucide-react-native";

function GroupAvatar({ name, color, size = 64 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.34, fontWeight: "800" }}>{initials}</Text>
    </View>
  );
}

export default function GroupRules() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const rules = sacco?.rules ?? [];
  const logoColor = sacco?.logoColor ?? colors.primary;

  return (
    <ScreenWrapper
      scroll
      header={<PageHeader title="Group Rules" subtitle="Rules and terms for your SACCO" showBack onBack={() => router.back()} />}
    >
      <View style={styles.identity}>
        <GroupAvatar name={sacco?.name ?? "SACCO"} color={logoColor} />
        <Text style={[styles.saccoName, { color: colors.text }]}>{sacco?.name ?? "Your SACCO"}</Text>
        <Text style={[styles.saccoMeta, { color: colors.textSecondary }]}>
          UGX {sacco?.contributionAmount?.toLocaleString() ?? "—"} / month
          {sacco?.contributionDueDate ? `  •  Due ${formatDate(sacco.contributionDueDate)}` : ""}
        </Text>
      </View>

      <Card style={styles.rulesCard}>
        <View style={styles.rulesHeader}>
          <ShieldCheck size={20} color={colors.primary} />
          <Text style={[styles.rulesTitle, { color: colors.text }]}>Rules & Terms</Text>
        </View>
        <Text style={[styles.rulesIntro, { color: colors.textSecondary }]}>
          These are the rules set by your SACCO administrator. All members are expected to follow them.
        </Text>

        {rules.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No group rules have been published yet.
          </Text>
        ) : (
          rules.map((rule, i) => (
            <View key={`${i}-${rule.slice(0, 12)}`} style={styles.ruleRow}>
              <View style={[styles.ruleBullet, { backgroundColor: colors.primary + "18" }]}>
                <Text style={[styles.ruleBulletText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.ruleText, { color: colors.text }]}>{rule}</Text>
            </View>
          ))
        )}
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: "center", marginBottom: 24, gap: 10 },
  saccoName: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  saccoMeta: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  rulesCard: { marginBottom: 24 },
  rulesHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  rulesTitle: { fontSize: 16, fontWeight: "700" },
  rulesIntro: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  ruleBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  ruleBulletText: { fontSize: 12, fontWeight: "700" },
  ruleText: { flex: 1, fontSize: 15, lineHeight: 24 },
  emptyText: { fontSize: 14, lineHeight: 21, fontStyle: "italic" },
});
