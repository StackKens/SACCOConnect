import { getCountryConfig } from "../config";
import { usePreferencesStore } from "../store/preferences.store";
import i18n from "../localization/i18n";

const currentLocale = (): string =>
  i18n.language === "sw" ? "sw" : getCountryConfig(usePreferencesStore.getState().countryCode).locale;

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(currentLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(currentLocale(), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function defaultContributionDueDate(dayOfMonth = 5): string {
  const d = new Date();
  d.setDate(dayOfMonth);
  if (d <= new Date()) {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().split("T")[0];
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

export function daysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function dueDateLabel(dateString: string): string {
  const days = daysUntil(dateString);
  if (days === 0) return i18n.t("dueToday", { ns: "common" });
  if (days === 1) return i18n.t("dueTomorrow", { ns: "common" });
  if (days > 1) return i18n.t("dueInDays", { ns: "common", count: days });
  if (days === -1) return i18n.t("overdueByOneDay", { ns: "common" });
  return i18n.t("overdueByDays", { ns: "common", count: Math.abs(days) });
};

export const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const then = new Date(dateString);
  const diffDays = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return i18n.t("today", { ns: "common" });
  if (diffDays === 1) return i18n.t("yesterday", { ns: "common" });
  if (diffDays < 7) return i18n.t("daysAgo", { ns: "common", count: diffDays });
  return formatDate(dateString);
};
