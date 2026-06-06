import { useState } from "react";
import { View, Text, StyleSheet, Alert, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/currency";
import { useLoanStore } from "@/store/loan.store";

export default function LoanReview() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const loanId = Array.isArray(id) ? id[0] : id;
  const { colors } = useTheme();
  const { getById, approveLoan, rejectLoan } = useLoanStore();
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const loan = loanId ? getById(loanId) : undefined;

  if (!loan) {
    return (
      <ScreenWrapper header={<PageHeader title="Loan Review" showBack onBack={() => router.push("/(admin)/loan-queue")} />}>
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>Loan not found.</Text>
      </ScreenWrapper>
    );
  }

  const handleApprove = () => {
    Alert.alert("Approve Loan", `Approve UGX ${loan.amount.toLocaleString()} for ${loan.memberName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          approveLoan(loan.id);
          Alert.alert("Approved ✅", `Loan for ${loan.memberName} has been approved.`, [
            { text: "OK", onPress: () => router.push("/(admin)/loan-queue") },
          ]);
        },
      },
    ]);
  };

  const handleReject = () => {
    if (!rejectNote.trim()) {
      Alert.alert("Note required", "Please provide a reason for rejection.");
      return;
    }
    Alert.alert("Reject Loan", `Reject this application from ${loan.memberName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          rejectLoan(loan.id, rejectNote.trim());
          Alert.alert("Rejected", `Loan application has been rejected.`, [
            { text: "OK", onPress: () => router.push("/(admin)/loan-queue") },
          ]);
        },
      },
    ]);
  };

  const isAlreadyActioned = loan.status !== "pending";

  return (
    <ScreenWrapper scroll header={
      <PageHeader
        title="Loan Review"
        showBack
        onBack={() => router.push("/(admin)/loan-queue")}
        rightComponent={
          <Badge
            label={loan.status}
            variant={loan.status === "approved" ? "success" : loan.status === "rejected" ? "error" : "warning"}
          />
        }
      />
    }>
      <Card style={styles.card}>
        {[
          { label: "Applicant", value: loan.memberName },
          { label: "Amount Requested", value: formatCurrency(loan.amount) },
          { label: "Term", value: `${loan.term} months` },
          { label: "Interest Rate", value: `${loan.interestRate}% p.a.` },
          { label: "Purpose", value: loan.purpose },
          { label: "Member Since", value: loan.memberSince },
          { label: "Total Savings", value: formatCurrency(loan.totalSavings), highlight: true },
        ].map(({ label, value, highlight }, i) => (
          <View key={i}>
            {i > 0 && <Divider style={styles.divider} />}
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
              <Text style={[styles.value, { color: highlight ? colors.success : colors.text }]}>{value}</Text>
            </View>
          </View>
        ))}
        {loan.rejectNote ? (
          <>
            <Divider style={styles.divider} />
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Rejection Reason</Text>
              <Text style={[styles.value, { color: colors.error }]}>{loan.rejectNote}</Text>
            </View>
          </>
        ) : null}
      </Card>

      {!isAlreadyActioned && (
        <>
          {showRejectInput && (
            <Card style={styles.rejectCard}>
              <Text style={[styles.rejectLabel, { color: colors.text }]}>Reason for rejection</Text>
              <TextInput
                style={[styles.rejectInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
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
            <Button title="Approve" onPress={handleApprove} variant="primary" style={styles.button} />
            <Button
              title={showRejectInput ? "Confirm Reject" : "Reject"}
              onPress={showRejectInput ? handleReject : () => setShowRejectInput(true)}
              variant="danger"
              style={styles.button}
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  label: { fontSize: 13, fontWeight: "500", flex: 1 },
  value: { fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right" },
  rejectCard: { marginBottom: 16 },
  rejectLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  rejectInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 72 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  button: { flex: 1 },
});
