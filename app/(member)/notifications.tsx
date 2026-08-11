import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { BellOff } from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { useMemberDataStore } from "@/store/member.store";
import { useState, useMemo, useCallback } from "react";
import { api } from "@/services/api";
import { getSecureStorage } from "@/services/secureStorage";
import { useApiFetch } from "@/hooks/useApiFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationRow, NotifItem } from "@/components/features/NotificationRow";

const readStorage = getSecureStorage("read_notifications");

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

function loanNotifications(loans: ReturnType<typeof useMemberDataStore.getState>["loans"]): NotifItem[] {
  return loans.flatMap((l) => {
    const items: NotifItem[] = [
      {
        id: `loan_applied_${l.id}`,
        type: "loan_applied",
        title: "Loan Application Submitted",
        message: `Your application for UGX ${l.amount.toLocaleString()} (${l.purpose}) is under review.`,
        date: l.dueDate ?? new Date().toISOString(),
      },
    ];
    if (l.status === "active") {
      items.push({
        id: `loan_approved_${l.id}`,
        type: "loan_approved",
        title: "Loan Approved",
        message: `Your loan of UGX ${l.amount.toLocaleString()} has been approved. Due: ${l.dueDate ?? "TBD"}.`,
        date: l.dueDate ?? new Date().toISOString(),
      });
    }
    if (l.status === "rejected") {
      items.push({
        id: `loan_rejected_${l.id}`,
        type: "loan_rejected",
        title: "Loan Rejected",
        message: l.rejectNote ? `Your loan was rejected: ${l.rejectNote}` : "Your loan application was not approved.",
        date: new Date().toISOString(),
      });
    }
    return items;
  });
}

export default function Notifications() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "guest";
  const { contributions, loans, transactions } = useMemberDataStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadIds(userId));
  const { loading, error, refresh } = useApiFetch(async () => {
    const res = await api.get("/api/announcements");
    setAnnouncements(res.data.data);
  });

  const items = useMemo<NotifItem[]>(() => {
    const announcementItems: NotifItem[] = announcements.map((a) => ({
      id: `ann_${a.id}`,
      type: "announcement",
      title: a.title,
      message: a.content,
      date: a.createdAt,
    }));

    const contributionItems: NotifItem[] = contributions.map((c) => ({
      id: `contrib_${c.id}`,
      type: "contribution",
      title: "Contribution Recorded",
      message: `UGX ${c.amount.toLocaleString()} via ${c.method} has been recorded.`,
      date: c.date,
    }));

    const repaymentItems: NotifItem[] = transactions
      .filter((t) => t.type === "loan_repayment")
      .map((t) => ({
        id: `repay_${t.id}`,
        type: "loan_repayment",
        title: "Loan Repayment Made",
        message: `UGX ${Math.abs(t.amount).toLocaleString()} repayment recorded (ref: ${t.reference}).`,
        date: t.date,
      }));

    const loanItems = loanNotifications(loans);

    return [...announcementItems, ...contributionItems, ...repaymentItems, ...loanItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [announcements, contributions, loans, transactions]);

  const markAsRead = useCallback(
    (id: string) => {
      markReadInStorage(userId, id);
      setReadIds((prev) => new Set([...prev, id]));
    },
    [userId],
  );

  const markAllRead = useCallback(() => {
    items.forEach((n) => markReadInStorage(userId, n.id));
    setReadIds(new Set(items.map((n) => n.id)));
  }, [items, userId]);

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
              <TouchableOpacity onPress={markAllRead}>
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
                onRead={markAsRead}
              />
            )}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
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
