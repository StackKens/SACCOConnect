import { useState } from "react";
import { View, Text, StyleSheet, Alert, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useTranslation } from "react-i18next";

interface LoanDetail {
  id: string;
  amountRequested: number;
  amountApproved: number | null;
  purpose: string;
  status: string;
  interestRate: number;
  repaymentMonths: number;
  totalRepayable: number | null;
  amountRepaid: number;
  rejectionReason: string | null;
  createdAt: string;
  member: {
    fullName: string;
    currentBalance: number;
    joinDate: string;
  };
}

export default function LoanReview() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const loanId = Array.isArray(id) ? id[0] : id;
  const { colors } = useTheme();
  const { t } = useTranslation("admin");
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const { loading, error, refresh } = useApiFetch(async () => {
    if (!loanId) return;
    const res = await api.get(`/api/loans/${loanId}`);
    setLoan(res.data.data);
  }, [loanId]);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApprove = () => {
    if (!loan) return;
    Alert.alert(
      t("loanReview.approveTitle"), t("loanReview.approvePrompt", { amount: formatCurrency(loan.amountRequested), memberName: loan.member.fullName }),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: t("approve"),
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await api.post(`/api/loans/${loanId}/approve`, {
                amountApproved: loan.amountRequested,
                repaymentMonths: loan.repaymentMonths,
              });
              Alert.alert(
                t("loanReview.approvedTitle"),
                res.data.message ??
                  t("loanReview.approvedMsg", { memberName: loan.member.fullName }),
                [
                  {
                    text: t("ok"),
                    onPress: () => router.push("/(admin)/loan-queue"),
                  },
                ],
              );
            } catch (e: any) {
              Alert.alert(
                t("loanReview.error"), e?.response?.data?.message || t("loanReview.couldNotApprove"),
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReject = () => {
    if (!rejectNote.trim()) {
      Alert.alert(t("loanReview.noteRequired"), t("loanReview.reasonRequired"));
      return;
    }
    if (!loan) return;
    Alert.alert(
      t("loanReview.rejectTitle"), t("loanReview.rejectPrompt", { memberName: loan.member.fullName }),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: t("reject"),
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await api.post(`/api/loans/${loanId}/reject`, {
                reason: rejectNote.trim(),
              });
              Alert.alert(t("loanReview.rejectedTitle"), t("loanReview.rejectedMsg"), [
                {
                  text: t("ok"),
                  onPress: () => router.push("/(admin)/loan-queue"),
                },
              ]);
            } catch (e: any) {
              Alert.alert(
                t("loanReview.error"), e?.response?.data?.message || t("loanReview.couldNotReject"),
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading || (loan && loan.id !== loanId)) {
    return (
      <ScreenWrapper
        header={
          <PageHeader
            title={t("loanReview.title")}
            showBack
            onBack={() => router.push("/(admin)/loan-queue")}
          />
        }
      >
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: 40,
          }}
        >
          {t("common:loading")}
        </Text>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper
        header={
          <PageHeader
            title={t("loanReview.title")}
            showBack
            onBack={() => router.push("/(admin)/loan-queue")}
          />
        }
      >
        <ErrorState message={error} onRetry={refresh} />
      </ScreenWrapper>
    );
  }

  if (!loan) {
    return (
      <ScreenWrapper
        header={
          <PageHeader
            title={t("loanReview.title")}
            showBack
            onBack={() => router.push("/(admin)/loan-queue")}
          />
        }
      >
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: 40,
          }}
        >
          {t("loanReview.notFound")}
        </Text>
      </ScreenWrapper>
    );
  }

  const isAlreadyActioned = ![
    "PENDING",
    "AWAITING_GUARANTORS",
    "UNDER_REVIEW",
  ].includes(loan.status);
  const statusVariant =
    loan.status === "ACTIVE"
      ? "success"
      : loan.status === "REJECTED"
        ? "error"
        : "warning";

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title={t("loanReview.title")}
          showBack
          onBack={() => router.push("/(admin)/loan-queue")}
          rightComponent={
            <Badge
              label={loan.status.replace(/_/g, " ").toLowerCase()}
              variant={statusVariant}
            />
          }
        />
      }
    >
      <Card style={styles.card}>
        {[
          { label: t("loanReview.applicant"), value: loan.member.fullName },
          {
            label: t("loanReview.amountRequested"),
            value: formatCurrency(loan.amountRequested),
          },
          { label: t("loanReview.term"), value: t("loanReview.months", { months: loan.repaymentMonths }) },
          { label: t("loanReview.interestRate"), value: `${loan.interestRate}% p.a.` },
          { label: t("loanReview.purpose"), value: loan.purpose },
          {
            label: t("totalSavings"),
            value: formatCurrency(loan.member.currentBalance),
            highlight: true,
          },
        ].map(({ label, value, highlight }, i) => (
          <View key={i}>
            {i > 0 && <Divider style={styles.divider} />}
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {label}
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: highlight ? colors.success : colors.text },
                ]}
              >
                {value}
              </Text>
            </View>
          </View>
        ))}
        {loan.rejectionReason && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t("loanReview.rejectionReason")}
              </Text>
              <Text style={[styles.value, { color: colors.error }]}>
                {loan.rejectionReason}
              </Text>
            </View>
          </>
        )}
      </Card>

      {!isAlreadyActioned && (
        <>
          {showRejectInput && (
            <Card style={styles.rejectCard}>
              <Text style={[styles.rejectLabel, { color: colors.text }]}>
                {t("loanReview.reasonLabel")}
              </Text>
              <TextInput
                style={[
                  styles.rejectInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                value={rejectNote}
                onChangeText={setRejectNote}
                placeholder={t("loanReview.reasonPlaceholder")}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </Card>
          )}
          <View style={styles.actions}>
            <Button
              title={t("approve")}
              onPress={handleApprove}
              variant="primary"
              style={styles.button}
              loading={actionLoading}
            />
            <Button
              title={showRejectInput ? t("loanReview.confirmReject") : t("reject")}
              onPress={
                showRejectInput ? handleReject : () => setShowRejectInput(true)
              }
              variant="danger"
              style={styles.button}
              loading={actionLoading}
            />
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  divider: { marginVertical: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  label: { fontSize: 13, fontWeight: "500", flex: 1 },
  value: { fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right" },
  rejectCard: { marginBottom: 16 },
  rejectLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 72,
  },
  actions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  button: { flex: 1 },
});
