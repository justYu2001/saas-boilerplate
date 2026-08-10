import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOGIN_REDIRECT_PATH } from "@/constants/auth";
import { server } from "@/mocks/server";

import {
  sendLoginCode,
  signInWithProvider,
  verifyLoginCode,
} from "./send-login-code";

/*
 * Exercised through MSW rather than a mocked `authClient` on purpose. What can
 * realistically break in this file is the wiring — a renamed method reaching
 * the wrong Better Auth route, or a payload key the server ignores — and a
 * mocked client would agree with whatever the code happened to do. These
 * paths are Better Auth's own; if a version bump moves one, these tests fail
 * instead of production.
 */
const AUTH_BASE = "http://localhost:3000/api/auth";
const SEND_OTP_ENDPOINT = `${AUTH_BASE}/email-otp/send-verification-otp`;
const SIGN_IN_OTP_ENDPOINT = `${AUTH_BASE}/sign-in/email-otp`;
const SIGN_IN_SOCIAL_ENDPOINT = `${AUTH_BASE}/sign-in/social`;

interface Captured {
  body?: Record<string, unknown>;
}

/** Answers `endpoint` with `response` and records what was posted to it. */
const capture = (
  endpoint: string,
  response: Record<string, unknown>,
): Captured => {
  const captured: Captured = {};

  server.use(
    http.post(endpoint, async ({ request }) => {
      captured.body = (await request.json()) as Record<string, unknown>;

      return HttpResponse.json(response);
    }),
  );

  return captured;
};

/** Better Auth's error envelope, as the client sees it. */
const failWith = (endpoint: string, status: number, message: string) =>
  server.use(
    http.post(endpoint, () =>
      HttpResponse.json({ message, code: "SOME_CODE" }, { status }),
    ),
  );

beforeEach(() => {
  // jsdom cannot navigate, so `signIn.social` assigning `location.href` logs a
  // "Not implemented" error that has nothing to do with the assertion.
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("sendLoginCode", () => {
  it("should ask Better Auth for a sign-in code for the address", async () => {
    const captured = capture(SEND_OTP_ENDPOINT, { success: true });

    await sendLoginCode("founder@example.com");

    expect(captured.body).toMatchObject({
      email: "founder@example.com",
      type: "sign-in",
    });
  });

  it("should resolve once the request is accepted", async () => {
    capture(SEND_OTP_ENDPOINT, { success: true });

    await expect(sendLoginCode("founder@example.com")).resolves.toBeUndefined();
  });

  it("should reject when Better Auth refuses the request", async () => {
    failWith(SEND_OTP_ENDPOINT, 429, "Too many requests");

    await expect(sendLoginCode("founder@example.com")).rejects.toThrow(
      /too many requests/i,
    );
  });
});

describe("verifyLoginCode", () => {
  it("should submit the code as the `otp` field Better Auth expects", async () => {
    const captured = capture(SIGN_IN_OTP_ENDPOINT, {
      token: "session-token",
      user: { id: "user-1", email: "founder@example.com" },
    });

    await verifyLoginCode("founder@example.com", "4821");

    expect(captured.body).toMatchObject({
      email: "founder@example.com",
      otp: "4821",
    });
  });

  it("should reject a wrong code so the form can offer another try", async () => {
    failWith(SIGN_IN_OTP_ENDPOINT, 400, "Invalid OTP");

    await expect(
      verifyLoginCode("founder@example.com", "0000"),
    ).rejects.toThrow(/invalid otp/i);
  });

  it("should reject once the code has been guessed at too often", async () => {
    failWith(SIGN_IN_OTP_ENDPOINT, 403, "Too many attempts");

    await expect(
      verifyLoginCode("founder@example.com", "0000"),
    ).rejects.toThrow(/too many attempts/i);
  });

  it("should reject an expired code", async () => {
    failWith(SIGN_IN_OTP_ENDPOINT, 400, "OTP expired");

    await expect(
      verifyLoginCode("founder@example.com", "4821"),
    ).rejects.toThrow(/expired/i);
  });
});

describe("signInWithProvider", () => {
  /*
   * `redirect: true` is what the real endpoint answers, so the client follows
   * it by assigning `location.href`. jsdom cannot navigate and prints
   * "Not implemented: navigation to another Document" through its own virtual
   * console — that notice is the redirect working, not a failure.
   */
  it("should start the provider redirect and come back to the post-login path", async () => {
    const captured = capture(SIGN_IN_SOCIAL_ENDPOINT, {
      url: "https://accounts.google.com/o/oauth2/auth?client_id=test",
      redirect: true,
    });

    await signInWithProvider("google");

    expect(captured.body).toMatchObject({
      provider: "google",
      callbackURL: LOGIN_REDIRECT_PATH,
    });
  });

  it("should reject when the redirect cannot be started", async () => {
    failWith(SIGN_IN_SOCIAL_ENDPOINT, 500, "Provider is not configured");

    await expect(signInWithProvider("google")).rejects.toThrow(
      /not configured/i,
    );
  });
});
