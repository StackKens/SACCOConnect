import { create } from "zustand";
import { getSecureStorage } from "../services/secureStorage";
import {
  DEFAULT_COUNTRY_CODE,
  isSupportedCountry,
  type CountryCode,
} from "../config";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  initI18n,
  type LanguageCode,
} from "../localization/i18n";

const storage = getSecureStorage("preferences");

interface PreferencesState {
  countryCode: CountryCode;
  language: LanguageCode;
  setCountry: (code: CountryCode) => void;
  setLanguage: (lang: LanguageCode) => void;
  hydratePreferences: () => void;
}

/**
 * Country and language preferences. Persisted via encrypted MMKV so the
 * preference survives restarts, and later the backend can become the
 * authoritative source. Country and language are independent — changing one
 * never changes the other.
 */
export const usePreferencesStore = create<PreferencesState>((set) => ({
  countryCode: DEFAULT_COUNTRY_CODE,
  language: DEFAULT_LANGUAGE,

  hydratePreferences: () => {
    const storedCountry = storage.getString("countryCode");
    const storedLanguage = storage.getString("language");
    const countryCode =
      storedCountry && isSupportedCountry(storedCountry)
        ? (storedCountry as CountryCode)
        : DEFAULT_COUNTRY_CODE;
    const language = SUPPORTED_LANGUAGES.includes(storedLanguage as LanguageCode)
      ? (storedLanguage as LanguageCode)
      : DEFAULT_LANGUAGE;
    set({ countryCode, language });
    initI18n(language);
  },

  setCountry: (code) => {
    if (!isSupportedCountry(code)) return;
    storage.set("countryCode", code);
    set({ countryCode: code });
  },

  setLanguage: (lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    storage.set("language", lang);
    set({ language: lang });
    initI18n(lang);
  },
}));
