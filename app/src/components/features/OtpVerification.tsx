import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/services/auth.service";
import { normalizeUgandaPhone } from "@/utils/phone";

interface OtpVerificationProps {
  phone: string;
  onPhoneChange?: (phone: string) => void;
  phoneEditable?: boolean;
  onVerified: () => void;
}

export function OtpVerification({
  phone,
  onPhoneChange,
  phoneEditable = true,
  onVerified,
}: OtpVerificationProps) {
  const { colors } = useTheme();
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devHint, setDevHint] = useState<string | null>(null);

  const handleSend = async () => {
    const normalized = normalizeUgandaPhone(phone);
    if (normalized.length < 10) {
      Alert.alert("Required", "Enter a valid phone number.");
      return;
    }
    setLoading(true);
    setDevHint(null);
    try {
      const devOtp = await requestOtp(normalized);
      setSent(true);
      setOtp("");
      if (__DEV__ && devOtp) {
        setDevHint(devOtp);
      }
      Alert.alert(
        "Code sent",
        __DEV__ && devOtp
          ? `Enter the 6-digit code sent to ${normalized}. Development code: ${devOtp}`
          : `Enter the 6-digit code sent to ${normalized}.`,
      );
    } catch (e) {
      Alert.alert("Could not send code", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid code", "Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp);
      onVerified();
    } catch (e) {
      Alert.alert("Verification failed", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {phoneEditable && onPhoneChange ? (
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
          placeholder="e.g. 0712345678"
        />
      ) : (
        <Text style={[styles.phoneLabel, { color: colors.textSecondary }]}>
          Verifying {phone}
        </Text>
      )}

      {!sent ? (
        <Button title="Send OTP" onPress={handleSend} loading={loading} />
      ) : (
        <>
          {__DEV__ && devHint ? (
            <Text style={[styles.devHint, { color: colors.textSecondary }]}>
              Development code: {devHint}
            </Text>
          ) : null}
          <Input
            label="6-Digit OTP"
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            placeholder="......"
            maxLength={6}
          />
          <Button
            title="Verify OTP"
            onPress={handleVerify}
            loading={loading}
            style={{ marginTop: 8 }}
          />
          <Button
            title="Resend OTP"
            onPress={handleSend}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  phoneLabel: { fontSize: 14, marginBottom: 16 },
  devHint: { fontSize: 12, marginBottom: 12, fontWeight: "600" },
});
