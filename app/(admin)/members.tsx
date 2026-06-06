import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { ChevronRight, UserPlus, Search, Copy } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "auth" });

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const mockMembers = [
  { id: "1", name: "Alice Wanjiku", phone: "0712345678", savings: 25000, loans: 12000, status: "active" },
  { id: "2", name: "Bob Omondi", phone: "0756789012", savings: 18000, loans: 0, status: "active" },
  { id: "3", name: "Catherine Muthoni", phone: "0789012345", savings: 32000, loans: 5000, status: "inactive" },
];

export default function Members() {
  const { colors } = useTheme();
  const { sacco } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = mockMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.phone.includes(query),
  );

  const handleInvite = () => {
    if (invitePhone.trim().length < 10) {
      Alert.alert("Required", "Enter a valid phone number.");
      return;
    }
    const code = generateCode();
    const invite = {
      code,
      saccoId: sacco?.id ?? "sacco_demo",
      saccoName: sacco?.name ?? "UgandaSavings SACCO",
      phone: invitePhone.trim(),
    };
    storage.set(`invite_${code}`, JSON.stringify(invite));
    setInviteCode(code);
  };

  const closeModal = () => {
    setShowModal(false);
    setInvitePhone("");
    setInviteCode(null);
  };

  return (
    <ScreenWrapper header={
      <PageHeader
        title="Members"
        rightComponent={
          <TouchableOpacity
            style={[styles.inviteBtn, { backgroundColor: colors.secondary }]}
            onPress={() => setShowModal(true)}
          >
            <UserPlus size={16} color="#fff" />
            <Text style={styles.inviteBtnText}>Invite</Text>
          </TouchableOpacity>
        }
      />
    }>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or phone..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No members found</Text>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => router.push(`/(admin)/member-detail?id=${item.id}`)}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <Avatar name={item.name} size={48} />
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.phone, { color: colors.textSecondary }]}>{item.phone}</Text>
                    <Text style={[styles.savings, { color: colors.success }]}>
                      {formatCurrency(item.savings)} saved
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.status, { color: item.status === "active" ? colors.success : colors.textSecondary }]}>
                      {item.status}
                    </Text>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <Card style={[styles.modalCard, { backgroundColor: colors.card }]}>
            {!inviteCode ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Member</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Enter their phone number. An invite code will be generated — share it with them via SMS or WhatsApp.
                </Text>
                <Divider style={{ marginVertical: 16 }} />
                <Input
                  label="Phone Number"
                  value={invitePhone}
                  onChangeText={setInvitePhone}
                  placeholder="e.g. 0712345678"
                  keyboardType="phone-pad"
                />
                <View style={styles.modalActions}>
                  <Button title="Cancel" onPress={closeModal} variant="outline" style={styles.modalBtn} />
                  <Button title="Generate Code" onPress={handleInvite} style={styles.modalBtn} />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Code Ready</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Share this code with the member. They'll enter it in the app to join{" "}
                  <Text style={{ fontWeight: "700" }}>{sacco?.name ?? "your SACCO"}</Text>.
                </Text>
                <Divider style={{ marginVertical: 16 }} />
                <View style={[styles.codeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.codeText, { color: colors.primary }]}>{inviteCode}</Text>
                </View>
                <Text style={[styles.codeNote, { color: colors.textSecondary }]}>
                  SMS: "Join {sacco?.name ?? "our SACCO"}. Code: {inviteCode}. Download SACCOConnect to get started."
                </Text>
                <Button title="Done" onPress={closeModal} style={{ marginTop: 16 }} />
              </>
            )}
          </Card>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14 },
  emptyText: { textAlign: "center", fontSize: 14, marginTop: 32 },
  inviteBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  inviteBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 12 },
  right: { alignItems: "flex-end", gap: 4 },
  name: { fontSize: 15, fontWeight: "600" },
  phone: { fontSize: 13, marginTop: 2 },
  savings: { fontSize: 12, marginTop: 4 },
  status: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalCard: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  modalSubtitle: { fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1 },
  codeBox: { borderWidth: 1, borderRadius: 10, padding: 20, alignItems: "center", marginVertical: 8 },
  codeText: { fontSize: 32, fontWeight: "800", letterSpacing: 4 },
  codeNote: { fontSize: 12, lineHeight: 18, marginTop: 8 },
});
