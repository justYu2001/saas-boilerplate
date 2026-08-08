import { z } from "zod";

import { LOGIN_CODE_LENGTH } from "@/constants/auth";

/**
 * Validation for the passwordless login form.
 *
 * Trimmed and lowercased before validation so "  Me@Example.com " and
 * "me@example.com" are treated as the same address.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { error: "Enter your email address." })
    .pipe(z.email({ error: "That doesn't look like a valid email address." })),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validation for the code-entry step. The `InputOTP` field already restricts
 * keystrokes to digits, so this is a defense-in-depth check for paste and
 * programmatic input rather than the primary guard.
 */
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(LOGIN_CODE_LENGTH, {
      error: `Enter the ${LOGIN_CODE_LENGTH}-digit code.`,
    })
    .regex(/^\d+$/, { error: "The code must be numbers only." }),
});

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
