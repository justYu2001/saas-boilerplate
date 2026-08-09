import { DASHBOARD_PATH } from "@/constants/dashboard";

/**
 * Whether a navigation entry is the section the visitor is currently in.
 *
 * Two rules, because the dashboard root is not like the entries under it.
 *
 * The root is matched exactly. Every other route in the app starts with it, so
 * a prefix test would mark a root entry current on every page there is — which
 * is why this rule has to be named rather than inferred from a list position.
 *
 * Everything else matches its whole subtree, so `/dashboard/settings/billing`
 * still shows Settings as the section it belongs to. The separator in the
 * prefix is load-bearing: without it, `/dashboard/settings-archive` would count
 * as living inside `/dashboard/settings`.
 *
 * Lives here rather than beside the component because it outlives any one
 * arrangement of {@link DASHBOARD_NAV} — a fork that puts the root back in the
 * list gets the correct behaviour without re-deriving it.
 */
export function isNavItemCurrent(pathname: string, href: string): boolean {
  if (href === DASHBOARD_PATH) {
    return pathname === DASHBOARD_PATH;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
