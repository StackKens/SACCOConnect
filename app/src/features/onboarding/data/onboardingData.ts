import type { OnboardingSlide } from "../types";

/**
 * Onboarding copy. Region-neutral by design: no currency symbols, country
 * flags, or country-specific terminology. Country-specific presentation
 * (currency, phone code, locale, date/number formats) is handled later by a
 * per-country configuration layer — not by this onboarding.
 */
export const onboardingData: readonly OnboardingSlide[] = [
  {
    id: "save-borrow-grow",
    title: "Save. Borrow. Grow.",
    description:
      "Manage your savings, access loans, and take control of your financial journey — all from one place.",
    variant: "saveBorrowGrow",
  },
  {
    id: "your-sacco-in-your-hands",
    title: "Your SACCO. Your Finances. One Place.",
    description:
      "Keep track of your savings, loans, repayments, and financial activity wherever you are.",
    variant: "yourSacco",
  },
];
