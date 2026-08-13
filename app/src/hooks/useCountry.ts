import {
  getCountryConfig,
  type CountryCode,
  type CountryConfig,
} from "../config";
import { usePreferencesStore } from "../store/preferences.store";

export function useCountry(): {
  country: CountryConfig;
  countryCode: CountryCode;
  setCountry: (code: CountryCode) => void;
} {
  const countryCode = usePreferencesStore((s) => s.countryCode);
  const setCountry = usePreferencesStore((s) => s.setCountry);

  return {
    country: getCountryConfig(countryCode),
    countryCode,
    setCountry,
  };
}
