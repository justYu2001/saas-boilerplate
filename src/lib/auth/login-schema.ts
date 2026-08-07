import { z } from "zod";

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
