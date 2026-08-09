import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, oneTap } from "better-auth/plugins";

import {
  LOGIN_CODE_LENGTH,
  LOGIN_CODE_MAX_ATTEMPTS,
  LOGIN_CODE_SEND_RATE_LIMIT,
  LOGIN_CODE_TTL_MINUTES,
} from "@/constants/auth";
import { env } from "@/env";
import { db } from "@/server/db";
import { sendLoginCodeEmail } from "@/server/email/send-login-code-email";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    // The `neon-http` driver has no transaction support, so operations run
    // sequentially instead. This is Better Auth's default — set explicitly so it
    // isn't flipped on without noticing the driver can't honour it.
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    /*
     * Passwordless login for the code the login page asks for. The plugin
     * keeps codes in the existing `verification` table, so this needs no
     * schema change — nothing to generate, nothing to push.
     */
    emailOTP({
      otpLength: LOGIN_CODE_LENGTH,
      expiresIn: LOGIN_CODE_TTL_MINUTES * 60,
      allowedAttempts: LOGIN_CODE_MAX_ATTEMPTS,
      /*
       * Codes are hashed at rest, so a leaked database row is not a
       * ready-to-use login. The cost is that a resend cannot re-send the same
       * code — the plugin falls back to rotating, which is what the login
       * form already assumes when it clears the field on resend.
       */
      storeOTP: "hashed",
      rateLimit: {
        window: LOGIN_CODE_SEND_RATE_LIMIT.windowSeconds,
        max: LOGIN_CODE_SEND_RATE_LIMIT.maxRequests,
      },
      /*
       * `disableSignUp` is left at its default of `false`, so a first-time
       * address gets an account on the way through — which is what "no
       * password required" promises on the login page. Set it to `true` for an
       * invite-only product; the send endpoint then answers unknown addresses
       * with the same `success: true` as known ones, on purpose, so the form
       * still cannot be used to enumerate who has an account.
       */
      async sendVerificationOTP({ email, otp, type }, ctx) {
        try {
          await sendLoginCodeEmail({ email, code: otp, type });
        } catch (error) {
          /*
           * Better Auth swallows whatever this throws and still answers the
           * caller `success: true` — deliberate on its part, since a send
           * that fails only for unknown addresses would leak which addresses
           * exist. The consequence is that a broken Resend key looks, from
           * the login page, exactly like a working one: the user is told to
           * check an inbox nothing is coming to.
           *
           * So this log is the only signal that it happened. Route it
           * somewhere you actually watch before going to production.
           */
          ctx?.context.logger.error(
            `Failed to deliver the ${type} login code.`,
            error,
          );
          throw error;
        }
      },
    }),
    /*
     * Google One Tap. Takes no options here on purpose: it falls back to
     * `socialProviders.google.clientId` above as the audience it checks the id
     * token against, so the two can never drift apart.
     *
     * This adds an endpoint, not a second identity. The token is verified
     * against Google's public keys and then handed to the same account-linking
     * path the redirect button uses, under `providerId: "google"` — so a
     * visitor who first signed in with an emailed code lands back on their
     * existing row rather than a duplicate. That linking depends on the local
     * account already being email-verified, which the `emailOTP` flow above
     * guarantees.
     *
     * Nothing to generate: no new table, no new column.
     */
    oneTap(),
    // Required so cookies set by auth.api.* calls (e.g. signInSocial in
    // server actions) actually reach the browser via next/headers — without
    // this, the OAuth state cookie never gets set and the callback fails
    // with state_mismatch.
    nextCookies(), // must be the last plugin in the array
  ],
});

export type Session = typeof auth.$Infer.Session;
