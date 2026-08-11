import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/currency";
import { ChevronRight } from "lucide-react-native";

interface MemberRowProps {
  member: {
    id: string;
    fullName: string;
    currentBalance: number;
    status: string;
    user: { phoneNumber: string };
  };
  onPress: () => void;
  isYou?: boolean;
}

export const MemberRow: React.FC<MemberRowProps> = React.memo(
  ({ member, onPress, isYou = false }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View member ${member.fullName}`}
      >
        <Card style={styles.card}>
          <View style={styles.row}>
            <Avatar name={member.fullName} size={48} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {member.fullName}
                </Text>
                {isYou && (
                  <View style={[styles.youBadge, { backgroundColor: colors.primary + "18" }]}>
                    <Text style={[styles.youText, { color: colors.primary }]}>You</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.phone, { color: colors.textSecondary }]}>
                {member.user.phoneNumber}
              </Text>
              <Text style={[styles.savings, { color: colors.success }]}>
                {formatCurrency(member.currentBalance)} saved
              </Text>
            </View>
            <View style={styles.right}>
              <Text
                style={[
                  styles.status,
                  {
                    color:
                      member.status === "ACTIVE"
                        ? colors.success
                        : colors.textSecondary,
                  },
                ]}
              >
                {member.status.toLowerCase()}
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  youBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  youText: { fontSize: 11, fontWeight: "700" },
  right: { alignItems: "flex-end", gap: 4 },
  name: { fontSize: 15, fontWeight: "600" },
  phone: { fontSize: 13, marginTop: 2 },
  savings: { fontSize: 12, marginTop: 4 },
  status: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
});
