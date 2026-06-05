export const lightColors = {
  background: "#FFFFFF",
  surface: "#F8F9FA",
  primary: "#0A2540",
  primaryDark: "#05192B",
  secondary: "#00A86B",
  secondaryDark: "#008E5A",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  error: "#DC2626",
  warning: "#F59E0B",
  success: "#10B981",
  card: "#FFFFFF",
  shadow: "#000000",
};

export const darkColors = {
  background: "#121212",
  surface: "#1E1E1E",
  primary: "#2C4B7A",
  primaryDark: "#1A3652",
  secondary: "#00C883",
  secondaryDark: "#00A86B",
  text: "#F5F5F5",
  textSecondary: "#9CA3AF",
  border: "#2D2D2D",
  error: "#EF4444",
  warning: "#FBBF24",
  success: "#34D399",
  card: "#252525",
  shadow: "#000000",
};

export const getColors = (isDark: boolean) =>
  isDark ? darkColors : lightColors;
