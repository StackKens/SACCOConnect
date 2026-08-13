import { create } from "zustand";
import { useAuthStore } from "./auth.store";
import { useMemberDataStore } from "./member.store";
import { api } from "../services/api";
import { getCached, setCached } from "../services/cache";
import { getSecureStorage } from "../services/secureStorage";
import { formatCurrency } from "../utils/currency";
import type { NotifItem } from "../components/features/NotificationRow";
import i18n from "../localization/i18n";

const readStorage = getSecureStorage("read_notifications");
const ANNOUNCEMENTS_KEY = "/api/announcements";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export function getReadIds(userId: string): Set<string> {
  const stored = readStorage.getString(`read_${userId}`);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function persistReadIds(userId: string, ids: Set<string>) {
  readStorage.set(`read_${userId}`, JSON.stringify([...ids]));
}

function loanNotifications(
  loans: ReturnType<typeof useMemberDataStore.getState>["loans"],
): NotifItem[] {
  return loans.flatMap((l) => {
    const items: NotifItem[] = [
      {
        id: `loan_applied_${l.id}`,
        type: "loan_applied",
        title: i18n.t("notifications:loanApplied"),
        message: i18n.t("notifications:loanAppliedMsg", { amount: formatCurrency(l.amount), purpose: l.purpose }),
        date: l.dueDate ?? new Date().toISOString(),
      },
    ];
    if (l.status === "active") {
      items.push({
        id: `loan_approved_${l.id}`,
        type: "loan_approved",
        title: i18n.t("notifications:loanApproved"),
        message: i18n.t("notifications:loanApprovedMsg", { amount: formatCurrency(l.amount), date: l.dueDate ?? "TBD" }),
        date: l.dueDate ?? new Date().toISOString(),
      });
    }
    if (l.status === "rejected") {
      items.push({
        id: `loan_rejected_${l.id}`,
        type: "loan_rejected",
        title: i18n.t("notifications:loanRejected"),
        message: i18n.t("notifications:loanRejectedMsg", { note: l.rejectNote ? i18n.t("notifications:loanRejectedNote", { note: l.rejectNote }) : "" }),
        date: new Date().toISOString(),
      });
    }
    return items;
  });
}

export function buildNotifications(
  announcements: Announcement[],
  contributions: ReturnType<typeof useMemberDataStore.getState>["contributions"],
  loans: ReturnType<typeof useMemberDataStore.getState>["loans"],
  transactions: ReturnType<typeof useMemberDataStore.getState>["transactions"],
): NotifItem[] {
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
    title: i18n.t("notifications:contributionRecorded"),
    message: i18n.t("notifications:contributionRecordedMsg", { amount: formatCurrency(c.amount), method: c.method }),
    date: c.date,
  }));

  const repaymentItems: NotifItem[] = transactions
    .filter((t) => t.type === "loan_repayment")
    .map((t) => ({
      id: `repay_${t.id}`,
      type: "loan_repayment",
      title: i18n.t("notifications:repaymentMade"),
      message: i18n.t("notifications:repaymentMadeMsg", { amount: formatCurrency(Math.abs(t.amount)), ref: t.reference }),
      date: t.date,
    }));

  const loanItems = loanNotifications(loans);

  return [...announcementItems, ...contributionItems, ...repaymentItems, ...loanItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

interface NotificationState {
  items: NotifItem[];
  unreadCount: number;
  enabled: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  enabled: readStorage.getBoolean("enabled") ?? true,
  loading: false,
  error: null,
  hydrated: false,

  refresh: async () => {
    const userId = useAuthStore.getState().user?.id ?? "guest";
    let announcements = getCached<Announcement[]>(ANNOUNCEMENTS_KEY) ?? [];

    set({ loading: true });
    try {
      const res = await api.get(ANNOUNCEMENTS_KEY);
      const data = res.data?.data ?? [];
      announcements = data;
      setCached(ANNOUNCEMENTS_KEY, data);
      set({ error: null });
    } catch {
      set({ error: "Couldn't load announcements." });
    }

    const member = useMemberDataStore.getState();
    const items = buildNotifications(announcements, member.contributions, member.loans, member.transactions);
    const read = getReadIds(userId);
    const unreadCount = items.filter((n) => !read.has(n.id)).length;
    set({ items, unreadCount, loading: false, hydrated: true });
  },

  markRead: (id) => {
    const userId = useAuthStore.getState().user?.id ?? "guest";
    const read = getReadIds(userId);
    read.add(id);
    persistReadIds(userId, read);
    set({ unreadCount: Math.max(0, get().unreadCount - 1) });
  },

  markAllRead: () => {
    const userId = useAuthStore.getState().user?.id ?? "guest";
    const ids = new Set(get().items.map((n) => n.id));
    persistReadIds(userId, ids);
    set({ unreadCount: 0 });
  },

  setEnabled: (enabled) => {
    readStorage.set("enabled", enabled);
    set({ enabled, unreadCount: enabled ? get().unreadCount : 0 });
  },

  reset: () => set({ items: [], unreadCount: 0, loading: false, error: null, hydrated: false }),
}));
