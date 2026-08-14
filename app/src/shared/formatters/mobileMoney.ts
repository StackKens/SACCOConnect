import type { CountryConfig } from "../../config";
import { normalizePhoneNumberWithCountry } from "./phone";

/**
 * Mobile money carrier validation, data-driven per country so nothing is
 * hardcoded to Uganda. Numbers use the app's national format ("0XXXXXXXX").
 * Keys are ISO 3166-1 alpha-2 codes; values are 2-digit prefixes that follow
 * the leading "0" (e.g. MTN Uganda "0771234567" -> prefix "77").
 */
export const MOBILE_MONEY_PROVIDER_PREFIXES: Record<
  string,
  Record<string, string[]>
> = {
  UG: {
    MTN: ["76", "77", "78"],
    Airtel: ["70", "74", "75"],
  },
  KE: {
    MTN: [],
    Airtel: ["73", "75", "76", "78"],
    Safaricom: ["70", "71", "72", "73", "74", "79"],
  },
  TZ: {
    MTN: [],
    Airtel: ["68", "73", "78"],
    Vodacom: ["74", "75", "76"],
  },
  RW: {
    MTN: ["78", "79"],
    Airtel: ["72", "73"],
  },
  BI: {
    MTN: [],
    Airtel: [],
  },
  SS: {
    MTN: ["92", "97"],
    Airtel: [],
  },
};

const NATIONAL_DIGITS: Record<string, number> = {
  UG: 9,
  KE: 9,
  TZ: 9,
  RW: 9,
  BI: 8,
  SS: 9,
};

export type MobileNumberCheck =
  | { valid: true }
  | { valid: false; reason: "invalid" | "wrong_provider" };

/** Generic check: is this a plausible mobile number for the country? */
export function isValidCountryMobile(phone: string, country: CountryConfig): boolean {
  const national = normalizePhoneNumberWithCountry(phone, country);
  const expected = NATIONAL_DIGITS[country.code] ?? 9;
  return /^0\d+$/.test(national) && national.length === expected + 1;
}

/**
 * Validates a number against a specific mobile money provider.
 * Falls back to the generic country check when the provider has no known
 * prefixes for that country, so payments are never blocked unnecessarily.
 */
export function checkMobileMoneyNumber(
  phone: string,
  country: CountryConfig,
  provider: string,
): MobileNumberCheck {
  if (!isValidCountryMobile(phone, country)) {
    return { valid: false, reason: "invalid" };
  }

  const prefixes = MOBILE_MONEY_PROVIDER_PREFIXES[country.code]?.[provider];
  if (!prefixes || prefixes.length === 0) {
    return { valid: true };
  }

  const national = normalizePhoneNumberWithCountry(phone, country);
  const leading = national.slice(1, 3);
  if (prefixes.includes(leading)) {
    return { valid: true };
  }
  return { valid: false, reason: "wrong_provider" };
}

export function isValidBankAccount(account: string): boolean {
  return account.replace(/\D/g, "").length >= 6;
}
