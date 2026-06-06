import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { getRelativeTime } from "@/utils/date";
import { Wallet, Banknote, RefreshCw, AlertCircle, TrendingUp, TrendingDown } from "lucide-react-native";
import Svg, { Polyline, Line, Text as SvgText, Polygon } from "react-native-svg";
import { useAuthStore } from "@/store/auth.store";
import { useLoanStore } from "@/store/loan.store";
import { getContributionsForSacco, getMemberSummaries, listMembersForSacco } from "@/helpers/members";
import { getMemberData } from "@/store/member.store";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - 40 - 32; // screen padding + card padding
const CHART_H = 140;
const PADDING = { top: 12, bottom: 28, left: 40, right: 12 };

function LineChart({ colors, monthlyData }: { colors: any; monthlyData: { month: string; collections: number; disbursed: number }[] }) {
  if (monthlyData.length === 0) {
    return (
      <Text style={{ color: colors.textSecondary, textAlign: "center", paddingVertical: 24 }}>
        Not enough data for a chart yet.
      </Text>
    );
  }

  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = CHART_H - PADDING.top - PADDING.bottom;

  const allValues = monthlyData.flatMap((d) => [d.collections, d.disbursed]);
  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;

  const toX = (i: number) => PADDING.left + (i / Math.max(monthlyData.length - 1, 1)) * plotW;
  const toY = (v: number) => PADDING.top + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

  const collectionsPoints = monthlyData.map((d, i) => `${toX(i)},${toY(d.collections)}`).join(" ");
  const disbursedPoints = monthlyData.map((d, i) => `${toX(i)},${toY(d.disbursed)}`).join(" ");

  // filled area under collections line
  const areaPoints =
    `${toX(0)},${PADDING.top + plotH} ` +
    monthlyData.map((d, i) => `${toX(i)},${toY(d.collections)}`).join(" ") +
    ` ${toX(monthlyData.length - 1)},${PADDING.top + plotH}`;

  const yLabels = [0, maxVal / 2, maxVal].map((v) => ({
    value: v >= 1000 ? `${(v / 1000).toFixed(0)}k` : "0",
    y: toY(v),
  }));

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Y grid lines */}
      {yLabels.map((l, i) => (
        <Line
          key={i}
          x1={PADDING.left}
          y1={l.y}
          x2={CHART_W - PADDING.right}
          y2={l.y}
          stroke={colors.border}
          strokeWidth={0.8}
          strokeDasharray="3,3"
        />
      ))}
      {/* Y labels */}
      {yLabels.map((l, i) => (
        <SvgText key={i} x={PADDING.left - 4} y={l.y + 4} fontSize={9} fill={colors.textSecondary} textAnchor="end">
          {l.value}
        </SvgText>
      ))}

      {/* Filled area under collections */}
      <Polygon points={areaPoints} fill={colors.primary + "18"} />

      {/* Collections line */}
      <Polyline
        points={collectionsPoints}
        fill="none"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Disbursed line */}
      <Polyline
        points={disbursedPoints}
        fill="none"
        stroke={colors.warning}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="5,3"
      />

      {/* X labels */}
      {monthlyData.map((d, i) => (
        <SvgText
          key={i}
          x={toX(i)}
          y={CHART_H - 6}
          fontSize={9}
          fill={colors.textSecondary}
          textAnchor="middle"
        >
          {d.month}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function Treasury() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const { loans } = useLoanStore();
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, []),
  );

  const treasury = useMemo(() => {
    if (!sacco?.id) {
      return {
        totalSavings: 0,
        totalLoansDisbursed: 0,
        totalRepayments: 0,
        outstandingLoans: 0,
        collectionRate: 0,
        savingsGrowth: 0,
        monthlyData: [] as { month: string; collections: number; disbursed: number }[],
        recentTransactions: [] as { id: string; member: string; type: string; amount: number; date: string }[],
      };
    }

    const members = getMemberSummaries(sacco.id);
    const saccoLoans = loans.filter((l) => l.saccoId === sacco.id && l.status === "approved");
    const contributions = getContributionsForSacco(sacco.id);

    const totalSavings = members.reduce((sum, m) => sum + m.savings, 0);
    const totalLoansDisbursed = saccoLoans.reduce((sum, l) => sum + l.amount, 0);

    let totalRepayments = 0;
    for (const user of listMembersForSacco(sacco.id)) {
      const data = getMemberData(user.id);
      totalRepayments += data.loans.reduce((sum, l) => sum + l.repaid, 0);
    }

    const outstandingLoans = Math.max(totalLoansDisbursed - totalRepayments, 0);
    const collectionRate = totalLoansDisbursed
      ? Math.round((totalRepayments / totalLoansDisbursed) * 100)
      : 0;
    const savingsGrowth = members.length
      ? Math.min(Math.round((totalSavings / members.length) / 1000), 100) / 10
      : 0;

    const monthMap = new Map<string, { collections: number; disbursed: number }>();
    for (const c of contributions) {
      if (c.status !== "completed") continue;
      const month = c.date.slice(0, 7);
      const entry = monthMap.get(month) ?? { collections: 0, disbursed: 0 };
      entry.collections += c.amount;
      monthMap.set(month, entry);
    }
    for (const l of saccoLoans) {
      const month = (l.date ?? new Date().toISOString()).slice(0, 7);
      const entry = monthMap.get(month) ?? { collections: 0, disbursed: 0 };
      entry.disbursed += l.amount;
      monthMap.set(month, entry);
    }

    const monthlyData = [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => ({
        month: new Date(`${key}-01`).toLocaleDateString("en-UG", { month: "short" }),
        collections: value.collections,
        disbursed: value.disbursed,
      }));

    const recentTransactions = listMembersForSacco(sacco.id)
      .flatMap((user) => {
        const data = getMemberData(user.id);
        return data.transactions.slice(0, 3).map((tx) => ({
          id: `${user.id}_${tx.id}`,
          member: user.name,
          type: tx.type.replace(/_/g, " "),
          amount: tx.type === "loan_repayment" ? -Math.abs(tx.amount) : tx.amount,
          date: getRelativeTime(tx.date),
        }));
      })
      .slice(0, 6);

    return {
      totalSavings,
      totalLoansDisbursed,
      totalRepayments,
      outstandingLoans,
      collectionRate,
      savingsGrowth,
      monthlyData,
      recentTransactions,
    };
  }, [loans, refreshKey, sacco?.id]);

  const {
    totalSavings,
    totalLoansDisbursed,
    totalRepayments,
    outstandingLoans,
    collectionRate,
    savingsGrowth,
    monthlyData,
    recentTransactions,
  } = treasury;

  return (
    <ScreenWrapper scroll header={<PageHeader title="Treasury" subtitle="Financial summary and collections" />}>

      {/* Stat cards */}
      <View style={styles.statsGrid}>
        <StatCard title="Total Savings" value={formatCurrency(totalSavings)} icon={<Wallet size={22} color={colors.secondary} />} />
        <StatCard title="Disbursed" value={formatCurrency(totalLoansDisbursed)} icon={<Banknote size={22} color={colors.warning} />} />
        <StatCard title="Repayments" value={formatCurrency(totalRepayments)} icon={<RefreshCw size={22} color={colors.success} />} />
        <StatCard title="Outstanding" value={formatCurrency(outstandingLoans)} icon={<AlertCircle size={22} color={colors.error} />} />
      </View>

      {/* Health metrics */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio Health</Text>
        <View style={styles.healthRow}>
          <View style={styles.healthItem}>
            <Text style={[styles.healthValue, { color: colors.success }]}>{collectionRate}%</Text>
            <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Collection Rate</Text>
            <View style={[styles.healthBar, { backgroundColor: colors.border }]}>
              <View style={[styles.healthFill, { width: `${collectionRate}%` as any, backgroundColor: colors.success }]} />
            </View>
          </View>
          <View style={[styles.healthDivider, { backgroundColor: colors.border }]} />
          <View style={styles.healthItem}>
            <View style={styles.healthValueRow}>
              <Text style={[styles.healthValue, { color: colors.primary }]}>{savingsGrowth}%</Text>
              <TrendingUp size={16} color={colors.success} />
            </View>
            <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Savings Growth</Text>
            <View style={[styles.healthBar, { backgroundColor: colors.border }]}>
              <View style={[styles.healthFill, { width: `${Math.min(savingsGrowth * 5, 100)}%` as any, backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>
      </Card>

      {/* Line chart */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Overview</Text>
        <LineChart colors={colors} monthlyData={monthlyData} />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Collections</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDash, { borderColor: colors.warning }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Disbursed</Text>
          </View>
        </View>
      </Card>

      {/* Recent transactions */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        {recentTransactions.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>No transactions yet</Text>
        ) : (
          recentTransactions.map((tx, i) => (
          <View key={tx.id}>
            {i > 0 && <View style={[styles.txDivider, { backgroundColor: colors.border }]} />}
            <View style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: tx.amount > 0 ? colors.success + "15" : colors.error + "15" }]}>
                {tx.amount > 0
                  ? <TrendingUp size={14} color={colors.success} />
                  : <TrendingDown size={14} color={colors.error} />}
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txMember, { color: colors.text }]}>{tx.member}</Text>
                <Text style={[styles.txType, { color: colors.textSecondary }]}>{tx.type} · {tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.error }]}>
                {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
              </Text>
            </View>
          </View>
          ))
        )}
      </Card>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  healthRow: { flexDirection: "row", alignItems: "center" },
  healthItem: { flex: 1, gap: 6 },
  healthDivider: { width: 1, height: 60, marginHorizontal: 16 },
  healthValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  healthValue: { fontSize: 22, fontWeight: "800" },
  healthLabel: { fontSize: 12 },
  healthBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  healthFill: { height: 4, borderRadius: 2 },
  legend: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendDash: { width: 16, height: 0, borderTopWidth: 2, borderStyle: "dashed" },
  legendLabel: { fontSize: 11 },
  txDivider: { height: 1, opacity: 0.5, marginVertical: 10 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  txIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txMember: { fontSize: 14, fontWeight: "600" },
  txType: { fontSize: 12, marginTop: 1 },
  txAmount: { fontSize: 14, fontWeight: "700" },
});
