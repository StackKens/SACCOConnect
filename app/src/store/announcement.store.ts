import { create } from "zustand";
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

interface AnnouncementState {
  announcements: Announcement[];
  isLoading: boolean;
  addAnnouncement: (
    announcement: Omit<Announcement, "id" | "date">,
  ) => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
}

const dummyAnnouncements: Announcement[] = [
  {
    id: "A1",
    title: "AGM Notice",
    content: "Annual General Meeting on June 30th at 10am.",
    date: "2025-06-01",
    author: "Admin",
  },
  {
    id: "A2",
    title: "Dividend Payout",
    content: "Dividends will be credited by June 15th.",
    date: "2025-05-28",
    author: "Admin",
  },
];

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: dummyAnnouncements,
  isLoading: false,
  addAnnouncement: async (announcementData) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      ...announcementData,
      date: new Date().toISOString(),
    };
    set((state) => ({
      announcements: [newAnnouncement, ...state.announcements],
      isLoading: false,
    }));
  },
  fetchAnnouncements: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ announcements: dummyAnnouncements, isLoading: false });
  },
}));
