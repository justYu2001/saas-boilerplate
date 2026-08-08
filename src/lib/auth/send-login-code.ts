import type { OAuthProvider } from "@/constants/auth";

/**
 * The one file to change when wiring real authentication.
 *
 * Both functions are deliberate stubs: the login page ships as presentation
 * only. They resolve on success and reject on failure, which is the contract
 * the form's loading and error states are built against — so replacing the
 * bodies below needs no changes in the UI.
 */

const STUB_LATENCY_MS = 900;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Emails a short-lived login code.
 *
 * To make this real, add Better Auth's `emailOTP` plugin to
 * `src/server/better-auth/config.ts`, give it a `sendVerificationOTP`
 * implementation backed by a transactional email provider, then replace this
 * body with:
 *
 * ```ts
 * const { error } = await authClient.emailOtp.sendVerificationOtp({
 *   email,
 *   type: "sign-in",
 * });
 * if (error) throw new Error(error.message);
 * ```
 */
export async function sendLoginCode(email: string): Promise<void> {
  await delay(STUB_LATENCY_MS);

  if (!email) {
    throw new Error("An email address is required.");
  }
}

/**
 * Verifies a login code and completes sign-in.
 *
 * To make this real, replace this body with:
 *
 * ```ts
 * const { error } = await authClient.signIn.emailOtp({ email, otp: code });
 * if (error) throw new Error(error.message);
 * ```
 */
export async function verifyLoginCode(
  email: string,
  code: string,
): Promise<void> {
  await delay(STUB_LATENCY_MS);

  if (!email || !code) {
    throw new Error("An email address and code are required.");
  }
}

/**
 * Starts an OAuth redirect.
 *
 * Google is already configured in `src/server/better-auth/config.ts`, so this
 * body becomes:
 *
 * ```ts
 * await authClient.signIn.social({ provider, callbackURL: "/" });
 * ```
 *
 * once `BETTER_AUTH_GOOGLE_CLIENT_ID` and `..._SECRET` are set in the
 * environment.
 */
export async function signInWithProvider(
  provider: OAuthProvider["id"],
): Promise<void> {
  await delay(STUB_LATENCY_MS);

  if (!provider) {
    throw new Error("A provider is required.");
  }
}
