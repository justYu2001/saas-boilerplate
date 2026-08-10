import { LOGIN_REDIRECT_PATH, type OAuthProvider } from "@/constants/auth";
import { authClient } from "@/server/better-auth/client";

/**
 * The login page's transport layer.
 *
 * Every function resolves on success and rejects on failure — that is the
 * whole contract the form's loading and error states are built against, and
 * the reason the form never inspects a response body. Rejection reasons carry
 * the underlying cause for the console and for tests; the form deliberately
 * discards them and shows one fixed sentence instead, so a failure cannot be
 * read as evidence about whether an account exists.
 */

/**
 * Better Auth's client returns `{ data, error }` rather than throwing. This
 * turns that back into the exception the callers here promise, keeping the
 * `error` narrowing in one place instead of at all three call sites.
 */
const assertOk = (
  error: { message?: string | undefined } | null,
  fallbackMessage: string,
) => {
  if (error) {
    throw new Error(error.message ?? fallbackMessage);
  }
};

/**
 * Emails a short-lived login code, creating the account on first use.
 *
 * Resolves as soon as Better Auth accepts the request. That is not the same as
 * the email having been delivered: the send happens behind the endpoint and a
 * provider failure is logged server-side rather than reported here. See the
 * note on `sendVerificationOTP` in `src/server/better-auth/config.ts`.
 */
export const sendLoginCode = async (email: string) => {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: "sign-in",
  });

  assertOk(error, "Better Auth refused to send the login code.");
};

/**
 * Verifies a login code and completes sign-in.
 *
 * On success the session cookie is already set by the response, so the caller
 * only has to navigate. A wrong code rejects, and so does the third wrong code
 * in a row — at which point the code itself is discarded and the user needs a
 * new one.
 */
export const verifyLoginCode = async (email: string, code: string) => {
  const { error } = await authClient.signIn.emailOtp({ email, otp: code });

  assertOk(error, "Better Auth rejected the login code.");
};

/**
 * Starts an OAuth redirect.
 *
 * The client navigates the browser away itself when the provider answers, so
 * on the happy path this never resolves — the page is gone. It only settles to
 * report that the redirect could not be started.
 */
export const signInWithProvider = async (provider: OAuthProvider["id"]) => {
  const { error } = await authClient.signIn.social({
    provider,
    callbackURL: LOGIN_REDIRECT_PATH,
  });

  assertOk(error, `Better Auth could not start the ${provider} redirect.`);
};
