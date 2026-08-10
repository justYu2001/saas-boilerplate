import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import {
  SidebarAccount,
  type SidebarAccountUser,
} from "@/components/dashboard/sidebar-account";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { DASHBOARD_PATH } from "@/constants/dashboard";
import { cn } from "@/lib/utils";

interface SidebarBodyProps {
  user: SidebarAccountUser;
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * The rail's contents: lockup, navigation, account.
 *
 * Shared verbatim by the desktop rail and the mobile sheet, so the two can
 * never drift into different navigations. The sheet renders it in its
 * expanded state; only the rail has a collapsed one.
 */
export const SidebarBody = ({
  user,
  collapsed = false,
  onNavigate,
}: SidebarBodyProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center px-3">
        {/*
          The lockup leads to the app's home, not the marketing site — the
          convention for an app shell, and the only route back to
          `DASHBOARD_PATH` now that the root has no row of its own in the nav.
        */}
        <Link
          href={DASHBOARD_PATH}
          onClick={onNavigate}
          className="focus-visible:ring-ring/50 flex h-10 min-w-0 items-center overflow-hidden rounded-lg focus-visible:ring-3 focus-visible:outline-none"
        >
          {/*
            The mark is nudged onto the icon column the navigation below uses,
            so the lockup, every nav icon, and the avatar at the foot all sit on
            one vertical line — which is what lets the collapsed rail read as a
            single column rather than three things that happen to be narrow.
          */}
          <Logo
            className={cn(
              "motion-safe:transition-opacity motion-safe:duration-150",
              collapsed && "[&>span]:opacity-0 [&>svg]:mx-0.5",
            )}
          />
        </Link>
      </div>

      <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />

      <SidebarAccount user={user} collapsed={collapsed} />
    </div>
  );
};
