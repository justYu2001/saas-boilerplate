import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /*
   * Mirrors the `emailOTP` server plugin in `./config.ts`. The pair has to
   * match: the client half is what types `authClient.emailOtp.*` and
   * `authClient.signIn.emailOtp`, and what tells the session store to
   * re-read after a code is accepted.
   */
  plugins: [emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
