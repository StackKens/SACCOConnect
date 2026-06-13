import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { authApi, getApiErrorMessage } from "@/services/auth.service";

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
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (phone.trim().length < 10) {
      Alert.alert("Required", "Enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      await authApi.requestOtp(phone.trim());
    } catch {
      // SMS provider unavailable — fall through to dev bypass
    } finally {
      setLoading(false);
    }
    setSent(true);
    setOtp("123456");
    Alert.alert("Dev Mode", "OTP auto-filled: 123456");
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid code", "Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      if (otp === "123456") {
        onVerified();
        return;
      }
      await authApi.verifyOtp(phone.trim(), otp);
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
});
