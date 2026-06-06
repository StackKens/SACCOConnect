import { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { useAuthStore } from "@/store/auth.store";
import { InviteCode } from "@/types";
import { CheckCircle, Building2 } from "lucide-react-native";

type Step = "code" | "confirm" | "details" | "pin";

export default function Join() {
  const { colors } = useTheme();
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
      Alert.alert("Invalid Code", e?.message || "Code not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsNext = () => {
    if (!name.trim()) return Alert.alert("Required", "Enter your full name.");
    if (!nationalId.trim()) return Alert.alert("Required", "Enter your National ID.");
    if (phone.trim().length < 10) return Alert.alert("Required", "Enter a valid phone number.");
    setStep("pin");
  };

  const handleJoin = async () => {
    if (pin.length < 4) return Alert.alert("PIN too short", "PIN must be 4 digits.");
    if (pin !== confirmPin) return Alert.alert("PIN mismatch", "PINs do not match.");
    setLoading(true);
    try {
      await joinSACCO({ code, name, nationalId, phone, pin });
      router.replace("/(auth)/group-rules");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not join SACCO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper header={<PageHeader title="Join a SACCO" showBack onBack={() => router.push("/(auth)/onboarding")} />}>

      {/* Step 1 — Enter invite code */}
      {step === "code" && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Enter your invite code</Text>
          <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
            Your SACCO admin sent this code via SMS when they invited you.
          </Text>
          <Input
            label="Invite Code"
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="e.g. ABC123"
            autoCapitalize="characters"
            style={styles.codeInput}
          />
          <Button title="Verify Code" onPress={handleLookup} loading={loading} />
        </View>
      )}

      {/* Step 2 — Confirm SACCO */}
      {step === "confirm" && invite && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>You've been invited to join</Text>
          <Card style={[styles.saccoCard, { borderColor: colors.primary + "40" }]}>
            <View style={styles.saccoRow}>
              <View style={[styles.saccoIcon, { backgroundColor: colors.primary + "15" }]}>
                <Building2 size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.saccoName, { color: colors.text }]}>{invite.saccoName}</Text>
                <Text style={[styles.saccoSub, { color: colors.textSecondary }]}>
                  Invite code: {invite.code}
                </Text>
              </View>
            </View>
          </Card>
          <Button title="Yes, Join This SACCO" onPress={() => setStep("details")} style={{ marginTop: 8 }} />
          <Button title="Wrong SACCO? Go Back" onPress={() => setStep("code")} variant="outline" style={{ marginTop: 12 }} />
        </View>
      )}

      {/* Step 3 — Personal details */}
      {step === "details" && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Your details</Text>
          <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
            This information will be visible to your SACCO admin.
          </Text>
          <Input label="Full Name" value={name} onChangeText={setName} placeholder="e.g. John Mukasa" autoCapitalize="words" />
          <Input label="National ID" value={nationalId} onChangeText={setNationalId} placeholder="e.g. CM90012345KBIU" autoCapitalize="characters" />
          <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="e.g. 0712345678" />
          <Button title="Continue" onPress={handleDetailsNext} style={{ marginTop: 8 }} />
        </View>
      )}

      {/* Step 4 — Create PIN */}
      {step === "pin" && (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Create your PIN</Text>
          <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
            You'll use this 4-digit PIN every time you log in.
          </Text>
          <Input
            label="4-Digit PIN"
            value={pin}
            onChangeText={(v) => { if (v.length <= 4) setPin(v); }}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="••••"
            maxLength={4}
          />
          <Input
            label="Confirm PIN"
            value={confirmPin}
            onChangeText={(v) => { if (v.length <= 4) setConfirmPin(v); }}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="••••"
            maxLength={4}
          />
          <Button title="Join SACCO" onPress={handleJoin} loading={loading} style={{ marginTop: 8 }} />
        </View>
      )}

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  stepContainer: { paddingTop: 8 },
  stepTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6, letterSpacing: -0.3 },
  stepSub: { fontSize: 13, lineHeight: 19, marginBottom: 24 },
  codeInput: { letterSpacing: 4, fontSize: 20, fontWeight: "700", textAlign: "center" },
  saccoCard: { marginBottom: 24, borderWidth: 1 },
  saccoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  saccoIcon: { width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  saccoName: { fontSize: 17, fontWeight: "700" },
  saccoSub: { fontSize: 12, marginTop: 2 },
});
