import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "announcements" });

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

const INITIAL: Announcement[] = [
  { id: "1", title: "AGM Notice", content: "Annual General Meeting scheduled for June 30th. All members are required to attend.", date: "2025-06-01", author: "Admin" },
  { id: "2", title: "Dividend Payout", content: "Dividends for the 2024/2025 financial year will be credited to all member accounts by June 15th.", date: "2025-05-28", author: "Admin" },
];

function load(): Announcement[] {
  const stored = storage.getString("list");
  return stored ? JSON.parse(stored) : INITIAL;
}

function save(list: Announcement[]) {
  storage.set("list", JSON.stringify(list));
}

// track which announcement ids a member has read — keyed by user id
export function getReadIds(userId: string): Set<string> {
  const stored = storage.getString(`read_${userId}`);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

export function markReadInStorage(userId: string, id: string) {
  const ids = getReadIds(userId);
  ids.add(id);
  storage.set(`read_${userId}`, JSON.stringify([...ids]));
}

interface AnnouncementStore {
  announcements: Announcement[];
  post: (title: string, content: string, authorName: string) => void;
  remove: (id: string) => void;
  resetAnnouncements: () => void;
}

export const useAnnouncementStore = create<AnnouncementStore>((set, get) => ({
  announcements: load(),

  post: (title, content, authorName) => {
    const next: Announcement = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString().split("T")[0],
      author: authorName,
    };
    const list = [next, ...get().announcements];
    save(list);
    set({ announcements: list });
  },

  remove: (id) => {
    const list = get().announcements.filter((a) => a.id !== id);
    save(list);
    set({ announcements: list });
  },

  resetAnnouncements: () => {
    save(INITIAL);
    set({ announcements: INITIAL });
  },
}));
