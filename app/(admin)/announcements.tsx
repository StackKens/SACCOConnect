import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { useAnnouncementStore } from "@/store/announcement.store";
import { formatDate } from "@/utils/date";
import { Trash2 } from "lucide-react-native";

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { announcements, post, remove } = useAnnouncementStore();

  const handlePost = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Required", "Please fill in both title and content.");
      return;
    }
    post(title.trim(), content.trim(), user?.name ?? "Admin");
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: string, announcementTitle: string) => {
    Alert.alert("Delete Announcement", `Remove "${announcementTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove(id) },
    ]);
  };

  return (
    <ScreenWrapper header={<PageHeader title="Announcements" subtitle="Compose and manage member announcements" />}>

      <Card style={styles.formCard}>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Announcement title" />
        <Input
          label="Content"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          placeholder="Details..."
        />
        <Button title="Post Announcement" onPress={handlePost} />
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Posted ({announcements.length})
      </Text>

      <View style={styles.list}>
        {announcements.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.announceTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.title)}
                hitSlop={8}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.announceContent, { color: colors.textSecondary }]}>
              {item.content}
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.footer}>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
              <Text style={[styles.meta, { color: colors.secondary }]}>by {item.author}</Text>
            </View>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  formCard: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  announceTitle: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  announceContent: { fontSize: 14, lineHeight: 20 },
  divider: { marginVertical: 10 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 12 },
});
