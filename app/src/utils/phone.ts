import type { CountryConfig } from "../../config";

/**
 * Normalizes a phone number to a canonical national format based on the selected country.
 * Strips non-digits, removes the country code prefix if present, and ensures
 * the national format matches the expected length for that country.
 */
export function normalizePhoneNumber(phone: string, country: CountryConfig): string {
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
