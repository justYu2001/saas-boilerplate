"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DASHBOARD_COPY, DASHBOARD_NAV } from "@/constants/dashboard";
import { isNavItemCurrent } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  /** Clips the labels away and leaves the icon column. */
  collapsed?: boolean;
  /** Closes the mobile sheet once a destination is chosen. */
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={DASHBOARD_COPY.navLabel}
      className="min-h-0 flex-1 overflow-y-auto px-3"
    >
      <ul className="flex flex-col gap-0.5">
        {DASHBOARD_NAV.map(({ href, label, icon: Icon }) => {
          const current = isNavItemCurrent(pathname, href);

          const link = (
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={cn(
                "focus-visible:border-ring focus-visible:ring-ring/50 flex h-10 w-full items-center overflow-hidden rounded-lg border border-transparent bg-clip-padding text-sm outline-none focus-visible:ring-3",
                /*
                 * The current section is drawn on `--background`: the exact
                 * surface of the canvas it opens. The rail is a step off that
                 * plane in both themes, so the active row reads as a piece of
                 * the content pane cut into the nav rather than as a coloured
                 * pill laid on top of it — and it stays legible without
                 * spending the brand orange on a fill that cannot carry text
                 * at AA.
                 */
                current
                  ? "bg-background border-sidebar-border text-foreground font-medium shadow-xs"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center">
                <Icon aria-hidden="true" className="size-[1.125rem]" />
              </span>

              <span
                className={cn(
                  "truncate pr-3 whitespace-nowrap motion-safe:transition-opacity motion-safe:duration-150",
                  collapsed && "opacity-0",
                )}
              >
                {label}
              </span>
            </Link>
          );

          return (
            <li key={href}>
              {/*
                The label is clipped by the rail, not hidden from assistive
                technology — it is still in the accessibility tree, so the
                tooltip is for sighted pointer and keyboard users only.
              */}
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger render={link} />
                  <TooltipContent side="right" sideOffset={8}>
                    {label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                link
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
