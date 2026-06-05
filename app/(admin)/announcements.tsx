import { View, Text, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { useTheme } from "@/hooks/useTheme";
import { formatDate } from "@/utils/date";

const mockAnnouncements = [
  { id: "1", title: "AGM Notice", content: "Annual General Meeting on June 30th", date: "2025-06-01", author: "Admin" },
  { id: "2", title: "Dividend Payout", content: "Dividends will be credited by June 15th", date: "2025-05-28", author: "Admin" },
];

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { colors } = useTheme();

  const handlePost = () => {
    if (!title || !content) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    Alert.alert("Success", "Announcement posted");
    setTitle("");
    setContent("");
  };

  return (
    <ScreenWrapper>
      <PageHeader title="Announcements" subtitle="Compose and manage member announcements" />

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

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Announcements</Text>

      <View style={styles.list}>
        {mockAnnouncements.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Text style={[styles.announceTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.announceContent, { color: colors.textSecondary }]}>{item.content}</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  announceTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  announceContent: { fontSize: 14, lineHeight: 20 },
  divider: { marginVertical: 10 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 12 },
});
