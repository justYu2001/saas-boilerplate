import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_NAV_COPY } from "@/constants/auth";

import { Navbar } from "./navbar";

/*
 * Only `useSession` is reached from this component, and mocking the client
 * whole keeps the real one from being constructed — it registers the One Tap
 * plugin, which wants a Google script jsdom cannot fetch.
 */
const useSession = vi.fn();

vi.mock("@/server/better-auth/client", () => ({
  authClient: { useSession: () => useSession() as unknown },
}));

/** The three shapes `useSession` can be in while the header is on screen. */
const SESSION_STATES = {
  loading: { data: null, isPending: true },
  signedOut: { data: null, isPending: false },
  signedIn: { data: { user: { id: "user_1" } }, isPending: false },
} as const;

beforeEach(() => {
  useSession.mockReturnValue(SESSION_STATES.signedOut);
});

describe("Navbar", () => {
  it("should offer both auth entry points to a signed-out visitor", () => {
    render(<Navbar />);

    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.logIn }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.signUp }),
    ).toBeInTheDocument();
  });

  it("should hide both auth entry points once the visitor is signed in", () => {
    useSession.mockReturnValue(SESSION_STATES.signedIn);

    render(<Navbar />);

    expect(
      screen.queryByRole("button", { name: AUTH_NAV_COPY.logIn }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: AUTH_NAV_COPY.signUp }),
    ).not.toBeInTheDocument();
  });

  it("should withhold the auth entry points while the session is still resolving, rather than show a signed-in user a login link it has to take back", () => {
    useSession.mockReturnValue(SESSION_STATES.loading);

    render(<Navbar />);

    expect(
      screen.queryByRole("button", { name: AUTH_NAV_COPY.logIn }),
    ).not.toBeInTheDocument();
  });

  it("should keep the marketing navigation in place for a signed-in visitor", () => {
    useSession.mockReturnValue(SESSION_STATES.signedIn);

    render(<Navbar />);

    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();
  });
});
