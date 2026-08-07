import { describe, expect, it } from "vitest";

import { loginSchema } from "./login-schema";

const parse = (email: string) => loginSchema.safeParse({ email });

const messageOf = (email: string) => {
  const result = parse(email);

  if (result.success) {
    throw new Error(`Expected ${JSON.stringify(email)} to fail validation`);
  }

  return result.error.issues[0]?.message;
};

describe("loginSchema", () => {
  it("should accept a well-formed address", () => {
    const result = parse("founder@example.com");

    expect(result.success).toBe(true);
  });

  it("should trim surrounding whitespace and lowercase the address", () => {
    const result = parse("  Founder@Example.COM  ");

    expect(result.success && result.data.email).toBe("founder@example.com");
  });

  it("should reject an empty value with a prompt to enter an address", () => {
    expect(messageOf("")).toBe("Enter your email address.");
  });

  it("should treat a whitespace-only value as empty rather than malformed", () => {
    expect(messageOf("   ")).toBe("Enter your email address.");
  });

  it("should reject a malformed address", () => {
    expect(messageOf("not-an-email")).toBe(
      "That doesn't look like a valid email address.",
    );
  });

  it("should reject an address with no domain", () => {
    expect(messageOf("founder@")).toBe(
      "That doesn't look like a valid email address.",
    );
  });
});
