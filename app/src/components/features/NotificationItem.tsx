import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";
import { getRelativeTime } from "../../utils/date";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react-native";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type?: "info" | "success" | "warning" | "error";
  };
  onPress?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const { colors } = useTheme();
  const { id, title, message, date, read, type = "info" } = notification;

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle size={24} color={colors.success} />;
      case "warning": return <AlertCircle size={24} color={colors.warning} />;
      case "error": return <XCircle size={24} color={colors.error} />;
      default: return <Info size={24} color={colors.primary} />;
    }
  };

  const handlePress = () => {
    if (onPress) onPress(id);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card
        style={[
          styles.card,
          !read && { backgroundColor: colors.primary + "08" },
        ]}
      >
        <View style={styles.row}>
          {getIcon()}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text
              style={[styles.message, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {message}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {getRelativeTime(date)}
            </Text>
          </View>
          {!read && (
            <View
              style={[styles.unreadDot, { backgroundColor: colors.primary }]}
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  content: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  message: { fontSize: 14, marginBottom: 4 },
  date: { fontSize: 12 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
});
