import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextArea } from "@/components/ui/TextArea";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { OtpVerification } from "@/components/features/OtpVerification";
import { useAuthStore } from "@/store/auth.store";
import { normalizeUgandaPhone } from "@/utils/phone";
import { PRESET_RULES } from "@/constants/rules";

type Step = "phone" | "otp" | "personal" | "sacco" | "review";

export default function RegisterAdmin() {
  const { colors } = useTheme();
  const registerAdmin = useAuthStore((s) => s.registerAdmin);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saccoName, setSaccoName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [contribution, setContribution] = useState("");
  const [maxLoanMultiplier, setMaxLoanMultiplier] = useState("3");
  const [interestRate, setInterestRate] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("12");
  const [meetingDay, setMeetingDay] = useState("");
  const [rulesText, setRulesText] = useState(PRESET_RULES.join("\n"));
  const [loading, setLoading] = useState(false);

  const handlePersonalNext = () => {
    if (!fullName.trim()) return Alert.alert("Required", "Enter your full name.");
    if (pin.length < 4) return Alert.alert("PIN too short", "PIN must be 4 digits.");
    if (pin !== confirmPin) return Alert.alert("PIN mismatch", "PINs do not match.");
    setStep("sacco");
  };

  const handleSaccoNext = () => {
    if (!saccoName.trim()) return Alert.alert("Required", "Enter a SACCO name.");
    if (!contribution || Number.isNaN(Number(contribution))) {
      return Alert.alert("Required", "Enter a valid monthly contribution.");
    }
    if (!interestRate || Number.isNaN(Number(interestRate))) {
      return Alert.alert("Required", "Enter a valid interest rate.");
    }
    setStep("review");
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await registerAdmin({
        phone: normalizeUgandaPhone(phone),
        fullName: fullName.trim(),
        nationalId: nationalId.trim() || undefined,
        pin,
        saccoName: saccoName.trim(),
        registrationNo: registrationNo.trim() || undefined,
        contributionAmount: Number(contribution),
        maxLoanMultiplier: Number(maxLoanMultiplier) || 3,
        interestRate: Number(interestRate),
        loanTermMonths: Number(loanTermMonths) || 12,
        meetingDay: meetingDay.trim() || undefined,
        rulesText: rulesText.trim() || undefined,
      });
      router.replace("/(admin)");
    } catch (e: any) {
      Alert.alert("Registration failed", e?.message || "Could not create SACCO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      scroll
      header={
        <PageHeader
          title="Create a SACCO"
          subtitle="Set up your group and admin account"
          showBack
          onBack={() => router.back()}
        />
      }
    >
      {step === "phone" && (
        <View style={styles.step}>
          <Text style={[styles.title, { color: colors.text }]}>Phone verification</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            We'll send a 6-digit code to verify your number.
          </Text>
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 0700123456"
          />
          <Button title="Continue" onPress={() => setStep("otp")} disabled={normalizeUgandaPhone(phone).length < 10} />
        </View>
      )}

      {step === "otp" && (
        <View style={styles.step}>
          <Text style={[styles.title, { color: colors.text }]}>Enter OTP</Text>
          <OtpVerification
            phone={phone}
            phoneEditable={false}
            onVerified={() => setStep("personal")}
          />
        </View>
      )}

      {step === "personal" && (
        <View style={styles.step}>
          <Text style={[styles.title, { color: colors.text }]}>Your details</Text>
          <Input label="Full Name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
          <Input label="National ID" value={nationalId} onChangeText={setNationalId} autoCapitalize="characters" />
          <Input
            label="4-Digit PIN"
            value={pin}
            onChangeText={(v) => { if (v.length <= 4) setPin(v); }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          <Input
            label="Confirm PIN"
            value={confirmPin}
            onChangeText={(v) => { if (v.length <= 4) setConfirmPin(v); }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          <Button title="Continue" onPress={handlePersonalNext} style={{ marginTop: 8 }} />
        </View>
      )}

      {step === "sacco" && (
        <View style={styles.step}>
          <Text style={[styles.title, { color: colors.text }]}>SACCO details</Text>
          <Input label="SACCO Name" value={saccoName} onChangeText={setSaccoName} autoCapitalize="words" />
          <Input label="Registration No. (optional)" value={registrationNo} onChangeText={setRegistrationNo} />
          <Input label="Monthly Contribution (UGX)" value={contribution} onChangeText={setContribution} keyboardType="numeric" />
          <Input label="Max Loan Limit (× savings)" value={maxLoanMultiplier} onChangeText={setMaxLoanMultiplier} keyboardType="numeric" />
          <Input label="Interest Rate (% p.a.)" value={interestRate} onChangeText={setInterestRate} keyboardType="numeric" />
          <Input label="Max Loan Term (months)" value={loanTermMonths} onChangeText={setLoanTermMonths} keyboardType="numeric" />
          <Input label="Meeting Day" value={meetingDay} onChangeText={setMeetingDay} placeholder="e.g. Every last Saturday" />
          <TextArea label="Group Rules" value={rulesText} onChangeText={setRulesText} />
          <Button title="Review" onPress={handleSaccoNext} style={{ marginTop: 8 }} />
        </View>
      )}

      {step === "review" && (
        <View style={styles.step}>
          <Text style={[styles.title, { color: colors.text }]}>Review & confirm</Text>
          <Card>
            <Text style={[styles.row, { color: colors.text }]}>Admin: {fullName}</Text>
            <Text style={[styles.row, { color: colors.textSecondary }]}>Phone: {phone}</Text>
            <Text style={[styles.row, { color: colors.text }]}>SACCO: {saccoName}</Text>
            <Text style={[styles.row, { color: colors.textSecondary }]}>
              UGX {Number(contribution).toLocaleString()} / month · {interestRate}% · {loanTermMonths} months max
            </Text>
            {meetingDay ? (
              <Text style={[styles.row, { color: colors.textSecondary }]}>Meeting: {meetingDay}</Text>
            ) : null}
          </Card>
          <Button title="Create SACCO" onPress={handleCreate} loading={loading} style={{ marginTop: 16 }} />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  step: { paddingTop: 8 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  sub: { fontSize: 13, lineHeight: 19, marginBottom: 20 },
  row: { fontSize: 14, marginBottom: 6 },
});
