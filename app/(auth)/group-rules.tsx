import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CheckCircle, Circle, ShieldCheck } from "lucide-react-native";
import { useState } from "react";

function GroupAvatar({ name, color, size = 72 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ color: "#fff", fontSize: size * 0.34, fontWeight: "800" }}>{initials}</Text>
    </View>
  );
}

export default function GroupRules() {
  const { colors, isDark } = useTheme();
  const { sacco, acceptRules } = useAuthStore();
  const [agreed, setAgreed] = useState(false);

  const rules = sacco?.rules ?? [];
  const logoColor = sacco?.logoColor ?? colors.primary;

  const handleAccept = () => {
    if (!agreed) return;
    acceptRules();
    router.replace("/(member)");
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Group identity */}
        <View style={styles.identity}>
          <GroupAvatar name={sacco?.name ?? "SACCO"} color={logoColor} size={80} />
          <Text style={[styles.saccoName, { color: colors.text }]}>{sacco?.name ?? "Your SACCO"}</Text>
          <Text style={[styles.saccoSub, { color: colors.textSecondary }]}>
            Monthly contribution: UGX {sacco?.contributionAmount?.toLocaleString() ?? "—"}
            {"  •  "}
            Interest: {sacco?.interestRate ?? "—"}% p.a.
          </Text>
        </View>

        {/* Rules */}
        <Card style={styles.rulesCard}>
          <View style={styles.rulesHeader}>
            <ShieldCheck size={18} color={colors.primary} />
            <Text style={[styles.rulesTitle, { color: colors.text }]}>Group Rules & Terms</Text>
          </View>
          <Text style={[styles.rulesIntro, { color: colors.textSecondary }]}>
            Please read through the following rules carefully. By joining this SACCO you agree to abide by all of them.
          </Text>
          {rules.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={[styles.ruleBullet, { backgroundColor: colors.primary + "18" }]}>
                <Text style={[styles.ruleBulletText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.ruleText, { color: colors.text }]}>{rule}</Text>
            </View>
          ))}
        </Card>

        {/* Agree checkbox */}
        <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreed((v) => !v)} activeOpacity={0.7}>
          {agreed
            ? <CheckCircle size={22} color={colors.primary} />
            : <Circle size={22} color={colors.textSecondary} />}
          <Text style={[styles.agreeText, { color: colors.text }]}>
            I have read and agree to all the rules above
          </Text>
        </TouchableOpacity>

        <Button
          title="Accept & Continue"
          onPress={handleAccept}
          style={[styles.btn, !agreed && { opacity: 0.45 }]}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40 },
  identity: { alignItems: "center", marginBottom: 28, gap: 10 },
  saccoName: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4, textAlign: "center" },
  saccoSub: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  rulesCard: { marginBottom: 24 },
  rulesHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  rulesTitle: { fontSize: 15, fontWeight: "700" },
  rulesIntro: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  ruleBullet: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  ruleBulletText: { fontSize: 11, fontWeight: "700" },
  ruleText: { flex: 1, fontSize: 13, lineHeight: 20 },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  agreeText: { flex: 1, fontSize: 14, lineHeight: 20 },
  btn: { marginBottom: 8 },
});
