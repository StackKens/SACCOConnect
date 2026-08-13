import React, { createContext, useContext, useMemo } from "react";
import {
  type CountryCode,
  type CountryConfig,
  getCountryConfig,
} from "../config";
import { usePreferencesStore } from "../store/preferences.store";

type CountryContextValue = {
  countryCode: CountryCode;
  country: CountryConfig;
  setCountry: (code: CountryCode) => void;
};

const CountryContext = createContext<CountryContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

/**
 * Exposes the current country via context. The source of truth is the
 * Zustand preferences store (persisted + hydrated at boot); this provider is
 * a thin view-layer bridge so components can use `useCountryContext`.
 */
export function CountryProvider({ children }: Props) {
  const countryCode = usePreferencesStore((s) => s.countryCode);
  const setCountry = usePreferencesStore((s) => s.setCountry);

  const value = useMemo(
    () => ({
      countryCode,
      country: getCountryConfig(countryCode),
      setCountry,
    }),
    [countryCode, setCountry],
  );

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

export function useCountryContext(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error("useCountry must be used within a <CountryProvider>");
  }
  return ctx;
}
