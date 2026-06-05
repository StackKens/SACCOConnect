import { Tabs } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { BarChart2, Users, List, Building2, Settings } from "lucide-react-native";

export default function AdminLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loan-queue"
        options={{
          title: "Loan Queue",
          tabBarIcon: ({ color }) => <List size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="treasury"
        options={{
          title: "Treasury",
          tabBarIcon: ({ color }) => <Building2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      {/* Push screens — hidden from tab bar */}
      <Tabs.Screen name="loan-review" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="member-detail" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="active-loans" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="contributions" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="announcements" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}
