import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface PaymentMethodRowProps {
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

export const PaymentMethodRow: React.FC<PaymentMethodRowProps> = ({ label, sublabel, icon, selected, onPress }) => {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          padding: spacing.lg,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: selected ? colors.secondary : colors.border,
          backgroundColor: selected ? (colors.successSoft as string) : colors.surface,
          minHeight: 60,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={{ width: 28, alignItems: "center", justifyContent: "center" }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{label}</Text>
        {sublabel && <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{sublabel}</Text>}
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: selected ? colors.secondary : colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.secondary }} />}
      </View>
    </Pressable>
  );
};
