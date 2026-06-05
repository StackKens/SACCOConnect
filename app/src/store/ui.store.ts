import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import { Appearance, ColorSchemeName } from "react-native";

const storage = createMMKV({ id: "ui" });

type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: ColorSchemeName;
  updateEffectiveTheme: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: (storage.getString("theme") as Theme) || "system",
  effectiveTheme: Appearance.getColorScheme(),
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
