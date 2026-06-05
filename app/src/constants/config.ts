export const APP_NAME = "SACCOConnect";
export const APP_VERSION = "1.0.0";
export const STORAGE_KEYS = {
  AUTH: "auth",
  UI: "ui",
  LOANS: "loans",
  CONTRIBUTIONS: "contributions",
};
export const ROUTES = {
  AUTH: {
    LOGIN: "/(auth)/login",
    REGISTER: "/(auth)/register",
    ONBOARDING: "/(auth)/onboarding",
  },
  MEMBER: {
    HOME: "/(member)",
    CONTRIBUTIONS: "/(member)/contributions",
    LOANS: "/(member)/loans",
  },
  ADMIN: { DASHBOARD: "/(admin)", MEMBERS: "/(admin)/members" },
};
