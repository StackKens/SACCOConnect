import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { getRelativeTime } from "@/utils/date";
import { CheckCircle, AlertCircle, Info } from "lucide-react-native";

const mockNotifications = [
  {
    id: "1",
    title: "Loan Approved",
    message: "Your loan of UGX 50,000 has been approved",
    date: "2025-06-01",
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "Contribution Reminder",
    message: "Your contribution is due in 3 days",
    date: "2025-05-28",
    read: true,
    type: "warning",
  },
  {
    id: "3",
    title: "Announcement",
    message: "AGM scheduled for June 30th",
    date: "2025-05-25",
    read: true,
    type: "info",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const { colors } = useTheme();

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => markAsRead(item.id)} activeOpacity={0.7}>
      <Card
        style={[
          styles.card,
          !item.read && { backgroundColor: colors.primary + "08" },
        ]}
      >
        <View style={styles.row}>
          {item.type === "success" ? (
            <CheckCircle size={24} color={colors.success} />
          ) : item.type === "warning" ? (
            <AlertCircle size={24} color={colors.warning} />
          ) : (
            <Info size={24} color={colors.primary} />
          )}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {item.message}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {getRelativeTime(item.date)}
            </Text>
          </View>
          {!item.read && (
            <View
              style={[styles.unreadDot, { backgroundColor: colors.primary }]}
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper scroll={false}>
      <FlatList
        ListHeaderComponent={<PageHeader title="Notifications" />}
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 }]}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  list: { paddingBottom: 20 },
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
