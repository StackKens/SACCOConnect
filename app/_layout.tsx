import { Redirect, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useAuthStore } from "./src/store/auth.store";
import { useUIStore } from "./src/store/ui.store";
import { LoadingSpinner } from "./src/components/ui/LoadingSpinner";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function ThemeUpdater() {
  const updateEffectiveTheme = useUIStore(
    (state) => state.updateEffectiveTheme,
  );
  useEffect(() => {
    updateEffectiveTheme();
  }, []);
  return null;
}

export default function RootLayout() {
  const { user, isLoading, checkAuth, rulesAccepted } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (user.role === "admin" && segments[0] === "(member)") {
      router.replace("/(admin)");
      return;
    }

    if (user.role === "member" && segments[0] === "(admin)") {
      router.replace("/(member)");
      return;
    }

    if (inAuthGroup) {
      if (user.role === "admin") {
        router.replace("/(admin)");
      } else if (!rulesAccepted) {
        router.replace("/(auth)/group-rules");
      } else {
        router.replace("/(member)");
      }
      return;
    }

    if (user.role === "member" && !rulesAccepted && !inAuthGroup) {
      router.replace("/(auth)/group-rules");
    }
  }, [user, isLoading, rulesAccepted, segments]);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={styles.loading}>
            <LoadingSpinner />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (!user) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeUpdater />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="index" redirect />
          </Stack>
          <Redirect href="/(auth)/onboarding" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeUpdater />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(member)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="index" redirect />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
