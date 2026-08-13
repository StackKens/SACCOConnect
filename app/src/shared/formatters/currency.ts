import type { CountryConfig } from "../../config";

export function formatCurrency(
  amount: number,
  country: CountryConfig,
  options?: {
    /** Show currency symbol / code. Defaults to true */
    showSymbol?: boolean;
    /** Override locale (defaults to country.locale) */
    locale?: string;
    /** Force a specific number of fraction digits */
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  const {
    showSymbol = true,
    locale = country.locale,
    minimumFractionDigits = country.currencyDecimals,
    maximumFractionDigits = country.currencyDecimals,
  } = options ?? {};

  try {
    return new Intl.NumberFormat(locale, {
      style: showSymbol ? "currency" : "decimal",
      currency: country.currency,
      currencyDisplay: "symbol",
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    // Fallback for environments with limited Intl support
    const formatted = amount.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    return showSymbol ? `${country.currencySymbol} ${formatted}` : formatted;
  }
}
