import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DASHBOARD_COPY,
  DASHBOARD_NAV,
  DASHBOARD_PATH,
  SIDEBAR_COLLAPSED_COOKIE,
  SIDEBAR_WIDTH,
} from "@/constants/dashboard";

import { DashboardShell } from "./dashboard-shell";

vi.mock("@/server/better-auth/client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => DASHBOARD_PATH,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const USER = { name: "Ada Lovelace", email: "ada@example.com", image: null };

const renderShell = (defaultCollapsed = false) => {
  return render(
    <DashboardShell user={USER} defaultCollapsed={defaultCollapsed}>
      <p>Canvas</p>
    </DashboardShell>,
  );
};

/** The element carrying the width the rail is drawn at. */
const railWidth = () =>
  document
    .querySelector("aside")
    ?.parentElement?.style.getPropertyValue("--sidebar-width");

const toggle = (label: string) => screen.getByRole("button", { name: label });

beforeEach(() => {
  document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=; path=/; max-age=0`;
});

describe("DashboardShell", () => {
  it("should render the page it wraps", () => {
    renderShell();

    expect(screen.getByText("Canvas")).toBeInTheDocument();
  });

  it("should open at the width the server read from the cookie, so the rail never paints wide and snaps narrow", () => {
    renderShell(true);

    expect(railWidth()).toBe(SIDEBAR_WIDTH.collapsed);
    expect(toggle(DASHBOARD_COPY.expand)).toBeInTheDocument();
  });

  it("should narrow the rail when collapsed", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(toggle(DASHBOARD_COPY.collapse));

    expect(railWidth()).toBe(SIDEBAR_WIDTH.collapsed);
  });

  it("should widen the rail again when expanded", async () => {
    const user = userEvent.setup();
    renderShell(true);

    await user.click(toggle(DASHBOARD_COPY.expand));

    expect(railWidth()).toBe(SIDEBAR_WIDTH.expanded);
  });

  it("should remember the choice, so the next page load starts where the visitor left off", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(toggle(DASHBOARD_COPY.collapse));

    expect(document.cookie).toContain(`${SIDEBAR_COLLAPSED_COOKIE}=true`);
  });

  it("should report the rail's state to assistive technology", async () => {
    const user = userEvent.setup();
    renderShell();

    const control = toggle(DASHBOARD_COPY.collapse);
    expect(control).toHaveAttribute("aria-expanded", "true");

    await user.click(control);

    expect(toggle(DASHBOARD_COPY.expand)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("should offer the same navigation in the mobile sheet as in the rail", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(toggle(DASHBOARD_COPY.openMenu));

    const sheet = await screen.findByRole("dialog");

    for (const { href, label } of DASHBOARD_NAV) {
      expect(within(sheet).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  it("should keep the app's home reachable from the lockup, which is the only route back to it", () => {
    renderShell();

    const [lockup] = screen.getAllByRole("link", { name: /SaaS Boilerplate/ });
    expect(lockup).toHaveAttribute("href", DASHBOARD_PATH);
  });

  it("should close the mobile sheet once a destination is chosen, rather than leave it covering the page it just opened", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(toggle(DASHBOARD_COPY.openMenu));
    const sheet = await screen.findByRole("dialog");
    await user.click(within(sheet).getByRole("link", { name: "Settings" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
