import { useCountryContext } from "../providers/CountryProvider";
import type { CountryCode, CountryConfig } from "../config";

export function useCountry(): {
  country: CountryConfig;
  countryCode: CountryCode;
  setCountry: (code: CountryCode) => void;
} {
  return useCountryContext();
}
