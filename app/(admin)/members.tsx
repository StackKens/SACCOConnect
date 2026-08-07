import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { ChevronRight, UserPlus, Search } from "lucide-react-native";
import { formatCurrency } from "@/utils/currency";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useAuthStore } from "@/store/auth.store";
import { SkeletonMemberList } from "@/components/ui/Skeleton";

interface MemberRow {
  id: string;
  fullName: string;
  currentBalance: number;
  status: string;
  user: { phoneNumber: string };
}

export default function Members() {
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const [showModal, setShowModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/members");
    setMembers(res.data.data);
  });

  const filtered = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(query.toLowerCase()) ||
      m.user.phoneNumber.includes(query),
  );

  const handleInvite = async () => {
    if (invitePhone.trim().length < 10) {
      Alert.alert("Required", "Enter a valid phone number.");
      return;
    }
    setInviteLoading(true);
    try {
      const res = await api.post("/api/members/invite/send", { phoneNumber: invitePhone.trim() });
      setInviteCode(res.data.data.inviteCode);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Could not send invite SMS.");
    } finally {
      setInviteLoading(false);
    }
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
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonMemberList />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={members.length === 0 ? "No members yet" : "No results found"}
            description={
              members.length === 0
                ? "Invite someone to get started."
                : "Try a different name or phone number."
            }
            icon={<UserPlus size={32} color={colors.textSecondary} />}
          />
        ) : (
          filtered.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => router.push(`/(admin)/member-detail?id=${item.id}`)}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <Avatar name={item.fullName} size={48} />
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.fullName}</Text>
                    <Text style={[styles.phone, { color: colors.textSecondary }]}>{item.user.phoneNumber}</Text>
                    <Text style={[styles.savings, { color: colors.success }]}>
                      {formatCurrency(item.currentBalance)} saved
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.status, { color: item.status === "ACTIVE" ? colors.success : colors.textSecondary }]}>
                      {item.status.toLowerCase()}
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
                  <Button title="Send Invite" onPress={handleInvite} loading={inviteLoading} style={styles.modalBtn} />
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
