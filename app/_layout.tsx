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
  const { user, isLoading, checkAuth, rulesAccepted } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inMember = segments[0] === "(member)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      if (user.role === "admin") {
        router.replace("/(admin)");
      } else if (!rulesAccepted) {
        router.replace("/(auth)/group-rules");
      } else {
        router.replace("/(member)");
      }
    } else if (user && user.role === "member" && !rulesAccepted && segments[0] !== "(auth)") {
      router.replace("/(auth)/group-rules");
    }
  }, [user, isLoading, rulesAccepted, segments]);

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
