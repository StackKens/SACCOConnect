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
      <View style={styles.iconRow}>
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { width: "47%", marginBottom: 12 },
  iconRow: { marginBottom: 8 },
  icon: {},
  title: { fontSize: 12, fontWeight: "500", marginTop: 4 },
  value: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
});
