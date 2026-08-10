import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DASHBOARD_NAV, DASHBOARD_PATH } from "@/constants/dashboard";

import { SidebarNav } from "./sidebar-nav";

const usePathname = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

const SETTINGS_PATH = `${DASHBOARD_PATH}/settings`;

/** The rendered link for a nav entry, by its label. */
const linkFor = (label: string) => screen.getByRole("link", { name: label });

beforeEach(() => {
  usePathname.mockReturnValue(DASHBOARD_PATH);
});

describe("SidebarNav", () => {
  it("should render every configured destination", () => {
    render(<SidebarNav />);

    for (const { href, label } of DASHBOARD_NAV) {
      expect(linkFor(label)).toHaveAttribute("href", href);
    }
  });

  it("should mark the page the visitor is on as current", () => {
    usePathname.mockReturnValue(SETTINGS_PATH);

    render(<SidebarNav />);

    expect(linkFor("Settings")).toHaveAttribute("aria-current", "page");
  });

  it("should keep a section current on its own sub-routes", () => {
    usePathname.mockReturnValue(`${SETTINGS_PATH}/billing`);

    render(<SidebarNav />);

    expect(linkFor("Settings")).toHaveAttribute("aria-current", "page");
  });

  /*
   * The dashboard root is not a row in this list — it is reached by the lockup
   * at the top of the rail — so no entry may claim to be current merely
   * because the visitor is on it. The matching rule itself is covered in
   * `@/lib/dashboard-nav`.
   */
  it("should mark nothing current on the dashboard root, which has no entry of its own", () => {
    usePathname.mockReturnValue(DASHBOARD_PATH);

    render(<SidebarNav />);

    for (const { label } of DASHBOARD_NAV) {
      expect(linkFor(label)).not.toHaveAttribute("aria-current");
    }
  });

  it("should not list the dashboard root as a destination", () => {
    render(<SidebarNav />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("href", DASHBOARD_PATH);
    }
  });

  it("should keep every label in the accessibility tree when collapsed, so the icon column stays navigable by name", () => {
    render(<SidebarNav collapsed />);

    for (const { label } of DASHBOARD_NAV) {
      expect(linkFor(label)).toBeInTheDocument();
    }
  });
});
