import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOGIN_REDIRECT_PATH } from "@/constants/auth";
import { cancelOneTap, promptOneTap } from "@/lib/auth/one-tap";

import { GoogleOneTap } from "./google-one-tap";

vi.mock("@/lib/auth/one-tap", () => ({
  promptOneTap: vi.fn(),
  cancelOneTap: vi.fn(),
}));

/*
 * Only `useSession` is reached from this component. Mocking the client whole
 * also keeps the real one from being constructed, which would load the Google
 * script plugin into a jsdom that has no `accounts.google.com` to fetch it
 * from.
 */
const useSession = vi.fn<() => unknown>();

vi.mock("@/server/better-auth/client", () => ({
  authClient: { useSession: () => useSession() },
}));

const routerRefresh = vi.fn();
const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh, push: routerPush }),
}));

const promptOneTapMock = vi.mocked(promptOneTap);
const cancelOneTapMock = vi.mocked(cancelOneTap);

/** The three shapes `useSession` can be in while the page is open. */
const SESSION_STATES = {
  loading: { data: null, isPending: true },
  signedOut: { data: null, isPending: false },
  signedIn: { data: { user: { id: "user_1" } }, isPending: false },
} as const;

beforeEach(() => {
  promptOneTapMock.mockResolvedValue(undefined);
  useSession.mockReturnValue(SESSION_STATES.signedOut);
});

describe("GoogleOneTap", () => {
  it("should prompt a signed-out visitor", async () => {
    render(<GoogleOneTap />);

    await waitFor(() => expect(promptOneTapMock).toHaveBeenCalled());
  });

  it("should not prompt while the session is still resolving", () => {
    useSession.mockReturnValue(SESSION_STATES.loading);

    render(<GoogleOneTap />);

    expect(promptOneTapMock).not.toHaveBeenCalled();
  });

  it("should not prompt a visitor who is already signed in", () => {
    useSession.mockReturnValue(SESSION_STATES.signedIn);

    render(<GoogleOneTap />);

    expect(promptOneTapMock).not.toHaveBeenCalled();
  });

  it("should render nothing", () => {
    const { container } = render(<GoogleOneTap />);

    expect(container).toBeEmptyDOMElement();
  });

  it("should send a signed-in visitor to the same place the login page does", async () => {
    render(<GoogleOneTap />);

    await waitFor(() => expect(promptOneTapMock).toHaveBeenCalled());
    promptOneTapMock.mock.calls[0]?.[0]?.onSignedIn();

    expect(routerPush).toHaveBeenCalledWith(LOGIN_REDIRECT_PATH);
  });

  it("should refresh once a sign-in lands, so server components re-render with the session", async () => {
    render(<GoogleOneTap />);

    await waitFor(() => expect(promptOneTapMock).toHaveBeenCalled());
    promptOneTapMock.mock.calls[0]?.[0]?.onSignedIn();

    expect(routerRefresh).toHaveBeenCalled();
  });

  it("should close the prompt on unmount, so it cannot follow the user to the next page", async () => {
    const { unmount } = render(<GoogleOneTap />);

    await waitFor(() => expect(promptOneTapMock).toHaveBeenCalled());
    unmount();

    expect(cancelOneTapMock).toHaveBeenCalled();
  });

  it("should survive a prompt that fails outright", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    promptOneTapMock.mockRejectedValue(new Error("script blocked"));

    render(<GoogleOneTap />);

    await waitFor(() => expect(consoleError).toHaveBeenCalled());
  });

  it("should not report a dismissal as a failure", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<GoogleOneTap />);

    await waitFor(() => expect(promptOneTapMock).toHaveBeenCalled());
    promptOneTapMock.mock.calls[0]?.[0]?.onDismissed();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
