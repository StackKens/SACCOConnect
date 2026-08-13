import type { CountryConfig } from "../../config";

/**
 * Returns the full international phone prefix for a country.
 * Example: "+256"
 */
export function getPhonePrefix(country: CountryConfig): string {
  return country.phoneCode;
}

/**
 * Formats a national number with the country prefix.
 * Does NOT perform complex validation or carrier lookups.
 *
 * @example
 * formatPhoneNumber("712345678", country) // "+256 712 345 678"
 */
export function formatPhoneNumber(
  nationalNumber: string,
  country: CountryConfig,
): string {
  const cleaned = nationalNumber.replace(/\D/g, "");
  if (cleaned.length === 9) {
    return `${country.phoneCode} ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 8) {
    return `${country.phoneCode} ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return `${country.phoneCode} ${cleaned}`;
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function normalizePhoneNumberWithCountry(phone: string, country: CountryConfig): string {
  const digits = phone.replace(/\D/g, "");
  const code = country.phoneCode.replace("+", "");

  if (digits.startsWith(code)) {
    const withoutCode = digits.slice(code.length);
    if (withoutCode.length === 9) return "0" + withoutCode;
    if (withoutCode.length === 8) return "0" + withoutCode;
    return "0" + withoutCode;
  }

  if (digits.startsWith("0")) {
    if (digits.length === 10) return digits.slice(0, 10);
    if (digits.length === 9) return digits.slice(0, 9);
    return digits;
  }

  return "0" + digits;
}
