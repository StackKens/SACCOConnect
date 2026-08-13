export function formatDate(
  date: Date | string | number,
  locale: string = "en",
  timezone?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "object" ? date : new Date(date);

  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: timezone,
      ...options,
    }).format(d);
  } catch {
    return d.toLocaleDateString(locale, options);
  }
}

/**
 * Formats a date + time.
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = "en",
  timezone?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "object" ? date : new Date(date);

  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
      ...options,
    }).format(d);
  } catch {
    return d.toLocaleString(locale, options);
  }
}
