export type OnboardingVariant = "saveBorrowGrow" | "yourSacco";

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  /** Selects which illustration renders for the slide. */
  variant: OnboardingVariant;
}

export interface OnboardingAction {
  /** Label for the primary call-to-action on the final slide. */
  getStartedLabel: string;
}
