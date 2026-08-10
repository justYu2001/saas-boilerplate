import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AUTH_NAV_COPY, LOGIN_PATH } from "@/constants/auth";
import { DASHBOARD_PATH } from "@/constants/dashboard";

import { Navbar } from "./navbar";

describe("Navbar", () => {
  it("should offer both auth entry points to a signed-out visitor", () => {
    render(<Navbar isSignedIn={false} />);

    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.logIn }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.signUp }),
    ).toBeInTheDocument();
  });

  it("should point both entry points at the login page for a signed-out visitor", () => {
    render(<Navbar isSignedIn={false} />);

    for (const label of [AUTH_NAV_COPY.logIn, AUTH_NAV_COPY.signUp]) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute(
        "href",
        LOGIN_PATH,
      );
    }
  });

  it("should drop the log-in entry point once the visitor is signed in, since they are already through that door", () => {
    render(<Navbar isSignedIn />);

    expect(
      screen.queryByRole("button", { name: AUTH_NAV_COPY.logIn }),
    ).not.toBeInTheDocument();
  });

  it("should keep the signed-in visitor's entry point on screen and send it to the dashboard", () => {
    render(<Navbar isSignedIn />);

    expect(
      screen.getByRole("button", { name: AUTH_NAV_COPY.signUp }),
    ).toHaveAttribute("href", DASHBOARD_PATH);
  });

  it("should keep the marketing navigation in place for a signed-in visitor", () => {
    render(<Navbar isSignedIn />);

    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();
  });
});
