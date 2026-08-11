import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

type Variant = keyof typeof import("../../theme/tokens").typography;
type ColorKey = "text" | "textSecondary" | "textMuted" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: ColorKey;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color = "text",
  style,
  children,
  ...props
}) => {
  const { colors, typography } = useTheme();
  const variantStyle = typography[variant] as object;
  const colorStyle = { color: colors[color] };
  return (
    <Text
      style={[styles.base, variantStyle, colorStyle, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {},
});
