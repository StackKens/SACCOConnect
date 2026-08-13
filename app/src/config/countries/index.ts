import type { CountryCode, CountryConfig } from "./types";
import uganda from "./uganda";
import kenya from "./kenya";
import tanzania from "./tanzania";
import rwanda from "./rwanda";
import burundi from "./burundi";
import southSudan from "./southsudan";

export type { CountryCode, CountryConfig };

/**
 * Central registry of all supported countries.
 * Adding a new country only requires:
 * 1. Creating a new file under this folder
 * 2. Importing it here
 * 3. Adding it to the COUNTRIES map and SUPPORTED_COUNTRY_CODES
 */
export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  UG: uganda,
  KE: kenya,
  TZ: tanzania,
  RW: rwanda,
  BI: burundi,
  SS: southSudan,
};

/** Ordered list of supported country codes (useful for pickers) */
export const SUPPORTED_COUNTRY_CODES: CountryCode[] = [
  "UG",
  "KE",
  "TZ",
  "RW",
  "BI",
  "SS",
];

/** Default country used during development and as fallback */
export const DEFAULT_COUNTRY_CODE: CountryCode = "UG";

/**
 * Safely retrieve a country configuration.
 * Falls back to Uganda if the code is unknown.
 */
export function getCountryConfig(code: CountryCode | string): CountryConfig {
  if (code in COUNTRIES) {
    return COUNTRIES[code as CountryCode];
  }
  return COUNTRIES[DEFAULT_COUNTRY_CODE];
}

/**
 * Returns true if the given code is a supported country.
 */
export function isSupportedCountry(code: string): code is CountryCode {
  return code in COUNTRIES;
}
