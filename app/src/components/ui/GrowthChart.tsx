import { View, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";

export interface GrowthPoint {
  label: string;
  value: number;
}

interface GrowthChartProps {
  data: GrowthPoint[];
  height?: number;
  barWidth?: number;
  barRadius?: number;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data, height = 120, barWidth = 26, barRadius = 4 }) => {
  const { colors, spacing, typography } = useTheme();
  if (data.length === 0) return null;

  const n = data.length;
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 28;
  const cell = `${100 / n}%`;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", height }}>
        {data.map((d, i) => {
          const barHeight = Math.max((d.value / max) * (chartHeight - 8), 4);
          return (
            <View key={i} style={{ width: cell, alignItems: "center", justifyContent: "flex-end", height: chartHeight }}>
              <Svg width={barWidth} height={chartHeight}>
                <Rect
                  x={0}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx={barRadius}
                  fill={d.value > 0 ? colors.secondary : (colors.border as string)}
                />
              </Svg>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", marginTop: spacing.xs }}>
        {data.map((d, i) => (
          <Text key={i} numberOfLines={1} style={[typography.micro, { color: colors.textMuted, width: cell, textAlign: "center" }]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
};
