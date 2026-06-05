import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/hooks/useTheme";
import { formatDate } from "@/utils/date";

const mockAnnouncements = [
  {
    id: "1",
    title: "AGM Notice",
    content: "Annual General Meeting on June 30th",
    date: "2025-06-01",
    author: "Admin",
  },
  {
    id: "2",
    title: "Dividend Payout",
    content: "Dividends will be credited by June 15th",
    date: "2025-05-28",
    author: "Admin",
  },
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
    // API call to post announcement
    Alert.alert("Success", "Announcement posted");
    setTitle("");
    setContent("");
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={[styles.announceTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.content, { color: colors.textSecondary }]}>
        {item.content}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(item.date)}
        </Text>
        <Text style={[styles.author, { color: colors.primary }]}>
          by {item.author}
        </Text>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      <Card style={styles.formCard}>
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Announcement title"
        />
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
        Recent Announcements
      </Text>
      <FlatList
        data={mockAnnouncements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  formCard: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  announceTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  content: { fontSize: 14, marginBottom: 8 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  date: { fontSize: 12 },
  author: { fontSize: 12, fontWeight: "500" },
});
