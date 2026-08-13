import { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { TextArea } from "@/components/ui/TextArea";
import { useTheme } from "@/hooks/useTheme";
import { useCountry } from "@/hooks/useCountry";
import { useAuthStore } from "@/store/auth.store";
import { PRESET_RULES } from "@/constants/rules";
import { CheckSquare, Square } from "lucide-react-native";
import { useTranslation } from "react-i18next";

const LOGO_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#0EA5E9", "#14B8A6"];

function GroupAvatar({ name, color, size = 56 }: { name: string; color: string; size?: number }) {
  const initials = name.trim()
    ? name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    : "SC";
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: size * 0.34, fontWeight: "800" }}>{initials}</Text>
    </View>
  );
}

export default function CreateSACCO() {
  const { colors } = useTheme();
  const { t } = useTranslation("admin");
  const { country } = useCountry();
  const { createSACCO } = useAuthStore();

  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [interest, setInterest] = useState("");
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [customRule, setCustomRule] = useState("");
  const [logoColor, setLogoColor] = useState(LOGO_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const toggleRule = (rule: string) => {
    setSelectedRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule],
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert(t("createSacco.required"), t("createSacco.enterName"));
    if (!contribution || isNaN(Number(contribution)))
      return Alert.alert(t("createSacco.required"), t("createSacco.enterContribution"));
    if (!interest || isNaN(Number(interest)))
      return Alert.alert(t("createSacco.required"), t("createSacco.enterInterest"));
    if (selectedRules.length === 0 && !customRule.trim())
      return Alert.alert(t("createSacco.required"), t("createSacco.selectRule"));

    setLoading(true);
    try {
      await createSACCO({
        name: name.trim(),
        contributionAmount: Number(contribution),
        interestRate: Number(interest),
        rules: selectedRules,
        customRule,
        logoColor,
      });
      Alert.alert(t("createSacco.createdTitle"), t("createSacco.createdMsg", { name }), [
        { text: t("createSacco.inviteMembers"), onPress: () => router.replace("/(admin)/members") },
        { text: t("createSacco.goToDashboard"), onPress: () => router.replace("/(admin)") },
      ]);
    } catch (e: any) {
      Alert.alert(t("createSacco.error"), e?.message || t("createSacco.couldNotCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      scroll
      header={<PageHeader title={t("createSacco")} subtitle={t("createSacco.subtitle")} showBack onBack={() => router.back()} />}
    >
      {/* Group identity preview */}
      <Card style={styles.previewCard}>
        <View style={styles.previewRow}>
          <GroupAvatar name={name} color={logoColor} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
              {name.trim() || t("createSacco.groupName")}
            </Text>
            <Text style={[styles.previewSub, { color: colors.textSecondary }]}>
              Preview of your group avatar
            </Text>
          </View>
        </View>
      </Card>

      {/* Basic info */}
      <Card style={styles.card}>
        <Input label={t("createSacco.nameLabel")} value={name} onChangeText={setName} placeholder={t("createSacco.namePlaceholder")} autoCapitalize="words" />
        <Input label={t("createSacco.contributionLabel", { currency: country.currency })} value={contribution} onChangeText={setContribution} keyboardType="numeric" placeholder={t("createSacco.amountPlaceholder")} />
        <Input label={t("createSacco.interestLabel")} value={interest} onChangeText={setInterest} keyboardType="numeric" placeholder={t("createSacco.interestPlaceholder")} />
      </Card>

      {/* Logo color */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Avatar Color</Text>
        <View style={styles.colorRow}>
          {LOGO_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setLogoColor(c)}
              style={[styles.colorSwatch, { backgroundColor: c }, logoColor === c && styles.colorSwatchSelected]}
            />
          ))}
        </View>
      </Card>

      {/* Preset rules */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Rules</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Select the rules that apply to your group. Members will read and accept these before joining.
        </Text>
        {PRESET_RULES.map((rule, i) => {
          const checked = selectedRules.includes(rule);
          return (
            <TouchableOpacity key={i} style={styles.ruleRow} onPress={() => toggleRule(rule)} activeOpacity={0.7}>
              {checked
                ? <CheckSquare size={20} color={colors.primary} />
                : <Square size={20} color={colors.textSecondary} />}
              <Text style={[styles.ruleText, { color: colors.text }]}>{rule}</Text>
            </TouchableOpacity>
          );
        })}
        <Divider style={{ marginVertical: 14 }} />
        <TextArea
          label={t("createSacco.customRuleLabel")}
          value={customRule}
          onChangeText={setCustomRule}
          placeholder={t("createSacco.customRulePlaceholder")}
        />
      </Card>

      <Button title={t("createSacco")} onPress={handleCreate} loading={loading} style={styles.btn} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  previewCard: { marginBottom: 16 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  previewName: { fontSize: 16, fontWeight: "700" },
  previewSub: { fontSize: 12, marginTop: 2 },
  card: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  sectionSub: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  colorSwatch: { width: 34, height: 34, borderRadius: 17 },
  colorSwatchSelected: { borderWidth: 3, borderColor: "#fff", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  ruleText: { flex: 1, fontSize: 13, lineHeight: 20 },
  btn: { marginBottom: 24 },
});
