import { Settings } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

/** The signed-in home, and where a completed login lands. */
export const DASHBOARD_PATH = "/dashboard";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * The sidebar's navigation, in display order.
 *
 * Every entry resolves to a real route. A nav that lists destinations the app
 * does not have teaches a fork the wrong lesson on its first read, so add the
 * page and the entry together.
 *
 * {@link DASHBOARD_PATH} is deliberately absent: it is the app's home, reached
 * by the lockup at the top of the rail the way a site's home is reached by its
 * logo, rather than by a row in the list. Nothing here may assume the root is
 * the first entry — see the note on `rootHref` in
 * `@/components/dashboard/sidebar-nav`.
 */
export const DASHBOARD_NAV: readonly DashboardNavItem[] = [
  { href: `${DASHBOARD_PATH}/settings`, label: "Settings", icon: Settings },
];

/**
 * Remembers whether the rail was left collapsed.
 *
 * A cookie rather than `localStorage` so the server already knows the width
 * when it renders the layout. `localStorage` is only readable after hydration,
 * which means the rail would always paint expanded and then snap narrow — a
 * visible flash on every single navigation for anyone who prefers it closed.
 */
export const SIDEBAR_COLLAPSED_COOKIE = "dashboard_sidebar_collapsed";

/** A year. This is a display preference; there is nothing to expire. */
export const SIDEBAR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Rail widths, fed to the layout as a custom property.
 *
 * Collapsed is derived from the contents rather than chosen: a `size-10` icon
 * box inside the rail's `px-3` gutters comes to exactly 4rem. That is what
 * keeps every icon on the same vertical line in both states — the box never
 * moves, only the label beside it is clipped away — so collapsing reads as the
 * rail closing over the labels rather than as the whole nav sliding sideways.
 */
export const SIDEBAR_WIDTH = {
  expanded: "16rem",
  collapsed: "4rem",
} as const;

/** Every user-facing string in the dashboard chrome, in one place to rebrand. */
export const DASHBOARD_COPY = {
  navLabel: "Dashboard",
  openMenu: "Open navigation",
  collapse: "Collapse sidebar",
  expand: "Expand sidebar",
  signedInAs: "Signed in as",
  signOut: "Sign out",
  signOutPending: "Signing out",
  signOutError: "We couldn't sign you out. Try again.",
} as const;

/**
 * Per-route copy for the pages themselves.
 *
 * The dashboard ships as a shell: the chrome is finished, and the overview is
 * deliberately empty so a fork's first feature is the first thing on it rather
 * than the second. That page says where its code lives instead of standing in
 * with sample charts a fork would have to find and delete — hence the optional
 * `source`, which belongs only to a page that has nothing on it yet.
 *
 * Settings is the exception, and the shape of what replaces the note: a real
 * section, built out of the same tokens, that a fork extends rather than
 * deletes.
 */
export const DASHBOARD_PAGE_COPY = {
  overview: {
    title: "Overview",
    description:
      "Your product's first screen lands here. Nothing is rendered yet.",
    source: "src/app/dashboard/page.tsx",
  },
  /*
   * The one page that is no longer a shell. Account is real, so the
   * description stops apologising for an empty canvas and says what is here —
   * and `source` goes with it, since a page carrying working controls no
   * longer has to explain itself with a file path.
   */
  settings: {
    title: "Settings",
    description: "Your account, and how you sign in to it.",
  },
} as const;
