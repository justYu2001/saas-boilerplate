"use client";

import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";
import Link from "next/link";
import { useState, type PropsWithChildren } from "react";

import { Logo } from "@/components/brand/logo";
import type { SidebarAccountUser } from "@/components/dashboard/sidebar-account";
import { SidebarBody } from "@/components/dashboard/sidebar-body";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DASHBOARD_COPY,
  DASHBOARD_PATH,
  SIDEBAR_COLLAPSED_COOKIE,
  SIDEBAR_COOKIE_MAX_AGE_SECONDS,
  SIDEBAR_WIDTH,
} from "@/constants/dashboard";

interface DashboardShellProps extends PropsWithChildren {
  user: SidebarAccountUser;
  /** Read from the cookie on the server, so the rail paints at its real width. */
  defaultCollapsed: boolean;
}

/**
 * Chrome for every signed-in route: a rail on the left, the canvas beside it.
 *
 * Two planes, not one. The rail sits on `--sidebar` and the canvas on
 * `--background`, which the token set separates in both themes — light puts the
 * rail a step below the page, dark puts it a step above. That is the whole
 * depth model here; there is no shadow under the rail, because a hairline
 * between two real surfaces is the more honest edge and survives dark mode,
 * where a drop shadow has nothing to fall on.
 */
export const DashboardShell = ({
  user,
  defaultCollapsed,
  children,
}: DashboardShellProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleCollapsed = () => {
    const next = !isCollapsed;

    setIsCollapsed(next);
    document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${String(next)}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  };

  return (
    <TooltipProvider delay={300}>
      <div
        className="flex min-h-svh"
        style={{
          "--sidebar-width": isCollapsed
            ? SIDEBAR_WIDTH.collapsed
            : SIDEBAR_WIDTH.expanded,
        }}
      >
        {/*
         * Width is a layout property and normally the wrong thing to animate.
         * It is the right thing here: the rail *is* the layout, there is no
         * transform that narrows a column without leaving the canvas behind,
         * and this fires once on a deliberate click rather than continuously.
         * Reduced motion still gets the instant snap.
         */}
        <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 z-20 hidden h-svh w-(--sidebar-width) shrink-0 border-r motion-safe:transition-[width] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] lg:block">
          <SidebarBody user={user} collapsed={isCollapsed} />

          {/*
            The handle straddles the rail's own border rather than sitting in
            the header, which is what keeps the collapsed rail a clean icon
            column — the control never moves between the two states, so the
            only thing that travels during the transition is the boundary it is
            attached to.

            Centred vertically, not aligned to the lockup: collapsed, the rail
            is 4rem and the mark fills every pixel of it, so a handle level with
            the header would sit on top of the logo. Halfway down there is
            nothing to collide with at any nav length, because the rail's own
            gutter already keeps content 12px clear of this edge.
          */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  aria-expanded={!isCollapsed}
                  aria-label={
                    isCollapsed
                      ? DASHBOARD_COPY.expand
                      : DASHBOARD_COPY.collapse
                  }
                  className="border-sidebar-border bg-background text-muted-foreground hover:text-foreground hover:border-ring/40 focus-visible:ring-ring/50 absolute top-1/2 -right-3 z-30 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-full border shadow-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
                />
              }
            >
              {isCollapsed ? (
                <ChevronsRight aria-hidden="true" className="size-3.5" />
              ) : (
                <ChevronsLeft aria-hidden="true" className="size-3.5" />
              )}
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {isCollapsed ? DASHBOARD_COPY.expand : DASHBOARD_COPY.collapse}
            </TooltipContent>
          </Tooltip>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/*
            Below `lg` the rail becomes a sheet. The bar it leaves behind is
            the same 3.5rem as the rail's lockup row, so the brand holds the
            same position on a phone as it does on a desktop.
          */}
          <header className="bg-background/85 border-border sticky top-0 z-20 flex h-14 shrink-0 items-center gap-1 border-b px-3 backdrop-blur-sm lg:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label={DASHBOARD_COPY.openMenu}
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent
                side="left"
                className="bg-sidebar text-sidebar-foreground border-sidebar-border gap-0 p-0 data-[side=left]:w-72 data-[side=left]:sm:max-w-none"
              >
                <SheetTitle className="sr-only">
                  {DASHBOARD_COPY.navLabel}
                </SheetTitle>

                <div className="min-h-0 flex-1">
                  <SidebarBody
                    user={user}
                    onNavigate={() => setIsMobileNavOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href={DASHBOARD_PATH}
              className="focus-visible:ring-ring/50 flex h-10 min-w-0 items-center rounded-lg focus-visible:ring-3 focus-visible:outline-none"
            >
              <Logo className="text-base [&>svg]:size-8" />
            </Link>
          </header>

          <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};
