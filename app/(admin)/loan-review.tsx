import { useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert, TextInput } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { api } from "@/services/api";

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
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!loanId) return;
      let active = true;
      setLoading(true);
      api
        .get(`/api/loans/${loanId}`)
        .then((res) => {
          if (active) setLoan(res.data.data);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [loanId]),
  );

  const handleApprove = () => {
    if (!loan) return;
    Alert.alert(
      "Approve Loan",
      `Approve ${formatCurrency(loan.amountRequested)} for ${loan.member.fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await api.post(`/api/loans/${loanId}/approve`, {
                amountApproved: loan.amountRequested,
                repaymentMonths: loan.repaymentMonths,
              });
              Alert.alert(
                "Loan Approved",
                res.data.message ??
                  `Loan for ${loan.member.fullName} has been approved.`,
                [
                  {
                    text: "OK",
                    onPress: () => router.push("/(admin)/loan-queue"),
                  },
                ],
              );
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.message || "Could not approve loan.",
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
      Alert.alert("Note required", "Please provide a reason for rejection.");
      return;
    }
    if (!loan) return;
    Alert.alert(
      "Reject Loan",
      `Reject this application from ${loan.member.fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await api.post(`/api/loans/${loanId}/reject`, {
                reason: rejectNote.trim(),
              });
              Alert.alert("Rejected", "Loan application has been rejected.", [
                {
                  text: "OK",
                  onPress: () => router.push("/(admin)/loan-queue"),
                },
              ]);
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.message || "Could not reject loan.",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenWrapper
        header={
          <PageHeader
            title="Loan Review"
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
          Loading...
        </Text>
      </ScreenWrapper>
    );
  }

  if (!loan) {
    return (
      <ScreenWrapper
        header={
          <PageHeader
            title="Loan Review"
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
          Loan not found.
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
          title="Loan Review"
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
          { label: "Applicant", value: loan.member.fullName },
          {
            label: "Amount Requested",
            value: formatCurrency(loan.amountRequested),
          },
          { label: "Term", value: `${loan.repaymentMonths} months` },
          { label: "Interest Rate", value: `${loan.interestRate}% p.a.` },
          { label: "Purpose", value: loan.purpose },
          {
            label: "Total Savings",
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
                Rejection Reason
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
                Reason for rejection
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
                placeholder="e.g. Insufficient savings history..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </Card>
          )}
          <View style={styles.actions}>
            <Button
              title="Approve"
              onPress={handleApprove}
              variant="primary"
              style={styles.button}
              loading={actionLoading}
            />
            <Button
              title={showRejectInput ? "Confirm Reject" : "Reject"}
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
