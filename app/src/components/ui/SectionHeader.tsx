import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, right }) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xxl, marginBottom: spacing.md }}>
      <View style={{ flex: 1 }}>
        <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
};
