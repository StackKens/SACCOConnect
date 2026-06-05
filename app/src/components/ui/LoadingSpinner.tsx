import React from "react";
import { ActivityIndicator, View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color,
  style,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color || colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: "center", alignItems: "center", padding: 20 },
});
