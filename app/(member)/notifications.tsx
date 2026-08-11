import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { BellOff } from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { getReadIds } from "@/store/notification.store";
import { useState, useCallback, useEffect } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationRow } from "@/components/features/NotificationRow";

export default function Notifications() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "guest";
  const { items, loading, error, refresh, markRead, markAllRead } = useNotificationStore();
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadIds(userId));

  useEffect(() => {
    if (!useNotificationStore.getState().hydrated) {
      useNotificationStore.getState().refresh();
    }
  }, []);

  const handleRead = useCallback(
    (id: string) => {
      markRead(id);
      setReadIds((prev) => new Set([...prev, id]));
    },
    [markRead],
  );

  const handleMarkAll = useCallback(() => {
    markAllRead();
    setReadIds(new Set(items.map((n) => n.id)));
  }, [markAllRead, items]);

  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  return (
    <ScreenWrapper
      scroll={false}
      header={
        <PageHeader
          title="Notifications"
          showBack
          onBack={() => router.back()}
          rightComponent={
            unreadCount > 0 ? (
              <TouchableOpacity onPress={handleMarkAll} accessibilityRole="button" accessibilityLabel="Mark all notifications as read">
                <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
      }
    >
      <View style={{ flex: 1 }}>
        {error ? (
          <TouchableOpacity
            style={[styles.errorBanner, { backgroundColor: colors.error + "12" }]}
            onPress={refresh}
            accessibilityRole="button"
            accessibilityLabel="Retry loading announcements"
          >
            <Text style={[styles.errorText, { color: colors.error }]}>
              Couldn't load announcements. Tap to retry.
            </Text>
          </TouchableOpacity>
        ) : null}
        {items.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Contribution, loan, and announcement updates will appear here."
            icon={<BellOff size={32} color={colors.textSecondary} />}
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={refresh}
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews
            renderItem={({ item }) => (
              <NotificationRow
                item={item}
                isRead={readIds.has(item.id)}
                onRead={handleRead}
              />
            )}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 12, paddingBottom: 24 },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  errorText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  markAll: { fontSize: 12, fontWeight: "600" },
});
