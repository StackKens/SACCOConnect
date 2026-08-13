import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface PaginationProps {
  count: number;
  activeIndex: number;
}

export function Pagination({ count, activeIndex }: PaginationProps) {
  const { colors } = useTheme();

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Page ${activeIndex + 1} of ${count}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: count, now: activeIndex + 1 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === activeIndex
              ? [styles.dotActive, { backgroundColor: colors.primary }]
              : { backgroundColor: colors.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
});
