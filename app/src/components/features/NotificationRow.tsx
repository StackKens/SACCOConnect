import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { getRelativeTime } from "../../utils/date";
import { Info, PiggyBank, CreditCard, CheckCircle, XCircle } from "lucide-react-native";

export type NotifType =
  | "announcement"
  | "contribution"
  | "loan_applied"
  | "loan_approved"
  | "loan_rejected"
  | "loan_repayment";

export interface NotifItem {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  date: string;
}

const NOTIF_META: Record<NotifType, { icon: React.FC<any>; color: (c: any) => string; label: string }> = {
  announcement:   { icon: Info,        color: (c) => c.primary,  label: "Announcement" },
  contribution:   { icon: PiggyBank,   color: (c) => c.success,  label: "Contribution" },
  loan_applied:   { icon: CreditCard,  color: (c) => c.warning,  label: "Loan" },
  loan_approved:  { icon: CheckCircle, color: (c) => c.success,  label: "Loan" },
  loan_rejected:  { icon: XCircle,     color: (c) => c.error,    label: "Loan" },
  loan_repayment: { icon: CreditCard,  color: (c) => c.primary,  label: "Repayment" },
};

interface NotificationRowProps {
  item: NotifItem;
  isRead: boolean;
  onRead: (id: string) => void;
}

export const NotificationRow: React.FC<NotificationRowProps> = React.memo(
  ({ item, isRead, onRead }) => {
    const { colors } = useTheme();
    const meta = NOTIF_META[item.type];
    const iconColor = meta.color(colors);
    const Icon = meta.icon;

    return (
      <TouchableOpacity
        onPress={() => onRead(item.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Mark ${item.title} as read`}
      >
        <View
          style={[
            styles.row,
            { backgroundColor: isRead ? colors.surface : colors.primary + "08" },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: iconColor + "18" }]}>
            <Icon size={18} color={iconColor} />
          </View>
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                !isRead && { fontWeight: "700" },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.message, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {getRelativeTime(item.date)}
            </Text>
          </View>
          {!isRead && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  date: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
});
