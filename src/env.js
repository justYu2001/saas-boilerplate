import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * `hi@acme.com` or `Acme <hi@acme.com>`. Deliberately looser than full RFC
 * 5322: the job here is to catch a misconfigured `.env` at boot rather than to
 * re-implement address parsing that Resend already does at send time.
 */
const EMAIL_FROM_PATTERN = /^(?:[^<>]+ )?<?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    BETTER_AUTH_GOOGLE_CLIENT_ID: z.string(),
    BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string(),
    DATABASE_URL: z.url(),
    RESEND_API_KEY: z.string().min(1),
    /**
     * Sender of every transactional email. Accepts a bare address
     * (`hi@acme.com`) or one with a display name (`Acme <hi@acme.com>`) —
     * both are what Resend's `from` field takes. The domain must be verified
     * in Resend, except for `onboarding@resend.dev`, which only delivers to
     * the address that owns the Resend account.
     */
    EMAIL_FROM: z.string().regex(EMAIL_FROM_PATTERN, {
      error:
        'EMAIL_FROM must be an email address, optionally with a display name: "Acme <hi@acme.com>".',
    }),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CRISP_WEBSITE_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_GOOGLE_CLIENT_ID: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
    BETTER_AUTH_GOOGLE_CLIENT_SECRET:
      process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CRISP_WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
