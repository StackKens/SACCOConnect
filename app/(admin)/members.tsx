import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  FlatList,
} from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { MemberRow } from "@/components/features/MemberRow";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { UserPlus, Search } from "lucide-react-native";
import { normalizeUgandaPhone } from "@/utils/phone";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useAuthStore } from "@/store/auth.store";
import { SkeletonMemberList } from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";

interface MemberRow {
  id: string;
  fullName: string;
  currentBalance: number;
  status: string;
  user: { phoneNumber: string };
}

export default function Members() {
  const { t } = useTranslation("admin");
  const { colors } = useTheme();
  const sacco = useAuthStore((state) => state.sacco);
  const me = useAuthStore((state) => state.user);
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
    const normalizedPhone = normalizeUgandaPhone(invitePhone);
    if (normalizedPhone.length < 10) {
      Alert.alert(t("members.required"), t("members.invalidPhone"));
      return;
    }
    setInviteLoading(true);
    try {
      const res = await api.post("/api/members/invite/send", { phoneNumber: normalizedPhone });
      setInviteCode(res.data.data.inviteCode);
    } catch (e: any) {
      Alert.alert(t("members.error"), e?.response?.data?.message || t("members.couldNotSendInvite"));
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
    <ScreenWrapper scroll={false} header={
      <PageHeader
        title={t("members")}
        rightComponent={
          <TouchableOpacity
            style={[styles.inviteBtn, { backgroundColor: colors.secondary }]}
            onPress={() => setShowModal(true)}
            accessibilityRole="button"
            accessibilityLabel={t("members.inviteMember")}
          >
            <UserPlus size={16} color="#fff" />
            <Text style={styles.inviteBtnText}>{t("members.invite")}</Text>
          </TouchableOpacity>
        }
      />
    }>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t("members.searchPlaceholder")}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberRow
            member={item}
            isYou={item.user.phoneNumber === me?.phone}
            onPress={() => router.push(`/(admin)/member-detail?id=${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        style={styles.flatList}
        refreshing={loading}
        onRefresh={refresh}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          loading ? (
            <SkeletonMemberList />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : (
            <EmptyState
              title={members.length === 0 ? t("members.noMembers") : t("members.noResults")}
              description={
                members.length === 0
                  ? t("members.noMembersDesc")
                  : t("members.noResultsDesc")
              }
              icon={<UserPlus size={32} color={colors.textSecondary} />}
            />
          )
        }
      />

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <Card style={[styles.modalCard, { backgroundColor: colors.card }]}>
            {!inviteCode ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t("members.inviteModalTitle")}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {t("members.inviteModalSubtitle")}
                </Text>
                <Divider style={{ marginVertical: 16 }} />
                <Input
                  label={t("members.phoneLabel")}
                  value={invitePhone}
                  onChangeText={setInvitePhone}
                  placeholder={t("members.phonePlaceholder")}
                  keyboardType="phone-pad"
                />
                <View style={styles.modalActions}>
                  <Button title={t("common.cancel")} onPress={closeModal} variant="outline" style={styles.modalBtn} />
                  <Button title={t("members.sendInvite")} onPress={handleInvite} loading={inviteLoading} style={styles.modalBtn} />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t("members.inviteCodeReady")}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {t("members.shareCode")}{" "}
                  <Text style={{ fontWeight: "700" }}>{sacco?.name ?? t("members.yourSacco")}</Text>.
                </Text>
                <Divider style={{ marginVertical: 16 }} />
                <View style={[styles.codeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.codeText, { color: colors.primary }]}>{inviteCode}</Text>
                </View>
                <Text style={[styles.codeNote, { color: colors.textSecondary }]}>
                  {t("members.smsNote", { saccoName: sacco?.name ?? t("members.yourSacco"), code: inviteCode })}
                </Text>
                <Button title={t("done")} onPress={closeModal} style={{ marginTop: 16 }} />
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
  flatList: { flex: 1 },
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
