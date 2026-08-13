/**
 * Formats a plain number according to the given locale.
 *
 * @example
 * formatNumber(1234567.89, "en-UG") // "1,234,567.89"
 */
export function formatNumber(
  value: number,
  locale: string = "en",
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  } catch {
    return value.toLocaleString(locale, options);
  }
}
