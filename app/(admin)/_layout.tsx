import { Tabs } from "expo-router";
import { useTheme } from "@/hooks/useTheme"; // adjust path if needed
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Landmark,
  Settings,
} from "lucide-react-native";

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
          height: 74,
          paddingBottom: 16,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loan-queue"
        options={{
          title: "Loans",
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="treasury"
        options={{
          title: "Treasury",
          tabBarIcon: ({ color }) => <Landmark size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="loan-review" options={{ href: null }} />
      <Tabs.Screen name="member-detail" options={{ href: null }} />
      <Tabs.Screen name="active-loans" options={{ href: null }} />
      <Tabs.Screen name="contributions" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="create-sacco" options={{ href: null }} />
      <Tabs.Screen name="edit-rules" options={{ href: null }} />
      <Tabs.Screen name="contribution-schedule" options={{ href: null }} />
    </Tabs>
  );
}
