import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  style,
}) => {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: colors.border, borderRadius: height / 2 },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            height,
            backgroundColor: colors.secondary,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0 },
});
