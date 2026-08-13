import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
  { q: "faq.q7", a: "faq.a7" },
];

export default function FAQ() {
  const { t } = useTranslation("common");
  const { colors } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScreenWrapper
      header={<PageHeader title={t("faq.title")} subtitle={t("faq.subtitle")} showBack />}
    >
      <Card style={styles.card}>
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          return (
            <View key={faq.q}>
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => toggle(index)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <Text style={[styles.question, { color: colors.text }]}>{t(faq.q)}</Text>
                {open ? (
                  <ChevronDown size={18} color={colors.textSecondary} />
                ) : (
                  <ChevronRight size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
              {open && (
                <Text style={[styles.answer, { color: colors.textSecondary }]}>{t(faq.a)}</Text>
              )}
              {index < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 4 },
  questionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 16 },
  question: { flex: 1, fontSize: 15, fontWeight: "600", lineHeight: 21 },
  answer: { fontSize: 14, lineHeight: 21, paddingBottom: 16, marginTop: -8 },
  divider: { height: 1, backgroundColor: "rgba(128,128,128,0.2)" },
});
