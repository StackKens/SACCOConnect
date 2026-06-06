import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import {
  defaultContributionDueDate,
  dueDateLabel,
  formatDateLong,
  isValidISODate,
} from "@/utils/date";
import { Calendar } from "lucide-react-native";

function dateOnDay(day: number, monthsAhead: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthsAhead);
  d.setDate(day);
  return d.toISOString().split("T")[0];
}

export default function ContributionSchedule() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const updateContributionDueDate = useAuthStore((state) => state.updateContributionDueDate);

  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDueDate(sacco?.contributionDueDate ?? defaultContributionDueDate(5));
  }, [sacco?.contributionDueDate]);

  const presets = [
    { label: "5th — this month", value: dateOnDay(5, 0) },
    { label: "5th — next month", value: dateOnDay(5, 1) },
    { label: "15th — this month", value: dateOnDay(15, 0) },
    { label: "End of month", value: dateOnDay(28, 0) },
  ];

  const handleSave = async () => {
    if (!isValidISODate(dueDate)) {
      Alert.alert("Invalid date", "Use the format YYYY-MM-DD (e.g. 2025-07-05).");
      return;
    }

    setSaving(true);
    try {
      await updateContributionDueDate(dueDate);
      Alert.alert("Saved", "All members will see the updated contribution due date.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not save the date.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const previewLabel = isValidISODate(dueDate) ? dueDateLabel(dueDate) : "Enter a valid date";

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title="Contribution Due Date"
          subtitle="Set when members must pay each month"
          showBack
          onBack={() => router.back()}
        />
      }
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Calendar size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current schedule</Text>
        </View>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Members see this date on their home screen and savings tab. Changes apply to everyone in{" "}
          {sacco?.name ?? "your SACCO"}.
        </Text>
        {sacco?.contributionDueDate && (
          <View style={[styles.currentBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>Saved due date</Text>
            <Text style={[styles.currentDate, { color: colors.text }]}>
              {formatDateLong(sacco.contributionDueDate)}
            </Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Set new due date</Text>
        <Input
          label="Due date (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="e.g. 2025-07-05"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
        <Text style={[styles.preview, { color: daysColor(dueDate, colors) }]}>{previewLabel}</Text>

        <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>Quick picks</Text>
        <View style={styles.presets}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.presetBtn,
                {
                  borderColor: dueDate === preset.value ? colors.primary : colors.border,
                  backgroundColor: dueDate === preset.value ? colors.primary + "12" : colors.surface,
                },
              ]}
              onPress={() => setDueDate(preset.value)}
            >
              <Text style={[styles.presetText, { color: colors.text }]}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Button title="Save Due Date" onPress={handleSave} loading={saving} style={styles.saveBtn} />
    </ScreenWrapper>
  );
}

function daysColor(date: string, colors: { warning: string; error: string; success: string; textSecondary: string }) {
  if (!isValidISODate(date)) return colors.textSecondary;
  const label = dueDateLabel(date);
  if (label.startsWith("Overdue")) return colors.error;
  if (label === "Due today" || label === "Due tomorrow") return colors.warning;
  return colors.success;
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionSub: { fontSize: 13, lineHeight: 20, marginBottom: 14 },
  currentBox: { borderWidth: 1, borderRadius: 10, padding: 14 },
  currentLabel: { fontSize: 12, marginBottom: 4 },
  currentDate: { fontSize: 16, fontWeight: "700" },
  preview: { fontSize: 13, fontWeight: "600", marginTop: -8, marginBottom: 16 },
  presetLabel: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  presetText: { fontSize: 12, fontWeight: "600" },
  saveBtn: { marginBottom: 24 },
});
