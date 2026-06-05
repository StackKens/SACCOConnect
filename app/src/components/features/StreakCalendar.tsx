import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Card } from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";
import { Flame } from "lucide-react-native";

interface StreakCalendarProps {
  streakCount: number;
  monthsData: {
    month: string;
    days: {
      date: number;
      contributed: boolean;
    }[];
  }[];
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  streakCount,
  monthsData,
}) => {
  const { colors } = useTheme();
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Flame size={28} color={colors.warning} />
        <Text style={[styles.streakText, { color: colors.text }]}>
          {streakCount} Month Streak!
        </Text>
      </View>
      <Text style={[styles.subtext, { color: colors.textSecondary }]}>
        Keep contributing monthly to maintain your streak
      </Text>

      {monthsData.map((monthData, idx) => (
        <View key={idx} style={styles.monthContainer}>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {monthData.month}
          </Text>
          <View style={styles.weekDaysRow}>
            {weekDays.map((day) => (
              <Text
                key={day}
                style={[styles.weekDay, { color: colors.textSecondary }]}
              >
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {monthData.days.map((day, i) => (
              <View key={i} style={styles.dayCell}>
                <View
                  style={[
                    styles.dayCircle,
                    day.contributed && {
                      backgroundColor: colors.success,
                      borderColor: colors.success,
                    },
                    !day.contributed && {
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: day.contributed ? "#FFF" : colors.textSecondary,
                      },
                    ]}
                  >
                    {day.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 20, paddingHorizontal: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  streakText: { fontSize: 20, fontWeight: "bold", marginLeft: 8 },
  subtext: { fontSize: 12, textAlign: "center", marginBottom: 16 },
  monthContainer: { marginBottom: 20 },
  monthTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekDay: { fontSize: 12, fontWeight: "500", width: 32, textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: Dimensions.get("window").width / 8,
    alignItems: "center",
    marginVertical: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { fontSize: 12, fontWeight: "500" },
});
