import { useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList, Modal } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Avatar } from "@/components/ui/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { router, useFocusEffect } from "expo-router";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/services/auth.service";
import { formatCurrency } from "@/utils/currency";
import { CheckCircle, Circle } from "lucide-react-native";

interface Eligibility {
  maxAmount: number;
  hasActiveLoan: boolean;
  reason?: string;
  qualifyingFactors: string[];
}

interface Member {
  id: string;
  fullName: string;
  user: { phoneNumber: string };
}

export default function ApplyLoan() {
  const { colors } = useTheme();
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [term, setTerm] = useState("");
  const [guarantors, setGuarantors] = useState<Member[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([
        api.get("/api/members/me/eligibility"),
        api.get("/api/members"),
      ]).then(([eligRes, membersRes]) => {
        if (!active) return;
        setEligibility(eligRes.data.data);
        setMembers(membersRes.data.data);
      }).catch(() => {}).finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []),
  );

  const toggleGuarantor = (member: Member) => {
    setGuarantors((prev) => {
      const exists = prev.find((g) => g.id === member.id);
      if (exists) return prev.filter((g) => g.id !== member.id);
      if (prev.length >= 2) {
        Alert.alert("Limit reached", "You can only select 2 guarantors.");
        return prev;
      }
      return [...prev, member];
    });
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Enter a valid loan amount.");
      return;
    }
    if (!purpose.trim()) {
      Alert.alert("Error", "Enter the purpose of the loan.");
      return;
    }
    const numTerm = parseInt(term, 10);
    if (isNaN(numTerm) || numTerm <= 0) {
      Alert.alert("Error", "Enter a valid repayment term in months.");
      return;
    }
    if (guarantors.length < 2) {
      Alert.alert("Error", "You must select exactly 2 guarantors.");
      return;
    }
    if (eligibility && numAmount > eligibility.maxAmount) {
      Alert.alert("Amount too high", `Maximum loan you qualify for is ${formatCurrency(eligibility.maxAmount)}.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/loans/apply", {
        amountRequested: numAmount,
        purpose: purpose.trim(),
        repaymentMonths: numTerm,
        guarantorIds: guarantors.map((g) => g.id),
      });
      Alert.alert(
        "Application Submitted ✅",
        "Your loan application has been submitted. Guarantors will be notified and the admin will review it shortly.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper header={<PageHeader title="Apply for a Loan" showBack onBack={() => router.back()} />}>
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>Checking eligibility...</Text>
      </ScreenWrapper>
    );
  }

  if (eligibility?.hasActiveLoan || (eligibility && eligibility.maxAmount === 0)) {
    return (
      <ScreenWrapper header={<PageHeader title="Apply for a Loan" showBack onBack={() => router.back()} />}>
        <Card style={styles.blockedCard}>
          <Text style={[styles.blockedTitle, { color: colors.error }]}>Not Eligible</Text>
          <Text style={[styles.blockedReason, { color: colors.textSecondary }]}>
            {eligibility.reason ?? "You do not qualify for a loan at this time."}
          </Text>
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll header={<PageHeader title="Apply for a Loan" showBack onBack={() => router.back()} />}>

      {eligibility && (
        <Card style={[styles.eligibilityCard, { borderColor: colors.success + "40" }]}>
          <Text style={[styles.eligibilityLabel, { color: colors.textSecondary }]}>You qualify for up to</Text>
          <Text style={[styles.eligibilityAmount, { color: colors.success }]}>{formatCurrency(eligibility.maxAmount)}</Text>
          {eligibility.qualifyingFactors.map((f, i) => (
            <Text key={i} style={[styles.factor, { color: colors.textSecondary }]}>• {f}</Text>
          ))}
        </Card>
      )}

      <Card style={styles.card}>
        <Input label="Loan Amount (UGX)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder={`Max ${formatCurrency(eligibility?.maxAmount ?? 0)}`} />
        <Input label="Purpose" value={purpose} onChangeText={setPurpose} placeholder="e.g. Business, Education, Medical" />
        <Input label="Repayment Term (months)" value={term} onChangeText={setTerm} keyboardType="numeric" placeholder="e.g. 6" />

        <Divider style={styles.divider} />

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Guarantors ({guarantors.length}/2)</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Select 2 active SACCO members to guarantee your loan.</Text>

        {guarantors.length > 0 && (
          <View style={styles.selectedList}>
            {guarantors.map((g) => (
              <View key={g.id} style={[styles.selectedChip, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}>
                <Text style={[styles.chipText, { color: colors.success }]}>{g.fullName}</Text>
                <TouchableOpacity onPress={() => toggleGuarantor(g)}>
                  <Text style={[styles.chipRemove, { color: colors.error }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Button
          title={guarantors.length === 2 ? "Change Guarantors" : "Select Guarantors"}
          variant="outline"
          onPress={() => setShowPicker(true)}
          style={styles.guarantorBtn}
        />
      </Card>

      <Button title="Submit Application" onPress={handleSubmit} loading={submitting} />

      {/* Guarantor Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select 2 Guarantors</Text>
              <Button title="Done" onPress={() => setShowPicker(false)} style={styles.doneBtn} />
            </View>
            <Divider />
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.memberList}
              renderItem={({ item }) => {
                const selected = !!guarantors.find((g) => g.id === item.id);
                return (
                  <TouchableOpacity style={styles.memberRow} onPress={() => toggleGuarantor(item)}>
                    <Avatar name={item.fullName} size={40} />
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>{item.fullName}</Text>
                      <Text style={[styles.memberPhone, { color: colors.textSecondary }]}>{item.user.phoneNumber}</Text>
                    </View>
                    {selected
                      ? <CheckCircle size={22} color={colors.success} />
                      : <Circle size={22} color={colors.border} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  eligibilityCard: { marginBottom: 16, borderWidth: 1 },
  eligibilityLabel: { fontSize: 13, marginBottom: 4 },
  eligibilityAmount: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  factor: { fontSize: 12, marginTop: 2 },
  blockedCard: { marginTop: 20 },
  blockedTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  blockedReason: { fontSize: 14, lineHeight: 20 },
  card: { marginBottom: 20 },
  divider: { marginVertical: 16 },
  sectionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  sectionSub: { fontSize: 12, marginBottom: 12 },
  selectedList: { gap: 8, marginBottom: 12 },
  selectedChip: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 14, fontWeight: "600" },
  chipRemove: { fontSize: 14, fontWeight: "700", paddingLeft: 8 },
  guarantorBtn: { marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "75%", paddingTop: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  doneBtn: { minWidth: 70 },
  memberList: { paddingHorizontal: 16, paddingVertical: 8 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: "600" },
  memberPhone: { fontSize: 12, marginTop: 2 },
});
