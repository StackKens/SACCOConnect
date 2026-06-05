import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { ChevronRight, UserPlus } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";

const mockMembers = [
  { id: "1", name: "Alice Wanjiku", email: "alice@example.com", savings: 25000, loans: 12000, status: "active" },
  { id: "2", name: "Bob Omondi", email: "bob@example.com", savings: 18000, loans: 0, status: "active" },
  { id: "3", name: "Catherine Muthoni", email: "catherine@example.com", savings: 32000, loans: 5000, status: "inactive" },
];

function generateInviteCode() {
  return "SACCO-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Members() {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleInvite = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      Alert.alert("Required", "Please enter a name and email address.");
      return;
    }
    const code = generateInviteCode();
    setInviteCode(code);
  };

  const closeModal = () => {
    setShowModal(false);
    setInviteName("");
    setInviteEmail("");
    setInviteCode(null);
  };

  const renderMember = ({ item }: { item: typeof mockMembers[0] }) => (
    <TouchableOpacity onPress={() => router.push(`/(admin)/member-detail?id=${item.id}`)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Avatar name={item.name} size={48} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
            <Text style={[styles.savings, { color: colors.success }]}>
              {formatCurrency(item.savings)} saved
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={[
              styles.status,
              { color: item.status === "active" ? colors.success : colors.textSecondary }
            ]}>
              {item.status}
            </Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <PageHeader title="Members" style={{ marginBottom: 0 }} />
        <TouchableOpacity
          style={[styles.inviteBtn, { backgroundColor: colors.secondary }]}
          onPress={() => setShowModal(true)}
        >
          <UserPlus size={16} color="#fff" />
          <Text style={styles.inviteBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <Card style={[styles.modalCard, { backgroundColor: colors.card }]}>
            {!inviteCode ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Invite New Member</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  An invite code will be generated. Share it with the member so they can register.
                </Text>
                <Divider style={{ marginVertical: 16 }} />
                <Input label="Full Name" value={inviteName} onChangeText={setInviteName} placeholder="e.g. John Mukasa" />
                <Input label="Email Address" value={inviteEmail} onChangeText={setInviteEmail} placeholder="e.g. john@example.com" keyboardType="email-address" autoCapitalize="none" />
                <View style={styles.modalActions}>
                  <Button title="Cancel" onPress={closeModal} variant="outline" style={styles.modalBtn} />
                  <Button title="Generate Code" onPress={handleInvite} style={styles.modalBtn} />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Code Generated</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Share this code with {inviteName}. They will use it during registration.
                </Text>
                <Divider style={{ marginVertical: 16 }} />
                <View style={[styles.codeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.codeText, { color: colors.primary }]}>{inviteCode}</Text>
                </View>
                <Text style={[styles.codeNote, { color: colors.textSecondary }]}>
                  Code expires in 48 hours. The member must register with the email: {inviteEmail}
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  inviteBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  inviteBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 12 },
  right: { alignItems: "flex-end", gap: 4 },
  name: { fontSize: 15, fontWeight: "600" },
  email: { fontSize: 13, marginTop: 2 },
  savings: { fontSize: 12, marginTop: 4 },
  status: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalCard: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  modalSubtitle: { fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1 },
  codeBox: { borderWidth: 1, borderRadius: 10, padding: 20, alignItems: "center", marginVertical: 8 },
  codeText: { fontSize: 28, fontWeight: "800", letterSpacing: 3 },
  codeNote: { fontSize: 12, lineHeight: 17, marginTop: 8 },
});
