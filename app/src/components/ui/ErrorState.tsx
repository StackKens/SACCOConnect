import { View, Text } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.huge, paddingHorizontal: spacing.xl }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.errorSoft as string,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.xl,
        }}
      >
        <AlertCircle size={34} color={colors.error} strokeWidth={2} />
      </View>
      <Text style={[typography.h2, { color: colors.text, textAlign: "center" }]}>
        {title ?? "Something went wrong"}
      </Text>
      {message ? (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, lineHeight: 24 }]}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Button title="Try Again" onPress={onRetry} style={{ alignSelf: "stretch", marginTop: spacing.xxl }} />
      ) : null}
    </View>
  );
}
