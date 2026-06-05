import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "info",
  style,
}) => {
  const { colors } = useTheme();
  const getColor = () => {
    switch (variant) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
      default:
        return colors.primary;
    }
  };
  return (
    <View style={[styles.badge, { backgroundColor: getColor() + "20" }, style]}>
      <Text style={[styles.label, { color: getColor() }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  label: { fontSize: 12, fontWeight: "600" },
});
