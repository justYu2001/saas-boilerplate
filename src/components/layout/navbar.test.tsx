import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_NAV_COPY, LOGIN_PATH } from "@/constants/auth";
import { DASHBOARD_PATH } from "@/constants/dashboard";

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

  it("should point both entry points at the login page for a signed-out visitor", () => {
    render(<Navbar />);

    for (const label of [AUTH_NAV_COPY.logIn, AUTH_NAV_COPY.signUp]) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute(
        "href",
        LOGIN_PATH,
      );
    }
  });

  it("should drop the log-in entry point once the visitor is signed in, since they are already through that door", () => {
    useSession.mockReturnValue(SESSION_STATES.signedIn);

    render(<Navbar />);

    expect(
      screen.queryByRole("button", { name: AUTH_NAV_COPY.logIn }),
    ).not.toBeInTheDocument();
  });

  it("should keep the signed-in visitor's entry point on screen and send it to the dashboard", () => {
    useSession.mockReturnValue(SESSION_STATES.signedIn);

    render(<Navbar />);

    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.signUp }),
    ).toHaveAttribute("href", DASHBOARD_PATH);
  });

  it("should withhold the auth entry points while the session is still resolving, rather than send a signed-in user to a login page it has to take back", () => {
    useSession.mockReturnValue(SESSION_STATES.loading);

    render(<Navbar />);

    for (const label of [AUTH_NAV_COPY.logIn, AUTH_NAV_COPY.signUp]) {
      expect(
        screen.queryByRole("button", { name: label }),
      ).not.toBeInTheDocument();
    }
  });

  it("should keep the marketing navigation in place for a signed-in visitor", () => {
    useSession.mockReturnValue(SESSION_STATES.signedIn);

    render(<Navbar />);

    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();
  });
});
