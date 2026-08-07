import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button } from "./Button";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  error: Error;
  retry: () => Promise<void>;
}

export default function ErrorBoundary({ error, retry }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Something went wrong
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {error?.message || "An unexpected error occurred."}
        </Text>
        <Button title="Try Again" onPress={() => retry()} style={styles.btn} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  message: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  btn: { alignSelf: "stretch" },
});
