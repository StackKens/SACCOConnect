export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "800", letterSpacing: -0.5 },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: "700", letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: "700", letterSpacing: -0.3 },
  h3: { fontSize: 16, lineHeight: 24, fontWeight: "600", letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  captionMedium: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: "500", letterSpacing: 0.2 },
  tabular: { fontVariant: ["tabular-nums"] as const },
} as const;

export const shadows = {
  none: {},
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 0,
  },
} as const;
