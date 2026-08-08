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
  title: "Log in to your account",
  subtitle: "Pick up where you left off. No password required.",
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
