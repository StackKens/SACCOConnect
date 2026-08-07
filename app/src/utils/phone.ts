// Mirrors backend validator.normalizeUgandaPhone so client and server
// agree on phone canonicalization (07XXXXXXXX).
export function normalizeUgandaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("256")) return "0" + digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(0, 10);
  return "0" + digits;
}
