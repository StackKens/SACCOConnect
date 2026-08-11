import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Bell } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useNotificationStore } from "@/store/notification.store";

export const NotificationsButton: React.FC = () => {
  const { colors } = useTheme();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  useEffect(() => {
    if (!useNotificationStore.getState().hydrated) {
      useNotificationStore.getState().refresh();
    }
  }, []);

  return (
    <Pressable
      onPress={() => router.push("/(member)/notifications")}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Bell size={22} color={colors.text} strokeWidth={2} />
      {unreadCount > 0 && (
        <View style={[styles.dot, { backgroundColor: colors.error, borderColor: colors.surface }]} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.5,
  },
  dot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
});
