import { Pressable, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export const NotificationsButton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => router.push("/(member)/notifications")}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Bell size={22} color={colors.text} strokeWidth={2} />
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
});
