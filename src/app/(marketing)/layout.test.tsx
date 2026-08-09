import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_NAV_COPY, LOGIN_PATH } from "@/constants/auth";
import { DASHBOARD_PATH } from "@/constants/dashboard";

import MarketingLayout from "./layout";

/*
 * Mocked whole rather than stubbed at the request level: the real module
 * reaches Better Auth, which builds a database client on import. Only the
 * answer matters here — whether a session exists — not how it was reached.
 */
const getSession = vi.fn<() => Promise<{ user: { id: string } } | null>>();

vi.mock("@/server/better-auth/server", () => ({
  getSession: () => getSession(),
}));

const renderLayout = async () =>
  render(await MarketingLayout({ children: <p>Marketing page</p> }));

beforeEach(() => {
  getSession.mockResolvedValue(null);
});

describe("MarketingLayout", () => {
  it("should send a signed-out visitor's entry point to the login page", async () => {
    await renderLayout();

    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.signUp }),
    ).toHaveAttribute("href", LOGIN_PATH);
  });

  /*
   * The point of reading the session here: the signed-in header is decided
   * before the response leaves, so this destination is in the first HTML
   * rather than swapped in once a client-side session request comes back.
   */
  it("should send a signed-in visitor's entry point straight to the dashboard", async () => {
    getSession.mockResolvedValue({ user: { id: "user_1" } });

    await renderLayout();

    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.signUp }),
    ).toHaveAttribute("href", DASHBOARD_PATH);
  });

  it("should keep the page below the header", async () => {
    await renderLayout();

    expect(screen.getByText("Marketing page")).toBeInTheDocument();
  });
});
