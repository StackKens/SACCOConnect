/**
 * Public config surface for the application.
 * Prefer importing from here rather than deep paths.
 */
export {
  COUNTRIES,
  SUPPORTED_COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  getCountryConfig,
  isSupportedCountry,
} from "./countries";

export type { CountryCode, CountryConfig } from "./countries";
