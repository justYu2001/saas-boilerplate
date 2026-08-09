import { describe, expect, it } from "vitest";

import { resolveAccountName } from "./account";

const GOOGLE_USER = { name: "Ada Lovelace", email: "ada@example.com" };
const CODE_USER = { name: "ada", email: "ada@example.com" };

describe("resolveAccountName", () => {
  it("should show the display name a social login supplied", () => {
    expect(resolveAccountName(GOOGLE_USER)).toBe("Ada Lovelace");
  });

  it("should fall back to the address when the name is only the local part Better Auth derived from it", () => {
    expect(resolveAccountName(CODE_USER)).toBe("ada@example.com");
  });

  it("should fall back to the address when the name is the whole address", () => {
    expect(
      resolveAccountName({ name: "Ada@Example.com", email: "ada@example.com" }),
    ).toBe("ada@example.com");
  });

  it.each([
    ["missing", undefined],
    ["null", null],
    ["blank", "   "],
  ])("should fall back to the address for a %s name", (_label, name) => {
    expect(resolveAccountName({ name, email: "ada@example.com" })).toBe(
      "ada@example.com",
    );
  });

  it("should keep a real name that happens to start with the local part", () => {
    expect(
      resolveAccountName({ name: "ada byron", email: "ada@example.com" }),
    ).toBe("ada byron");
  });

  it("should not throw on an address with no local part", () => {
    expect(resolveAccountName({ name: null, email: "@example.com" })).toBe(
      "@example.com",
    );
  });
});
