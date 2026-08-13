import { useState } from "react";
import { View, Text, Alert, TouchableOpacity, FlatList, Modal } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { useCountry } from "@/hooks/useCountry";
import { router } from "expo-router";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { getApiErrorMessage } from "@/services/auth.service";
import { formatCurrency } from "@/utils/currency";
import { CheckCircle, Circle } from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "react-i18next";

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

const STEPS = ["stepAmount", "stepPurpose", "stepTerm", "stepGuarantors", "stepReview"] as const;

function estimateMonthly(principal: number, rate: number, months: number) {
  if (!(principal > 0) || months <= 0) return 0;
  const total = principal * (1 + (rate / 100) * (months / 12));
  return total / months;
}

export default function ApplyLoan() {
  const { t } = useTranslation("loans");
  const { colors, spacing, radius, typography } = useTheme();
  const { country } = useCountry();
  const sacco = useAuthStore((state) => state.sacco);
  const [stepIdx, setStepIdx] = useState(0);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const [eligRes, membersRes] = await Promise.all([
      api.get("/api/members/me/eligibility"),
      api.get("/api/members/sacco-members"),
    ]);
    setEligibility(eligRes.data.data);
    setMembers(membersRes.data.data);
  });
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [term, setTerm] = useState("");
  const [guarantors, setGuarantors] = useState<Member[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const numAmount = parseFloat(amount);
  const numTerm = parseInt(term, 10);
  const interestRate = sacco?.interestRate ?? 0;
  const monthlyEstimate = estimateMonthly(isNaN(numAmount) ? 0 : numAmount, interestRate, isNaN(numTerm) ? 0 : numTerm);
  const maxAmount = eligibility?.maxAmount ?? 0;

  const toggleGuarantor = (member: Member) => {
    setGuarantors((prev) => {
      const exists = prev.find((g) => g.id === member.id);
      if (exists) return prev.filter((g) => g.id !== member.id);
      if (prev.length >= 2) {
        Alert.alert(t("apply.limitReached"), t("apply.limitReachedMsg"));
        return prev;
      }
      return [...prev, member];
    });
  };

  const validateStep = (): string | null => {
    switch (stepIdx) {
      case 0:
        if (isNaN(numAmount) || numAmount <= 0) return t("apply.amountRequired");
        if (eligibility && numAmount > eligibility.maxAmount) return t("apply.maxAmount", { amount: formatCurrency(eligibility.maxAmount) });
        return null;
      case 1:
        return purpose.trim() ? null : t("apply.purposeRequired");
      case 2:
        return isNaN(numTerm) || numTerm <= 0 ? t("apply.termRequired") : null;
      case 3:
        return guarantors.length === 2 ? null : t("apply.guarantorsRequired");
      default:
        return null;
    }
  };

  const next = () => {
    const error = validateStep();
    if (error) {
      Alert.alert(t("apply.almostThere"), error);
      return;
    }
    if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
  };

  const back = () => {
    if (stepIdx === 0) router.back();
    else setStepIdx((i) => i - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/api/loans/apply", {
        amountRequested: numAmount,
        purpose: purpose.trim(),
        repaymentMonths: numTerm,
        guarantorIds: guarantors.map((g) => g.id),
      });
      Alert.alert(
        t("apply.applicationSubmitted"),
        t("apply.submittedMsg"),
        [{ text: t("apply.done"), onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert(t("apply.error"), getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const stepHeader = (
    <View style={{ marginBottom: spacing.xl }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{t("apply.step", { step: stepIdx + 1, total: STEPS.length })}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{t("apply." + STEPS[stepIdx])}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm }}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= stepIdx ? colors.secondary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );

  const renderBackForward = (submitLabel?: string) => (
    <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.huge }}>
      <Button title={t("apply.back")} onPress={back} variant="ghost" style={{ flex: 1 }} />
      {submitLabel ? (
        <Button title={submitLabel} onPress={handleSubmit} loading={submitting} style={{ flex: 2 }} />
      ) : (
        <Button title={t("apply.continue")} onPress={next} style={{ flex: 2 }} />
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper header={<PageHeader title={t("apply.title")} showBack onBack={() => router.back()} />}>
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: spacing.huge }}>{t("apply.checkingEligibility")}</Text>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper header={<PageHeader title={t("apply.title")} showBack onBack={() => router.back()} />}>
        <ErrorState message={error} onRetry={refresh} />
      </ScreenWrapper>
    );
  }

  if (eligibility?.hasActiveLoan || (eligibility && eligibility.maxAmount === 0)) {
    return (
      <ScreenWrapper header={<PageHeader title={t("apply.title")} showBack onBack={() => router.back()} />}>
        <View style={{ marginTop: spacing.xl, backgroundColor: colors.errorSoft as string, borderRadius: radius.lg, padding: spacing.xl }}>
          <Text style={[typography.h3, { color: colors.error }]}>{t("apply.notEligible")}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 }]}>
            {eligibility.reason ?? t("apply.noEligibility")}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll header={<PageHeader title={t("apply.title")} showBack onBack={back} />}>
      {stepHeader}

      {stepIdx === 0 && (
        <>
          {eligibility && (
            <View style={{ backgroundColor: colors.successSoft as string, borderWidth: 1, borderColor: colors.success + "40", borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.xl }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{t("apply.qualifyUpTo")}</Text>
              <Text style={[typography.h2, { color: colors.success, marginTop: 2, fontVariant: ["tabular-nums"] }]}>{formatCurrency(eligibility.maxAmount)}</Text>
              {eligibility.qualifyingFactors.map((f, i) => (
                <Text key={i} style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>• {f}</Text>
              ))}
            </View>
          )}

          <Text style={[typography.h3, { color: colors.text }]}>{t("apply.howMuch")}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }]}>
            {t("apply.howMuchSub", { amount: formatCurrency(maxAmount) })}
          </Text>
          <Input label={t("apply.loanAmountLabel", { currency: country.currency })} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder={`e.g. ${Math.round(maxAmount / 2).toLocaleString()}`} />

          {numAmount > 0 && numTerm > 0 && (
            <View style={{ backgroundColor: colors.surfaceAlt as string, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{t("apply.estimatedRepayment")}</Text>
              <Text style={[typography.h3, { color: colors.text, marginTop: 2, fontVariant: ["tabular-nums"] }]}>
                ~{formatCurrency(Math.round(monthlyEstimate))} / month
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                {t("apply.overMonths", { months: numTerm, rate: interestRate })}
              </Text>
            </View>
          )}
        </>
      )}

      {stepIdx === 1 && (
        <>
          <Text style={[typography.h3, { color: colors.text }]}>{t("apply.purposeTitle")}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }]}>
            {t("apply.purposeSub")}
          </Text>
          <Input label={t("apply.purposeLabel")} value={purpose} onChangeText={setPurpose} placeholder="e.g. Business, Education, Medical" />
        </>
      )}

      {stepIdx === 2 && (
        <>
          <Text style={[typography.h3, { color: colors.text }]}>{t("apply.termTitle")}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }]}>
            {t("apply.termSub")}
          </Text>
          <Input label={t("apply.termLabel")} value={term} onChangeText={setTerm} keyboardType="numeric" placeholder="e.g. 6" />
          {numAmount > 0 && numTerm > 0 && (
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md }]}>
              {t("apply.estimatedRepayment")}: ~{formatCurrency(Math.round(monthlyEstimate))} / month
            </Text>
          )}
        </>
      )}

      {stepIdx === 3 && (
        <>
          <Text style={[typography.h3, { color: colors.text }]}>{t("apply.guarantorsTitle")}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }]}>
            {t("apply.guarantorsSub")}
          </Text>

          {guarantors.length > 0 && (
            <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
              {guarantors.map((g) => (
                <View key={g.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.successSoft as string, borderWidth: 1, borderColor: colors.success + "40", borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
                  <Text style={[typography.bodyMedium, { color: colors.success }]}>{g.fullName}</Text>
                  <TouchableOpacity onPress={() => toggleGuarantor(g)} accessibilityRole="button" accessibilityLabel={`Remove ${g.fullName}`} hitSlop={8}>
                    <Text style={[typography.bodyMedium, { color: colors.error }]}>{t("common.remove")}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Button
            title={guarantors.length === 2 ? t("apply.changeGuarantors") : t("apply.selectGuarantors")}
            variant="outline"
            onPress={() => setShowPicker(true)}
          />
        </>
      )}

      {stepIdx === 4 && (
        <>
          <Text style={[typography.h3, { color: colors.text }]}>{t("apply.reviewTitle")}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }]}>
            {t("apply.reviewSub")}
          </Text>

          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl }}>
            <ReviewRow label={t("apply.reviewAmount")} value={formatCurrency(numAmount)} />
            <ReviewRow label={t("apply.reviewPurpose")} value={purpose.trim()} />
            <ReviewRow label={t("apply.reviewTerm")} value={`${numTerm} months`} />
            <ReviewRow label={t("apply.reviewMonthly")} value={`~${formatCurrency(Math.round(monthlyEstimate))}`} />
            <ReviewRow label={t("apply.reviewInterest")} value={`${interestRate}% p.a.`} />
            <ReviewRow label={t("apply.reviewGuarantors")} value={guarantors.map((g) => g.fullName.split(" ")[0]).join(", ")} />
            <ReviewRow label={t("apply.reviewMax")} value={formatCurrency(maxAmount)} last />
          </View>
        </>
      )}

      {renderBackForward(stepIdx === STEPS.length - 1 ? t("apply.submit") : undefined)}

      {/* Guarantor Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, minHeight: "60%", maxHeight: "90%", paddingTop: spacing.lg }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
            <Text style={[typography.h3, { color: colors.text }]}>{t("apply.selectGuarantorModal")}</Text>
            <Button title={t("apply.done")} onPress={() => setShowPicker(false)} style={{ minWidth: 70 }} />
          </View>
            <Divider />
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}
              initialNumToRender={12}
              maxToRenderPerBatch={10}
              windowSize={7}
              updateCellsBatchingPeriod={40}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = !!guarantors.find((g) => g.id === item.id);
                return (
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}
                    onPress={() => toggleGuarantor(item)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                  >
                    <Avatar name={item.fullName} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.fullName}</Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>{item.user.phoneNumber}</Text>
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

function ReviewRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.lg, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.border }}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}
