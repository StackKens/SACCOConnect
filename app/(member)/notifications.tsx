import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { getRelativeTime } from "@/utils/date";
import { Info, BellOff } from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "@/services/api";
import { createMMKV } from "react-native-mmkv";

const readStorage = createMMKV({ id: "read_announcements" });

function getReadIds(userId: string): Set<string> {
  const stored = readStorage.getString(`read_${userId}`);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function markReadInStorage(userId: string, id: string) {
  const ids = getReadIds(userId);
  ids.add(id);
  readStorage.set(`read_${userId}`, JSON.stringify([...ids]));
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function Notifications() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "guest";
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadIds(userId));

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api.get("/api/announcements")
        .then((res) => { if (active) setAnnouncements(res.data.data); })
        .catch(() => {});
      return () => { active = false; };
    }, []),
  );

  const markAsRead = (id: string) => {
    markReadInStorage(userId, id);
    setReadIds((prev) => new Set([...prev, id]));
  };

  const markAllRead = () => {
    announcements.forEach((a) => markReadInStorage(userId, a.id));
    setReadIds(new Set(announcements.map((a) => a.id)));
  };

  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length;

  return (
    <ScreenWrapper
      scroll={false}
      header={
        <PageHeader
          title="Notifications"
          rightComponent={
            unreadCount > 0 ? (
              <TouchableOpacity onPress={markAllRead}>
                <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
      }
    >
      <View style={{ flex: 1 }}>
        {announcements.length === 0 ? (
          <View style={styles.empty}>
            <BellOff size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
          </View>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isRead = readIds.has(item.id);
              return (
                <TouchableOpacity onPress={() => markAsRead(item.id)} activeOpacity={0.7}>
                  <Card style={[styles.card, !isRead && { backgroundColor: colors.primary + "08" }]}>
                    <View style={styles.row}>
                      <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
                        <Info size={18} color={colors.primary} />
                      </View>
                      <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }, !isRead && { fontWeight: "700" }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                          {item.content}
                        </Text>
                        <Text style={[styles.date, { color: colors.textSecondary }]}>
                          {getRelativeTime(item.createdAt)} · by {item.author}
                        </Text>
                      </View>
                      {!isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  date: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
  markAll: { fontSize: 12, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText: { fontSize: 14 },
});
