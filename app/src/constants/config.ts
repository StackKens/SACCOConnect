export const APP_NAME = "SACCOConnect";
export const APP_VERSION = "1.0.0";

/** Enable local mock auth/API for offline development. Never set in production builds. */
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

if (!__DEV__ && USE_MOCK_API) {
  throw new Error(
    "EXPO_PUBLIC_USE_MOCK_API must not be enabled in production builds",
  );
}
export const STORAGE_KEYS = {
  AUTH: "auth",
  UI: "ui",
  LOANS: "loans",
  CONTRIBUTIONS: "contributions",
};
export const ROUTES = {
  AUTH: {
    ONBOARDING: "/(auth)/onboarding",
    ENTRY: "/(auth)/entry",
    LOGIN: "/(auth)/login",
    REGISTER: "/(auth)/register",
  },
  MEMBER: {
    HOME: "/(member)",
    CONTRIBUTIONS: "/(member)/contributions",
    LOANS: "/(member)/loans",
  },
  ADMIN: { DASHBOARD: "/(admin)", MEMBERS: "/(admin)/members" },
};
