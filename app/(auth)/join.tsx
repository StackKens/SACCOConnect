import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useCountry } from "@/hooks/useCountry";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { OtpVerification } from "@/components/features/OtpVerification";
import { useAuthStore } from "@/store/auth.store";
import { InviteCode } from "@/types";
import { Building2 } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";

type Step = "code" | "confirm" | "otp" | "details" | "pin" | "welcome";

export default function Join() {
  const { colors } = useTheme();
  const { country } = useCountry();
  const { t } = useTranslation("auth");
  const { lookupInviteCode, joinSACCO } = useAuthStore();

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [invite, setInvite] = useState<InviteCode | null>(null);
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const result = await lookupInviteCode(code);
      setInvite(result);
      setStep("confirm");
    } catch (e: any) {
      Alert.alert(t("join.invalidCode"), e?.message || t("join.codeNotFound"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (pin.length < 4)
      return Alert.alert(t("pinTooShort"), t("pinTooShortMessage"));
    if (pin !== confirmPin)
      return Alert.alert(t("pinMismatch"), t("pinMismatchMessage"));
    setLoading(true);
    try {
      await joinSACCO({ code, name, nationalId, phone, pin });
      setStep("welcome");
    } catch (e: any) {
      Alert.alert(t("join.errorTitle"), e?.message || t("join.couldNotJoin"));
    } finally {
      setLoading(false);
    }
  };

  if (step === "welcome" && invite) {
    return (
      <ScreenWrapper>
        <View style={styles.welcome}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            {t("join.welcome")}
          </Text>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
            {t("join.welcomeSub", { saccoName: invite.saccoName })}
          </Text>
          <Button
            title={t("join.goToDashboard")}
            onPress={() => router.replace("/(member)")}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      header={
        <PageHeader
          title={t("entry.joinSacco")}
          showBack
          onBack={() => router.push("/(auth)/entry")}
        />
      }
    >
      {step === "code" && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("join.enterCode")}
          </Text>
          <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
            {t("join.enterCodeSub")}
          </Text>
          <Input
            label={t("join.inviteCodeLabel")}
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder={t("join.inviteCodeExample")}
            autoCapitalize="characters"
            style={styles.codeInput}
          />
          <Button
            title={t("join.verifyCode")}
            onPress={handleLookup}
            loading={loading}
          />
        </View>
      )}

      {step === "confirm" && invite && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("join.joining")}
          </Text>
          <Card
            style={[styles.saccoCard, { borderColor: colors.primary + "40" }]}
          >
            <View style={styles.saccoRow}>
              <View
                style={[
                  styles.saccoIcon,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Building2 size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.saccoName, { color: colors.text }]}>
                  {invite.saccoName}
                </Text>
                <Text
                  style={[styles.saccoSub, { color: colors.textSecondary }]}
                >
                  Monthly: {formatCurrency(invite.contributionAmount ?? 0)}
                </Text>
                <Text
                  style={[styles.saccoSub, { color: colors.textSecondary }]}
                >
                  Admin: {invite.adminName ?? "SACCO Admin"}
                </Text>
              </View>
            </View>
          </Card>
          <Button title={t("join.looksGood")} onPress={() => setStep("otp")} />
          <Button
            title={t("join.wrongSacco")}
            onPress={() => setStep("code")}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      {step === "otp" && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("join.verifyPhone")}
          </Text>
          <OtpVerification
            phone={phone}
            onPhoneChange={setPhone}
            onVerified={() => setStep("details")}
            country={country}
          />
        </View>
      )}

      {step === "details" && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("join.detailsTitle")}
          </Text>
          <Input
            label={t("join.fullNameLabel")}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input
            label={t("join.nationalIdLabel")}
            value={nationalId}
            onChangeText={setNationalId}
            autoCapitalize="characters"
          />
          <Button
            title={t("join.continue")}
            onPress={() => {
              if (!name.trim())
                return Alert.alert(t("join.requiredName"), t("join.enterFullName"));
              setStep("pin");
            }}
            style={{ marginTop: 8 }}
          />
        </View>
      )}

      {step === "pin" && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("join.pinTitle")}
          </Text>
          <Input
            label={t("join.pinLabel")}
            value={pin}
            onChangeText={(v) => {
              if (v.length <= 4) setPin(v);
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          <Input
            label={t("join.confirmPinLabel")}
            value={confirmPin}
            onChangeText={(v) => {
              if (v.length <= 4) setConfirmPin(v);
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          <Button
            title={t("join.joinSacco")}
            onPress={handleJoin}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  stepContainer: { paddingTop: 8 },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  stepSub: { fontSize: 13, lineHeight: 19, marginBottom: 24 },
  codeInput: {
    letterSpacing: 4,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  saccoCard: { marginBottom: 24, borderWidth: 1 },
  saccoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  saccoIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saccoName: { fontSize: 17, fontWeight: "700" },
  saccoSub: { fontSize: 12, marginTop: 2 },
  welcome: { flex: 1, justifyContent: "center", paddingHorizontal: 8 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeSub: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
});
