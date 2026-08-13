import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// English
import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enSavings from "./locales/en/savings.json";
import enLoans from "./locales/en/loans.json";
import enProfile from "./locales/en/profile.json";
import enAdmin from "./locales/en/admin.json";

// Swahili
import swCommon from "./locales/sw/common.json";
import swAuth from "./locales/sw/auth.json";
import swSavings from "./locales/sw/savings.json";
import swLoans from "./locales/sw/loans.json";
import swProfile from "./locales/sw/profile.json";
import swAdmin from "./locales/sw/admin.json";

export type LanguageCode = "en" | "sw";

export const SUPPORTED_LANGUAGES: LanguageCode[] = ["en", "sw"];
export const DEFAULT_LANGUAGE: LanguageCode = "en";

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    savings: enSavings,
    loans: enLoans,
    profile: enProfile,
    admin: enAdmin,
  },
  sw: {
    common: swCommon,
    auth: swAuth,
    savings: swSavings,
    loans: swLoans,
    profile: swProfile,
    admin: swAdmin,
  },
};

/**
 * Detect a reasonable default language from the device.
 * This is only a suggestion — the user preference always wins.
 */
function getDeviceLanguage(): LanguageCode {
  try {
    const deviceLocales = Localization.getLocales();
    const primary = deviceLocales[0]?.languageCode?.toLowerCase();
    if (primary === "sw") return "sw";
  } catch {
    // ignore – fall through to default
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Country and language are intentionally separate concepts.
 * Changing country does NOT automatically change language.
 */
export function initI18n(preferredLanguage?: LanguageCode): typeof i18n {
  const language = preferredLanguage ?? getDeviceLanguage();

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: "common",
      ns: ["common", "auth", "savings", "loans", "profile", "admin"],
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false,
      },
    });
  } else if (preferredLanguage) {
    i18n.changeLanguage(preferredLanguage);
  }

  return i18n;
}

/**
 * Change the active language at runtime.
 */
export function setLanguage(language: LanguageCode): void {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    i18n.changeLanguage(language);
  }
}

export default i18n;
