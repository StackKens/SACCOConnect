import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { Wallet, Banknote, RefreshCw, AlertCircle } from "lucide-react-native";

export default function Treasury() {
  const { colors } = useTheme();

  const totalSavings = 1250000;
  const totalLoansDisbursed = 890000;
  const totalRepayments = 450000;
  const outstandingLoans = 440000;

  return (
    <ScreenWrapper scroll header={<PageHeader title="Treasury" subtitle="Financial summary and collections" />}>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavings)}
          icon={<Wallet size={24} color={colors.secondary} />}
        />
        <StatCard
          title="Disbursed Loans"
          value={formatCurrency(totalLoansDisbursed)}
          icon={<Banknote size={24} color={colors.warning} />}
        />
        <StatCard
          title="Repayments"
          value={formatCurrency(totalRepayments)}
          icon={<RefreshCw size={24} color={colors.success} />}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(outstandingLoans)}
          icon={<AlertCircle size={24} color={colors.error} />}
        />
      </View>

      <Card style={styles.chartPlaceholder}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Monthly Collections
        </Text>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              { height: 80, backgroundColor: colors.secondary },
            ]}
          />
          <View
            style={[
              styles.bar,
              { height: 120, backgroundColor: colors.secondary },
            ]}
          />
          <View
            style={[
              styles.bar,
              { height: 60, backgroundColor: colors.secondary },
            ]}
          />
          <View
            style={[
              styles.bar,
              { height: 100, backgroundColor: colors.secondary },
            ]}
          />
        </View>
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          Chart preview (integration ready)
        </Text>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chartPlaceholder: { alignItems: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    width: "100%",
    height: 150,
  },
  bar: { width: 40, borderRadius: 8 },
});
