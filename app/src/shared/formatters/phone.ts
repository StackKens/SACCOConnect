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
  // Simple grouping for readability:
  // - 9 digits: most supported markets (UG, KE, TZ, RW, SS)
  // - 8 digits: Burundi
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
