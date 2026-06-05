import { useUIStore } from "../store/ui.store";
import { getColors } from "../theme/colors";

export const useTheme = () => {
  const effectiveTheme = useUIStore((state) => state.effectiveTheme);
  const isDark = effectiveTheme === "dark";
  const colors = getColors(isDark);
  return { colors, isDark, effectiveTheme };
};
