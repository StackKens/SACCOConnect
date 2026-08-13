import { getCountryConfig } from "../config";
import { usePreferencesStore } from "../store/preferences.store";
import { formatCurrency as formatCurrencyForCountry } from "../shared/formatters";

/**
 * Formats an amount using the current country preference's currency and
 * locale. Reads the preferences store directly so existing call sites do not
 * need to subscribe to the country — the value is always rendered per the
 * selected country on render.
 */
export const formatCurrency = (amount: number): string => {
  const country = getCountryConfig(usePreferencesStore.getState().countryCode);
  return formatCurrencyForCountry(amount, country);
};
