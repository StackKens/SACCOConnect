/**
 * Country-aware phone validation for East Africa.
 * Phone rules are keyed by ISO 3166-1 alpha-2 country code. The national
 * format used across the app is a leading "0" followed by nationalDigits.
 * No country's dial code is hardcoded into business logic.
 */
export interface CountryPhoneRule {
  dialCode: string;
  nationalDigits: number;
}

export const COUNTRY_PHONE_RULES: Record<string, CountryPhoneRule> = {
  UG: { dialCode: "256", nationalDigits: 9 },
  KE: { dialCode: "254", nationalDigits: 9 },
  TZ: { dialCode: "255", nationalDigits: 9 },
  RW: { dialCode: "250", nationalDigits: 9 },
  BI: { dialCode: "257", nationalDigits: 8 },
  SS: { dialCode: "211", nationalDigits: 9 },
};

export function isSupportedCountryCode(code: string): boolean {
  return code in COUNTRY_PHONE_RULES;
}

/**
 * Normalizes a phone number to national format ("0XXXXXXXX") for a country.
 * Accepts international dialing form and national form.
 */
export function normalizeCountryPhone(phone: string, countryCode: string): string {
  let digits = phone.replace(/\D/g, "");
  const rule = COUNTRY_PHONE_RULES[countryCode];
  if (rule && digits.startsWith(rule.dialCode)) {
    digits = digits.slice(rule.dialCode.length);
  }
  if (digits.startsWith("0")) digits = digits.slice(1);
  return "0" + digits;
}

export function isValidCountryPhone(phone: string, countryCode: string): boolean {
  const rule = COUNTRY_PHONE_RULES[countryCode];
  if (!rule) return false;
  return normalizeCountryPhone(phone, countryCode).length === rule.nationalDigits + 1;
}
