import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.huge, paddingHorizontal: spacing.xl }}>
      {icon && (
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.surfaceAlt as string,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xl,
          }}
        >
          {icon}
        </View>
      )}
      <Text style={[typography.h2, { color: colors.text, textAlign: "center" }]}>{title}</Text>
      {description && (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, lineHeight: 24 }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={{ alignSelf: "stretch", marginTop: spacing.xxl }} />
      )}
    </View>
  );
};
