import { emailOTPClient, oneTapClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ONE_TAP_MAX_PROMPT_ATTEMPTS } from "@/constants/auth";
import { env } from "@/env";

export const authClient = createAuthClient({
  /*
   * Mirrors the `emailOTP` server plugin in `./config.ts`. The pair has to
   * match: the client half is what types `authClient.emailOtp.*` and
   * `authClient.signIn.emailOtp`, and what tells the session store to
   * re-read after a code is accepted.
   */
  plugins: [
    emailOTPClient(),
    /*
     * Mirrors `oneTap()` in `./config.ts`, and types `authClient.oneTap`.
     *
     * Registering it here is inert on its own — it loads no script and shows
     * no prompt until something calls `authClient.oneTap()`. The only caller
     * is `@/components/auth/google-one-tap`, mounted on the marketing home
     * page alone. See the note there for why it lives at a call site rather
     * than in a layout.
     */
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      promptOptions: {
        /*
         * FedCM is the default and is left on: third-party cookies are what
         * the older prompt ran on, and those are going away. The cost is that
         * the browser owns the prompt's appearance and position — it cannot be
         * styled, moved, or told to close when the user clicks elsewhere
         * (`cancelOnTapOutside` has no effect under FedCM).
         */
        maxAttempts: ONE_TAP_MAX_PROMPT_ATTEMPTS,
      },
    }),
  ],
});

/**
 * The session as the browser sees it, inferred from the client's own plugin
 * list. Distinct from the server-side `Session` in `./config` — that one is
 * inferred from the server plugins, and the two lists are not identical.
 *
 * @public Part of the surface a client component reaches for once it needs to
 * type a session it is handed; nothing imports it yet.
 */
export type Session = typeof authClient.$Infer.Session;
