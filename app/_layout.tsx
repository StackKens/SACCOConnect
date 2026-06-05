import { Stack, Redirect, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "./src/store/auth.store";
import { useUIStore } from "./src/store/ui.store";
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
  const { user, isLoading, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace(user.role === "admin" ? "/(admin)" : "/(member)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

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
