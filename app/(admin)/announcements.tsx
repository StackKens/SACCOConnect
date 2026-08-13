import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { formatDate } from "@/utils/date";
import { Trash2 } from "lucide-react-native";
import { api } from "@/services/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import { getApiErrorMessage } from "@/services/auth.service";
import { SkeletonMemberList } from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/announcements");
    setAnnouncements(res.data.data);
  });
  const { colors } = useTheme();
  const { t } = useTranslation("admin");
  const user = useAuthStore((s) => s.user);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(t("announcements.required"), t("announcements.fillBoth"));
      return;
    }
    setPosting(true);
    try {
      await api.post("/api/announcements", {
        title: title.trim(),
        message: content.trim(),
        author: user?.name ?? "Admin",
      });
      setTitle("");
      setContent("");
      refresh();
    } catch (e) {
      Alert.alert(t("announcements.error"), getApiErrorMessage(e));
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (id: string, announcementTitle: string) => {
    Alert.alert(t("announcements.deleteTitle"), t("announcements.deletePrompt", { title: announcementTitle }), [
      { text: t("common:cancel"), style: "cancel" },
      {
        text: t("common:delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/announcements/${id}`);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
          } catch (e) {
            Alert.alert(t("announcements.error"), getApiErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper scroll refreshing={loading} onRefresh={refresh} header={<PageHeader title={t("announcements")} subtitle={t("announcements.subtitle")} />}>

      <Card style={styles.formCard}>
        <Input label={t("announcements.titleLabel")} value={title} onChangeText={setTitle} placeholder={t("announcements.titlePlaceholder")} />
        <Input
          label={t("announcements.contentLabel")}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          placeholder={t("announcements.contentPlaceholder")}
          style={styles.contentArea}
        />
        <Button title={t("announcements.post")} onPress={handlePost} loading={posting} />
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("announcements.posted", { count: announcements.length })}</Text>

      {error ? <ErrorState message={error} onRetry={refresh} /> : loading ? <SkeletonMemberList /> : (
        <View style={styles.list}>
          {announcements.length === 0 ? (
            <EmptyState title={t("announcements.none")} />
          ) : announcements.map((item) => (
            <View key={item.id} style={[styles.announceCard, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.announceTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("announcements.deleteLabel", { title: item.title })}>
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.announceContent, { color: colors.textSecondary }]}>{item.content}</Text>
              <Divider style={styles.divider} />
              <View style={styles.footer}>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatDate(item.createdAt)}</Text>
                <Text style={[styles.meta, { color: colors.secondary }]}>{t("announcements.by", { author: item.author })}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  formCard: { marginBottom: 24 },
  contentArea: { minHeight: 150, textAlignVertical: "top", paddingTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  list: { paddingBottom: 20 },
  announceCard: { marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  announceTitle: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  announceContent: { fontSize: 14, lineHeight: 20 },
  divider: { marginVertical: 10 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 12 },
});
