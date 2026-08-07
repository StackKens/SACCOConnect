import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Button title="Retry" onPress={onRetry} style={styles.retry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: 32 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  message: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  retry: { alignSelf: "stretch" },
});
