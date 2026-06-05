import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface DividerProps {
  style?: ViewStyle;
  inset?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ style, inset = false }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: colors.border },
        inset && styles.inset,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: { height: 1, width: "100%" },
  inset: { marginLeft: 16, width: "auto" },
});
