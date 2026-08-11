import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { ChevronDown, ChevronRight } from "lucide-react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I make a contribution?",
    answer:
      "Tap the Contribute button on the Home or Savings screen. Enter the amount and choose a payment method (Mobile Money or Bank), then confirm. The contribution is recorded immediately.",
  },
  {
    question: "When are contributions due?",
    answer:
      "Your SACCO sets a monthly contribution amount and due date. You can see both on the Home screen. Making contributions on time keeps your streak alive.",
  },
  {
    question: "How do I apply for a loan?",
    answer:
      "Go to the Loans tab and tap Apply for a Loan. Choose the amount and purpose, then submit. Your SACCO admin will review and approve or reject the request.",
  },
  {
    question: "How do I repay my loan?",
    answer:
      "On the Loans tab, open an active loan and tap Repay. Enter the amount and choose a payment method. The balance updates as soon as the payment is confirmed.",
  },
  {
    question: "I forgot my PIN. How do I reset it?",
    answer:
      "You can change your PIN from Profile → Security & PIN while logged in. If you are locked out entirely, contact support@saccoconnect.app for help.",
  },
  {
    question: "Why is my transaction showing as pending?",
    answer:
      "Payments made via Mobile Money may take a few minutes to be confirmed by your SACCO admin. Pending transactions update automatically once confirmed.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. Your account and financial data are encrypted and only accessible to authorised SACCO administrators. See the Privacy Policy in Profile for details.",
  },
];

export default function FAQ() {
  const { colors } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScreenWrapper
      header={<PageHeader title="FAQ" subtitle="Frequently asked questions" showBack />}
    >
      <Card style={styles.card}>
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          return (
            <View key={faq.question}>
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => toggle(index)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <Text style={[styles.question, { color: colors.text }]}>{faq.question}</Text>
                {open ? (
                  <ChevronDown size={18} color={colors.textSecondary} />
                ) : (
                  <ChevronRight size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
              {open && (
                <Text style={[styles.answer, { color: colors.textSecondary }]}>{faq.answer}</Text>
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
