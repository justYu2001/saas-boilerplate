import { http, HttpResponse, type PathParams } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import { cancelOneTap, promptOneTap } from "./one-tap";

/*
 * Driven through MSW against the real Better Auth route, for the same reason
 * as `./send-login-code.test.ts`: what breaks here is wiring, and a mocked
 * client would only ever agree with whatever this file happens to do.
 *
 * Google Identity Services is stubbed instead of loaded — jsdom will not fetch
 * a cross-origin script, so the plugin's loader would hang forever. Setting
 * `googleScriptInitialized` is how the plugin is told the script is already
 * there.
 */
const ONE_TAP_CALLBACK_ENDPOINT =
  "http://localhost:3000/api/auth/one-tap/callback";

const AN_ID_TOKEN = "an.id.token";

interface InitializeConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
}

/** Google's notification object, reduced to the two methods the plugin reads. */
const A_USER_DISMISSAL = {
  isDismissedMoment: () => true,
  getDismissedReason: () => "cancel_called",
};

let initializeConfig: InitializeConfig | undefined;
const cancel = vi.fn();
/** Set per test to decide what Google "does" when the prompt is requested. */
let onPromptRequested: (notify: (notification: unknown) => void) => void;

/*
 * The stub is necessarily wider than the `Window.google` declaration in
 * `./one-tap.ts`, which covers only the one method production calls. Here we
 * are impersonating Google, not consuming it. Assigned through a binding rather
 * than inline, so the extra methods are read as structural width rather than as
 * excess properties on a fresh object literal.
 */
const installGoogleStub = () => {
  const google = {
    accounts: {
      id: {
        initialize: (config: InitializeConfig) => {
          initializeConfig = config;
        },
        prompt: (notify: (notification: unknown) => void) =>
          onPromptRequested(notify),
        cancel,
      },
    },
  };

  window.googleScriptInitialized = true;
  window.google = google;
};

/** Answers the callback endpoint and records what was posted to it. */
const captureCallback = () => {
  const captured: { body?: Record<string, unknown> } = {};

  server.use(
    http.post<PathParams, Record<string, unknown>>(
      ONE_TAP_CALLBACK_ENDPOINT,
      async ({ request }) => {
        captured.body = await request.json();

        return HttpResponse.json({
          token: "a-session-token",
          user: { id: "user_1", email: "founder@example.com" },
        });
      },
    ),
  );

  return captured;
};

beforeEach(() => {
  initializeConfig = undefined;
  onPromptRequested = () => undefined;
  installGoogleStub();
});

afterEach(() => {
  delete window.google;
  delete window.googleScriptInitialized;
});

describe("promptOneTap", () => {
  it("should post the id token Google hands back to the one-tap callback route", async () => {
    const captured = captureCallback();
    const onSignedIn = vi.fn();

    const pending = promptOneTap({ onSignedIn, onDismissed: vi.fn() });

    await vi.waitFor(() => expect(initializeConfig).toBeDefined());
    initializeConfig?.callback({ credential: AN_ID_TOKEN });
    await pending;

    expect(captured.body).toMatchObject({ idToken: AN_ID_TOKEN });
    expect(onSignedIn).toHaveBeenCalled();
  });

  it("should send no callbackURL, so Better Auth does not hard-navigate away from the page the prompt is on", async () => {
    const captured = captureCallback();

    const pending = promptOneTap({
      onSignedIn: vi.fn(),
      onDismissed: vi.fn(),
    });

    await vi.waitFor(() => expect(initializeConfig).toBeDefined());
    initializeConfig?.callback({ credential: AN_ID_TOKEN });
    await pending;

    expect(captured.body?.callbackURL).toBeUndefined();
  });

  it("should initialize Google with the configured client ID", async () => {
    captureCallback();

    const pending = promptOneTap({
      onSignedIn: vi.fn(),
      onDismissed: vi.fn(),
    });

    await vi.waitFor(() => expect(initializeConfig).toBeDefined());
    initializeConfig?.callback({ credential: AN_ID_TOKEN });
    await pending;

    expect(initializeConfig?.client_id).toBe("test-client-id");
  });

  it("should report a dismissal without treating it as a failure", async () => {
    const onDismissed = vi.fn();
    const onSignedIn = vi.fn();
    onPromptRequested = (notify) => notify(A_USER_DISMISSAL);

    await promptOneTap({ onSignedIn, onDismissed });

    expect(onDismissed).toHaveBeenCalledWith(A_USER_DISMISSAL);
    expect(onSignedIn).not.toHaveBeenCalled();
  });
});

describe("cancelOneTap", () => {
  it("should close an open prompt", () => {
    cancelOneTap();

    expect(cancel).toHaveBeenCalled();
  });

  it("should do nothing when the Google script never loaded", () => {
    delete window.google;

    expect(() => cancelOneTap()).not.toThrow();
  });
});
