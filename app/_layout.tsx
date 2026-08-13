import { Stack, useRouter, useSegments } from "expo-router";
import type { ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useAuthStore } from "./src/store/auth.store";
import { useUIStore } from "./src/store/ui.store";
import { usePreferencesStore } from "./src/store/preferences.store";
import { CountryProvider } from "./src/providers/CountryProvider";
import { LoadingSpinner } from "./src/components/ui/LoadingSpinner";
import ErrorBoundaryFallback from "./src/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { startQueueListener } from "./src/services/offlineQueue";
import { initSecureStorage } from "./src/services/secureStorage";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorBoundaryFallback error={error} retry={retry} />;
}

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
    (async () => {
      await initSecureStorage();
      usePreferencesStore.getState().hydratePreferences();
      useUIStore.getState().hydrateTheme();
      await checkAuth();
      // start offline queue listener once at app boot
      startQueueListener();
    })();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const group = segments[0];
    const inAuthGroup = group === "(auth)";

    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/onboarding");
      }
      return;
    }

    if (user.role === "admin" && group === "(member)") {
      router.replace("/(admin)");
      return;
    }

    if (user.role === "member" && group === "(admin)") {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CountryProvider>
          <ThemeUpdater />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(member)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </CountryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
