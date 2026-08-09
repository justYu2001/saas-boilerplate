import type * as React from "react";

import GoogleIcon from "@/components/icons/google-icon";

export const LOGIN_CODE_LENGTH = 4;

export const LOGIN_CODE_TTL_MINUTES = 10;

/**
 * How long a freshly sent code must age before another can be requested.
 *
 * Short enough that a genuinely lost email isn't punished, long enough that
 * the inbox doesn't fill with codes that invalidate each other.
 */
export const LOGIN_RESEND_COOLDOWN_SECONDS = 30;

/**
 * How many wrong guesses one code tolerates before Better Auth discards it and
 * the user has to request another.
 *
 * This is the primary defence, not the rate limit below. A 4-digit code is one
 * of only 10,000, so what keeps it safe is that a given code dies after three
 * misses — an attacker gets three guesses per code they cannot see, not three
 * guesses per second against a code that stays valid for ten minutes.
 * Lengthening {@link LOGIN_CODE_LENGTH} is the lever to pull if that trade
 * isn't right for your product; raising this number is not.
 */
export const LOGIN_CODE_MAX_ATTEMPTS = 3;

/**
 * Server-side ceiling on how often one caller may ask for a code.
 *
 * The client cooldown in {@link LOGIN_RESEND_COOLDOWN_SECONDS} is a courtesy —
 * it survives neither a page reload nor a script. This is the version that
 * holds, and it exists to stop an inbox being used as a weapon rather than to
 * pace an honest user, so it is set a little looser than the cooldown.
 *
 * Better Auth stores these counters in memory by default, which means one
 * bucket per running instance. On a single container that is exact; behind
 * several it is only approximate, and a deployment that cares should move
 * `rateLimit.storage` to `"database"` or a shared secondary store.
 */
export const LOGIN_CODE_SEND_RATE_LIMIT = {
  windowSeconds: 60,
  maxRequests: 3,
} as const;

/**
 * Where a successful login lands. There is no app shell in the boilerplate
 * yet, so the marketing home page stands in — point this at the real
 * post-login surface as soon as one exists.
 */
export const LOGIN_REDIRECT_PATH = "/";

/** The single authentication entry point every marketing CTA points at. */
export const LOGIN_PATH = "/login";

/**
 * The two marketing entrances to {@link LOGIN_PATH}.
 *
 * Both lead to the same page because there is only one page to lead to:
 * `disableSignUp` is left at its default in the Better Auth config, so a
 * first-time address gets an account on the way through the code flow and no
 * separate sign-up route exists. The pair is a copy decision, not a routing
 * one — returning and first-time visitors scan the header for different words,
 * and a lone "Log in" reads as members-only to someone who has never been
 * here, which turns them away from a door that would have let them in.
 *
 * A fork that sets `disableSignUp: true` should drop {@link AUTH_NAV_COPY.signUp}
 * along with it; inviting someone to get started is a lie once the send
 * endpoint stops creating accounts.
 */
export const AUTH_NAV_COPY = {
  logIn: "Log in",
  signUp: "Get started",
} as const;

/**
 * How many times the One Tap prompt may be re-attempted before the client
 * gives up and reports through `onPromptNotification`.
 *
 * Lower than Better Auth's default of five. A retry only happens for reasons
 * the user did not choose — an explicit dismissal or a tap outside stops the
 * sequence immediately — but each one waits an exponentially longer delay, so
 * a high ceiling means a prompt that can still appear well over a minute after
 * the landing page settled. Two attempts covers the transient cases without
 * letting the prompt ambush someone who has started reading.
 */
export const ONE_TAP_MAX_PROMPT_ATTEMPTS = 2;

export interface OAuthProvider {
  /** Matches the key under `socialProviders` in the Better Auth config. */
  id: "google";
  /** Full button label. Google requires "Continue with Google" or similar. */
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/** Social providers offered on the login page, in display order. */
export const OAUTH_PROVIDERS: readonly OAuthProvider[] = [
  { id: "google", label: "Continue with Google", icon: GoogleIcon },
];

/**
 * Every user-facing string on the login page.
 *
 * Kept in one place so a fork can rebrand the surface without touching markup.
 */
export const LOGIN_COPY = {
  /*
   * Names both audiences on purpose. This page creates accounts as readily as
   * it opens them — see the note on {@link AUTH_NAV_COPY} — so a title that
   * addressed only returning users would be telling a first-time visitor they
   * were in the wrong place while quietly signing them up.
   */
  title: "Log in or create your account",
  subtitle: "New or returning, the same code gets you in.",
  dividerLabel: "or",
  emailLabel: "Email",
  emailPlaceholder: "you@domain.com",
  submit: "Continue with email",
  submitPending: "Sending code",
  helper: `We'll email you a ${LOGIN_CODE_LENGTH}-digit code. No password.`,
  sentTitle: "Check your inbox",
  sentBodyPrefix: `We sent a ${LOGIN_CODE_LENGTH}-digit code to `,
  sentBodySuffix: `. It expires in ${LOGIN_CODE_TTL_MINUTES} minutes.`,
  sentReset: "Use a different email",
  genericError: "We couldn't send that code. Try again in a moment.",
  codeLabel: `${LOGIN_CODE_LENGTH}-digit code`,
  verifySubmit: "Log in",
  verifySubmitPending: "Verifying",
  verifyError: "We couldn't verify that code. Try again in a moment.",
  resendPrompt: "Didn't get a code?",
  resendAction: "Resend code",
  resendPending: "Sending",
  /** Rests in the resend control for as long as the cooldown runs. */
  resendCooldown: (seconds: number) => `Resend in ${seconds}s`,
  /**
   * Announced to assistive technology only. Sighted users read the countdown
   * as the receipt; a countdown that ticks every second must never be a live
   * region, so the confirmation is delivered once, here.
   */
  resendSuccess: (seconds: number) =>
    `New code sent. You can request another in ${seconds} seconds.`,
} as const;
