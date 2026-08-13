/**
 * Supported country codes (ISO 3166-1 alpha-2).
 * Add new codes here when expanding support.
 */
export type CountryCode = "UG" | "KE" | "TZ" | "RW" | "BI" | "SS";

/**
 * Country configuration model.
 * Designed for easy extension without breaking existing consumers.
 */
export type CountryConfig = {
  /** ISO 3166-1 alpha-2 code */
  code: CountryCode;
  /** English display name */
  name: string;
  /** ISO 4217 currency code */
  currency: string;
  /** Common local symbol (e.g. USh, KSh) */
  currencySymbol: string;
  /**
   * Number of decimal places used by the currency.
   * UGX, RWF, BIF = 0; KES, TZS, SSP = 2
   */
  currencyDecimals: number;
  /** International dialing code including leading + */
  phoneCode: string;
  /** Default BCP 47 locale for the country (language-country) */
  locale: string;
  /** IANA timezone identifier */
  timezone: string;
  /** Unicode flag emoji (optional, for UI) */
  flagEmoji?: string;
};
