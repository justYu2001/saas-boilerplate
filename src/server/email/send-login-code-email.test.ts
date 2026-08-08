// @vitest-environment node
//
// `RESEND_API_KEY` is a server variable, and `@t3-oss/env-nextjs` decides
// server-vs-client by looking for a `window`. Under the default jsdom
// environment there is one, so merely importing the Resend client throws
// "attempted to access a server-side environment variable on the client".

import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import { sendLoginCodeEmail } from "./send-login-code-email";

const RESEND_SEND_ENDPOINT = "https://api.resend.com/emails";

interface ResendSendBody {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}

/**
 * Registers a successful send and hands back the payload Resend actually
 * received, so assertions read the wire format rather than a mock's arguments.
 */
function captureSend() {
  const captured: { body?: ResendSendBody; authorization?: string } = {};

  server.use(
    http.post(RESEND_SEND_ENDPOINT, async ({ request }) => {
      captured.body = (await request.json()) as ResendSendBody;
      captured.authorization = request.headers.get("authorization") ?? "";

      return HttpResponse.json({ id: "8f1c4b6e-message-id" });
    }),
  );

  return captured;
}

const send = () =>
  sendLoginCodeEmail({
    email: "founder@example.com",
    code: "4821",
    type: "sign-in",
  });

beforeEach(() => {
  /*
   * The Resend SDK console.errors every non-2xx itself. The failure paths
   * below provoke exactly that on purpose, so silence it — otherwise a green
   * run is buried in red text that looks like something broke.
   */
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("sendLoginCodeEmail", () => {
  it("should post the rendered code email to Resend", async () => {
    const captured = captureSend();

    await send();

    expect(captured.body?.to).toEqual(["founder@example.com"]);
    expect(captured.body?.subject).toMatch(/login code/i);
    expect(captured.body?.html).toContain("4821");
    expect(captured.body?.text).toContain("4821");
  });

  it("should send from the configured address rather than a hardcoded one", async () => {
    const captured = captureSend();

    await send();

    // Matches the `EMAIL_FROM` stub in vitest.config.ts.
    expect(captured.body?.from).toBe("Test <login@test.example>");
  });

  it("should authenticate with the configured API key", async () => {
    const captured = captureSend();

    await send();

    expect(captured.authorization).toBe("Bearer test-resend-api-key");
  });

  it("should resolve once Resend accepts the message", async () => {
    captureSend();

    await expect(send()).resolves.toBeUndefined();
  });

  /*
   * The SDK reports API failures as a resolved `{ error }` rather than a
   * rejection. Left unchecked that reads as success, and the login page would
   * tell the user to check an inbox nothing was ever sent to.
   */
  it("should reject when Resend refuses the message", async () => {
    server.use(
      http.post(RESEND_SEND_ENDPOINT, () =>
        HttpResponse.json(
          {
            statusCode: 403,
            name: "validation_error",
            message: "The example.test domain is not verified.",
          },
          { status: 403 },
        ),
      ),
    );

    await expect(send()).rejects.toThrow(/not verified/i);
  });

  it("should reject when the request never reaches Resend", async () => {
    server.use(http.post(RESEND_SEND_ENDPOINT, () => HttpResponse.error()));

    await expect(send()).rejects.toThrow();
  });

  /*
   * A 200 with no message id means nothing was queued. Trusting the status
   * code alone would turn that into a silent drop.
   */
  it("should reject when Resend answers without a message id", async () => {
    server.use(http.post(RESEND_SEND_ENDPOINT, () => HttpResponse.json({})));

    await expect(send()).rejects.toThrow(/message id/i);
  });

  it("should name the failing cause so the server log is actionable", async () => {
    server.use(
      http.post(RESEND_SEND_ENDPOINT, () =>
        HttpResponse.json(
          {
            statusCode: 401,
            name: "restricted_api_key",
            message: "This API key is restricted to only send emails.",
          },
          { status: 401 },
        ),
      ),
    );

    await expect(send()).rejects.toThrow(/restricted_api_key/);
  });
});
