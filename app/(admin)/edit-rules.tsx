import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { PRESET_RULES } from "@/constants/rules";
import { CheckSquare, Square, Trash2 } from "lucide-react-native";

export default function EditRules() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const updateSACCORules = useAuthStore((state) => state.updateSACCORules);

  const [draftRules, setDraftRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftRules(sacco?.rules ?? []);
  }, [sacco?.rules]);

  const addRule = () => {
    const trimmed = newRule.trim();
    if (!trimmed) {
      Alert.alert("Required", "Enter a rule before adding.");
      return;
    }
    if (draftRules.includes(trimmed)) {
      Alert.alert("Duplicate", "This rule is already in the list.");
      return;
    }
    setDraftRules((prev) => [...prev, trimmed]);
    setNewRule("");
  };

  const removeRule = (index: number) => {
    setDraftRules((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePreset = (rule: string) => {
    setDraftRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule],
    );
  };

  const handleSave = async () => {
    if (draftRules.length === 0) {
      Alert.alert("Required", "Add at least one rule before saving.");
      return;
    }

    setSaving(true);
    try {
      await updateSACCORules(draftRules);
      Alert.alert("Saved", "Group rules have been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not save rules.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title="Edit Group Rules"
          subtitle="Update the rules members must follow"
          showBack
          onBack={() => router.back()}
        />
      }
    >
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Rules</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          {draftRules.length} rule{draftRules.length !== 1 ? "s" : ""} in this list
        </Text>

        {draftRules.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No rules yet. Add one below or select from presets.
          </Text>
        ) : (
          draftRules.map((rule, i) => (
            <View key={`${i}-${rule.slice(0, 12)}`} style={styles.ruleRow}>
              <View style={[styles.ruleBullet, { backgroundColor: colors.primary + "18" }]}>
                <Text style={[styles.ruleBulletText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.ruleText, { color: colors.text }]}>{rule}</Text>
              <TouchableOpacity onPress={() => removeRule(i)} hitSlop={8}>
                <Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Add New Rule</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Write a clear rule, then tap Add Rule. Save when you are done editing.
        </Text>
        <TextArea
          label="New Rule"
          value={newRule}
          onChangeText={setNewRule}
          placeholder="e.g. Members who miss two consecutive contributions will receive a written warning."
        />
        <Button title="Add Rule" onPress={addRule} variant="outline" />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preset Rules</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Tap to add or remove common SACCO rules.
        </Text>
        {PRESET_RULES.map((rule, i) => {
          const checked = draftRules.includes(rule);
          return (
            <TouchableOpacity key={i} style={styles.presetRow} onPress={() => togglePreset(rule)} activeOpacity={0.7}>
              {checked ? (
                <CheckSquare size={20} color={colors.primary} />
              ) : (
                <Square size={20} color={colors.textSecondary} />
              )}
              <Text style={[styles.presetText, { color: colors.text }]}>{rule}</Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      <Divider style={styles.divider} />
      <Button title="Save Rules" onPress={handleSave} loading={saving} style={styles.saveBtn} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  sectionSub: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  emptyText: { fontSize: 13, lineHeight: 20, fontStyle: "italic" },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  ruleBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  ruleBulletText: { fontSize: 11, fontWeight: "700" },
  ruleText: { flex: 1, fontSize: 14, lineHeight: 21 },
  presetRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  presetText: { flex: 1, fontSize: 13, lineHeight: 20 },
  divider: { marginVertical: 8 },
  saveBtn: { marginBottom: 24 },
});
