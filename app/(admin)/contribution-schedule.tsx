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
import { useTranslation } from "react-i18next";

function dateOnDay(day: number, monthsAhead: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthsAhead);
  d.setDate(day);
  return d.toISOString().split("T")[0];
}

export default function ContributionSchedule() {
  const { colors } = useTheme();
  const { t } = useTranslation("admin");
  const sacco = useAuthStore((state) => state.sacco);
  const updateContributionDueDate = useAuthStore((state) => state.updateContributionDueDate);

  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDueDate(sacco?.contributionDueDate ?? defaultContributionDueDate(5));
  }, [sacco?.contributionDueDate]);

  const presets = [
    { label: t("contributionSchedule.fifthThisMonth"), value: dateOnDay(5, 0) },
    { label: t("contributionSchedule.fifthNextMonth"), value: dateOnDay(5, 1) },
    { label: t("contributionSchedule.fifteenthThisMonth"), value: dateOnDay(15, 0) },
    { label: t("contributionSchedule.endOfMonth"), value: dateOnDay(28, 0) },
  ];

  const handleSave = async () => {
    if (!isValidISODate(dueDate)) {
      Alert.alert(t("contributionSchedule.invalidDate"), t("contributionSchedule.invalidDateMsg"));
      return;
    }

    setSaving(true);
    try {
      await updateContributionDueDate(dueDate);
      Alert.alert(t("contributionSchedule.savedTitle"), t("contributionSchedule.savedMsg"), [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t("contributionSchedule.couldNotSave");
      Alert.alert(t("contributionSchedule.error"), message);
    } finally {
      setSaving(false);
    }
  };

  const previewLabel = isValidISODate(dueDate) ? dueDateLabel(dueDate) : t("contributionSchedule.enterValidDate");

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title={t("contributionSchedule.title")}
          subtitle={t("contributionSchedule.subtitle")}
          showBack
          onBack={() => router.back()}
        />
      }
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Calendar size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("contributionSchedule.current")}</Text>
        </View>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          {t("contributionSchedule.currentDesc", { saccoName: sacco?.name ?? t("contributionSchedule.yourSacco") })}
        </Text>
        {sacco?.contributionDueDate && (
          <View style={[styles.currentBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>{t("contributionSchedule.saved")}</Text>
            <Text style={[styles.currentDate, { color: colors.text }]}>
              {formatDateLong(sacco.contributionDueDate)}
            </Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("contributionSchedule.setNew")}</Text>
        <Input
          label={t("contributionSchedule.dateLabel")}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder={t("contributionSchedule.datePlaceholder")}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
        <Text style={[styles.preview, { color: daysColor(dueDate, colors) }]}>{previewLabel}</Text>

        <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>{t("contributionSchedule.quickPicks")}</Text>
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

      <Button title={t("contributionSchedule.saveDueDate")} onPress={handleSave} loading={saving} style={styles.saveBtn} />
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
