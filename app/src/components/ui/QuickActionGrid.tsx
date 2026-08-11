import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface QuickAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  primary?: boolean;
}

interface QuickActionGridProps {
  actions: QuickAction[];
  columns?: number;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({ actions, columns = 2 }) => {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
      {actions.map((action) => {
        const { icon, label, primary, onPress } = action;
        const filled = !!primary;
        const bg = filled ? colors.primary : colors.surface;
        const fg = filled ? "#FFFFFF" : colors.text;
        return (
          <Pressable
            key={action.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [
              {
                width: columns === 2 ? "48%" : "31%",
                flexGrow: 1,
                backgroundColor: bg,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: filled ? colors.primary : colors.border,
                padding: spacing.lg,
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                minHeight: 56,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            {icon && <View style={{ width: 22, alignItems: "center" }}>{icon}</View>}
            <Text style={[typography.bodyMedium, { color: fg }]} numberOfLines={1}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
