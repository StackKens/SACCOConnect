import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { CheckSquare, Square } from "lucide-react-native";

interface TermsStepProps {
  accepted: boolean;
  onToggle: (accepted: boolean) => void;
  title?: string;
}

export function TermsStep({
  accepted,
  onToggle,
  title = "Terms of Service",
}: TermsStepProps) {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        By creating this SACCO you are setting up a shared group savings account.
        You confirm that you are authorised to act on behalf of the group and to
        manage the payment account members will use to make contributions.
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        The payment account you configure belongs to the SACCO. Only the SACCO
        administrator can view or change these details. Members will only see an
        account you choose to make visible to them.
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        You agree to the SACCOConnect Terms of Service and Privacy Policy, and to
        keep the payment account details accurate and up to date.
      </Text>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        accessibilityLabel="Accept terms and conditions"
        onPress={() => onToggle(!accepted)}
        style={styles.checkRow}
      >
        {accepted ? (
          <CheckSquare size={24} color={colors.secondary} />
        ) : (
          <Square size={24} color={colors.textSecondary} />
        )}
        <Text style={[styles.checkLabel, { color: colors.text }]}>
          I agree to the Terms of Service and confirm I am authorised to create
          this SACCO.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
    paddingVertical: 8,
  },
  checkLabel: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: "500" },
});
