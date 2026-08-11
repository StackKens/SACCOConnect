import { Tabs, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { Home, Wallet, Banknote, User } from "lucide-react-native";

function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? (colors.primary + "14") : "transparent",
      }}
    >
      {children}
    </View>
  );
}

export default function MemberLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;
  const refreshSacco = useAuthStore((state) => state.refreshSacco);

  useFocusEffect(
    useCallback(() => {
      refreshSacco();
    }, [refreshSacco]),
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarLabelPosition: "below-icon",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Home size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            </TabIcon>
          ),
          tabBarIconStyle: { marginBottom: -2 },
        }}
      />
      <Tabs.Screen
        name="contributions"
        options={{
          title: "Savings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Wallet size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            </TabIcon>
          ),
          tabBarIconStyle: { marginBottom: -2 },
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: "Loans",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Banknote size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            </TabIcon>
          ),
          tabBarIconStyle: { marginBottom: -2 },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <User size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            </TabIcon>
          ),
          tabBarIconStyle: { marginBottom: -2 },
        }}
      />
      {/* Push screens — hidden from tab bar */}
      <Tabs.Screen name="apply_loan" options={{ href: null }} />
      <Tabs.Screen name="repay_loan" options={{ href: null }} />
      <Tabs.Screen name="contribute" options={{ href: null }} />
      <Tabs.Screen name="statement" options={{ href: null }} />
      <Tabs.Screen name="group_rules" options={{ href: null }} />
    </Tabs>
  );
}
