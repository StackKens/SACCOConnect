import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/currency";
import { ChevronRight } from "lucide-react-native";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    totalSavings: number;
    activeLoan?: number;
    status: "active" | "inactive";
  };
  onPress?: (id: string) => void;
  showActions?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onPress,
  showActions = false,
}) => {
  const { colors } = useTheme();
  const { id, name, email, avatar, totalSavings, activeLoan, status } = member;

  const handlePress = () => {
    if (onPress) onPress(id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <Avatar source={avatar} name={name} size={50} />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
              <Badge
                label={status}
                variant={status === "active" ? "success" : "error"}
              />
            </View>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {email}
            </Text>
            <View style={styles.financialRow}>
              <Text style={[styles.savings, { color: colors.success }]}>
                {formatCurrency(totalSavings)} saved
              </Text>
              {activeLoan !== undefined && activeLoan > 0 && (
                <Text style={[styles.loan, { color: colors.warning }]}>
                  {" "}
                  • {formatCurrency(activeLoan)} loan
                </Text>
              )}
            </View>
          </View>
          {showActions && (
            <ChevronRight size={20} color={colors.textSecondary} />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 12 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 14, marginBottom: 4 },
  financialRow: { flexDirection: "row", alignItems: "center" },
  savings: { fontSize: 12 },
  loan: { fontSize: 12 },
});
