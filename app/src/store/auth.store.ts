import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import { User } from "../types";

const storage = createMMKV({ id: "auth" });

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async (email, password) => {
    // Simulate API call – replace with actual backend
    const mockUser: User = {
      id: "1",
      name: email === "admin@example.com" ? "Admin User" : "John Doe",
      email,
      role: email === "admin@example.com" ? "admin" : "member",
    };
    storage.set("user", JSON.stringify(mockUser));
    set({ user: mockUser });
  },
  register: async (name, email, password) => {
    const mockUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: "member",
    };
    storage.set("user", JSON.stringify(mockUser));
    set({ user: mockUser });
  },
  logout: () => {
    storage.delete("user");
    set({ user: null });
  },
  checkAuth: () => {
    const stored = storage.getString("user");
    if (stored) {
      set({ user: JSON.parse(stored), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));
