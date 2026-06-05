import React from "react";
import { Image, View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 48,
  style,
}) => {
  const { colors } = useTheme();
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: "#FFF", fontSize: size * 0.4, fontWeight: "bold" }}>
        {initials}
      </Text>
    </View>
  );
};
