"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DASHBOARD_COPY } from "@/constants/dashboard";
import { resolveAccountName, type AccountIdentity } from "@/lib/account";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/client";

export type SidebarAccountUser = AccountIdentity;

interface SidebarAccountProps {
  user: SidebarAccountUser;
  /** Drops the identity text and leaves an icon-only control. */
  collapsed?: boolean;
}

/**
 * Who is signed in, and the way out.
 *
 * One line of identity, never two: {@link resolveAccountName} already falls
 * back to the address for an account that has no name of its own, so printing
 * the address underneath as well would only repeat it for exactly the people it
 * tells nothing new.
 */
export function SidebarAccount({
  user,
  collapsed = false,
}: SidebarAccountProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [hasFailed, setHasFailed] = React.useState(false);

  const name = resolveAccountName(user);

  async function handleSignOut() {
    setIsSigningOut(true);
    setHasFailed(false);

    const { error } = await authClient.signOut();

    if (error) {
      /*
       * The session may well be gone server-side even so, but this component
       * cannot tell — and silently sending someone to the marketing page as
       * though it worked is the one outcome that leaves them unsure whether
       * they are still signed in. Say it failed and let them retry.
       */
      setHasFailed(true);
      setIsSigningOut(false);
      return;
    }

    router.push("/");
    /*
     * The dashboard layout reads the session on the server, so the cache entry
     * for every route this user has visited still holds a signed-in render.
     * Without the refresh, a back navigation would show the shell again.
     */
    router.refresh();
  }

  const signOutLabel = isSigningOut
    ? DASHBOARD_COPY.signOutPending
    : DASHBOARD_COPY.signOut;

  return (
    // The block sits on the bottom edge of a full-height rail, and on a phone
    // that edge is under the home indicator. The gutter grows to clear it and
    // stays at 0.75rem everywhere else.
    <div className="px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Separator className="bg-sidebar-border mb-2" />

      {/*
        `sr-only` rather than a fade when the rail closes: with no avatar left
        holding the row open, keeping the text in the layout would reserve
        40px of blank rail for something invisible. Removing it from the flow
        instead lets the footer close up around the one control that survives,
        and because the footer is anchored to the bottom of the rail, that
        control does not move while it happens. The name stays announced.
      */}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-y-1 pl-2",
          collapsed && "sr-only",
        )}
      >
        <span className="text-muted-foreground text-[0.6875rem] leading-4 whitespace-nowrap">
          {DASHBOARD_COPY.signedInAs}
        </span>

        <span
          className="text-foreground truncate text-sm leading-4 font-medium"
          title={name}
        >
          {name}
        </span>
      </div>

      <div className="mt-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  disabled={isSigningOut}
                  aria-invalid={hasFailed || undefined}
                  onClick={handleSignOut}
                  className={cn(
                    "size-10",
                    hasFailed && "text-destructive hover:text-destructive",
                  )}
                />
              }
            >
              <LogOut aria-hidden="true" className="size-4.5" />

              <span className="sr-only">{signOutLabel}</span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {hasFailed ? DASHBOARD_COPY.signOutError : signOutLabel}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="outline"
            size="lg"
            disabled={isSigningOut}
            aria-invalid={hasFailed || undefined}
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut aria-hidden="true" data-icon="inline-start" />
            {signOutLabel}
          </Button>
        )}
      </div>

      {/*
        Announced either way. The collapsed rail has no room to print it, so
        sighted users get the message through the tooltip and the control's
        invalid styling while this stays the assistive-technology copy.
      */}
      <p
        role="alert"
        className={cn(
          "text-destructive mt-2 text-xs",
          (!hasFailed || collapsed) && "sr-only",
        )}
      >
        {hasFailed ? DASHBOARD_COPY.signOutError : ""}
      </p>
    </div>
  );
}
