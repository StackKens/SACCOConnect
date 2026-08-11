import { create } from "zustand";
import { useAuthStore } from "./auth.store";
import { useMemberDataStore } from "./member.store";
import { api } from "../services/api";
import { getCached, setCached } from "../services/cache";
import { getSecureStorage } from "../services/secureStorage";
import type { NotifItem } from "../components/features/NotificationRow";

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

  return [...announcementItems, ...contributionItems, ...repaymentItems, ...loanItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

interface NotificationState {
  items: NotifItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
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

  reset: () => set({ items: [], unreadCount: 0, loading: false, error: null, hydrated: false }),
}));
