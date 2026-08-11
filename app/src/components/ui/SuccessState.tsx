import { View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "./Button";

interface SuccessStateProps {
  title: string;
  subtitle?: string;
  reference?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  subtitle,
  reference,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.huge, paddingHorizontal: spacing.xl }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.successSoft as string, alignItems: "center", justifyContent: "center", marginBottom: spacing.xl }}>
        <Check size={36} color={colors.success} strokeWidth={3} />
      </View>
      <Text style={[typography.h1, { color: colors.text, textAlign: "center" }]}>{title}</Text>
      {subtitle && (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, lineHeight: 24 }]}>
          {subtitle}
        </Text>
      )}
      {reference && (
        <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt as string }}>
          <Text style={[typography.micro, { color: colors.textSecondary, textTransform: "uppercase", textAlign: "center" }]}>Reference</Text>
          <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 2, textAlign: "center", fontVariant: ["tabular-nums"] }]}>{reference}</Text>
        </View>
      )}
      {primaryActionLabel && onPrimaryAction && (
        <Button title={primaryActionLabel} onPress={onPrimaryAction} style={{ alignSelf: "stretch", marginTop: spacing.xxl }} />
      )}
      {secondaryActionLabel && onSecondaryAction && (
        <Button title={secondaryActionLabel} onPress={onSecondaryAction} variant="ghost" style={{ alignSelf: "stretch", marginTop: spacing.md }} />
      )}
    </View>
  );
};
