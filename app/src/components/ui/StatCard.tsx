import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "./Card";
import { useTheme } from "../../hooks/useTheme";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View>
          <Text style={[styles.title, { color: colors.textSecondary }]}>
            {title}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, marginHorizontal: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 12 },
  title: { fontSize: 12, fontWeight: "500" },
  value: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
});
