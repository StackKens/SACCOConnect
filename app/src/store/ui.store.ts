import { create } from "zustand";
import { Appearance, ColorSchemeName } from "react-native";
import { getSecureStorage } from "../services/secureStorage";

const storage = getSecureStorage("ui");

type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: ColorSchemeName;
  updateEffectiveTheme: () => void;
  hydrateTheme: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "system",
  effectiveTheme: Appearance.getColorScheme(),
  hydrateTheme: () => {
    const stored = storage.getString("theme") as Theme | null;
    if (stored === "light" || stored === "dark") set({ theme: stored });
    get().updateEffectiveTheme();
  },
  setTheme: (theme) => {
    storage.set("theme", theme);
    set({ theme });
    get().updateEffectiveTheme();
  },
  updateEffectiveTheme: () => {
    const { theme } = get();
    let effective: ColorSchemeName = "light";
    if (theme === "system") {
      effective = Appearance.getColorScheme();
    } else {
      effective = theme;
    }
    set({ effectiveTheme: effective });
  },
}));

// Listen to system changes
Appearance.addChangeListener(() => {
  const store = useUIStore.getState();
  if (store.theme === "system") {
    store.updateEffectiveTheme();
  }
});
