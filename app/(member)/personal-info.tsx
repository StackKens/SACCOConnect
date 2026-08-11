import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/services/auth.service";

export default function PersonalInfo() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [name, setName] = useState(user?.name ?? "");
  const [nationalId, setNationalId] = useState(user?.nationalId ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/api/members/me")
      .then((res) => {
        const member = res.data?.data;
        if (member) {
          setName(member.fullName ?? user?.name ?? "");
          setNationalId(member.nationalId ?? "");
          setPhone(member.user?.phoneNumber ?? member.phoneNumber ?? user?.phone ?? "");
        }
      })
      .catch(() => {
        // fall back to cached session values
      });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("Please enter your full name.");
      return;
    }
    setLoading(true);
    try {
      await api.put("/api/members/me", {
        fullName: name.trim(),
        nationalId: nationalId.trim() || undefined,
      });
      updateProfile({ name, nationalId });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      Alert.alert("Update failed", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      header={<PageHeader title="Personal Information" subtitle="View and edit your details" showBack />}
    >
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your details</Text>
        <Input
          label="Full Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setNameError(undefined);
          }}
          placeholder="e.g. John Doe"
          autoCapitalize="words"
          error={nameError}
        />
        <Input
          label="National ID"
          value={nationalId}
          onChangeText={setNationalId}
          placeholder="Optional"
          autoCapitalize="characters"
        />
        <Input label="Phone Number" value={phone} editable={false} />
        {saved && (
          <Text style={[styles.savedNote, { color: colors.secondary }]}>
            Your changes have been saved.
          </Text>
        )}
        <Button title="Save Changes" onPress={handleSave} loading={loading} disabled={loading} />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  savedNote: { fontSize: 13, marginBottom: 12 },
});
