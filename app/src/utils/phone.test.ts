import { describe, it, expect } from "vitest";
import { normalizeUgandaPhone } from "./phone";

describe("normalizeUgandaPhone", () => {
  it("keeps 07XXXXXXXX as-is", () => {
    expect(normalizeUgandaPhone("0712345678")).toBe("0712345678");
  });

  it("drops leading +256", () => {
    expect(normalizeUgandaPhone("+256712345678")).toBe("0712345678");
  });

  it("drops leading 256 without plus", () => {
    expect(normalizeUgandaPhone("256712345678")).toBe("0712345678");
  });

  it("prefixes a bare 9-digit number", () => {
    expect(normalizeUgandaPhone("712345678")).toBe("0712345678");
  });

  it("strips non-digit separators", () => {
    expect(normalizeUgandaPhone("+256 (712) 345-678")).toBe("0712345678");
  });

  it("matches backend behavior on edge input", () => {
    expect(normalizeUgandaPhone("07123456789")).toBe("0712345678");
  });
});
