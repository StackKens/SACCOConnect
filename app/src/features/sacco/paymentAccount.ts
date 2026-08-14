import type { AccountType } from "@/types";

export const PAYMENT_ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  hint: string;
  providerPlaceholder: string;
}[] = [
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
    hint: "e.g. MTN, Airtel, M-Pesa",
    providerPlaceholder: "e.g. MTN",
  },
  {
    value: "BANK",
    label: "Bank Account",
    hint: "e.g. Stanbic, KCB, Equity",
    providerPlaceholder: "e.g. Stanbic Bank",
  },
];

export function validateAccountNumber(
  type: AccountType,
  accountNumber: string,
): string | null {
  const digits = accountNumber.replace(/\D/g, "");
  if (type === "MOBILE_MONEY") {
    return digits.length >= 9
      ? null
      : "Mobile money numbers must be at least 9 digits.";
  }
  return accountNumber.trim().length >= 5
    ? null
    : "Bank account numbers must be at least 5 characters.";
}

export function paymentAccountTypeLabel(type: AccountType): string {
  return type === "BANK" ? "Bank" : "Mobile Money";
}

export function paymentAccountNumberLabel(type: AccountType): string {
  return type === "BANK" ? "Bank Account Number" : "Mobile Money Number";
}

export function paymentAccountTypeHint(type: AccountType): string {
  return (
    PAYMENT_ACCOUNT_TYPES.find((t) => t.value === type)?.hint ?? ""
  );
}

export function paymentAccountProviderPlaceholder(type: AccountType): string {
  return (
    PAYMENT_ACCOUNT_TYPES.find((t) => t.value === type)?.providerPlaceholder ??
    ""
  );
}
