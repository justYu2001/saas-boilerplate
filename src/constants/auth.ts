import type * as React from "react";

import GoogleIcon from "@/components/icons/google-icon";

export const LOGIN_CODE_LENGTH = 4;

export const LOGIN_CODE_TTL_MINUTES = 10;

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
  sentBody: (email: string) =>
    `We sent a ${LOGIN_CODE_LENGTH}-digit code to ${email}. It expires in ${LOGIN_CODE_TTL_MINUTES} minutes.`,
  sentReset: "Use a different email",
  genericError: "We couldn't send that code. Try again in a moment.",
} as const;
