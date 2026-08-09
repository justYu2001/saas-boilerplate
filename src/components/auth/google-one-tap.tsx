"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { cancelOneTap, promptOneTap } from "@/lib/auth/one-tap";
import { authClient } from "@/server/better-auth/client";

/**
 * Google One Tap, for signed-out visitors to the marketing home page.
 *
 * Renders nothing. The prompt it triggers is drawn by the browser, pinned to
 * the top-right of the viewport and above the page — which is where the
 * navbar's "Log in" and "Get started" buttons also sit. It will cover them
 * while it is open. That overlap is accepted rather than worked around: the
 * prompt is a faster route to the same destination, and under FedCM the
 * browser owns the position, so there is nothing to move.
 *
 * Mounted at the one page that wants it instead of in `(marketing)/layout.tsx`
 * behind a pathname check. A list of excluded routes is the kind of thing that
 * rots — a fork adds `/blog` or `/privacy` and silently inherits a sign-in
 * prompt over its content. Placement makes the default silence: a new page has
 * to opt in by mounting this, and reading the page tells you whether it did.
 */
export function GoogleOneTap() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  /*
   * The signed-in check is deliberately client-side. Reading the session on
   * the server would mean calling `headers()` during the home page's render,
   * which opts the whole landing page out of static rendering for the sake of
   * a prompt that is not content. Deciding a beat late is free here: nothing
   * is waiting on the answer, so nothing flashes and nothing shifts.
   */
  useEffect(() => {
    if (isPending || session) return;

    void promptOneTap({
      onSignedIn: () => {
        /*
         * Already on the destination, so there is nowhere to navigate — but
         * the server components on screen were rendered for a stranger. This
         * re-renders them against the session cookie the callback just set.
         */
        router.refresh();
      },
      onDismissed: (notification) => {
        /*
         * The prompt failing to appear is indistinguishable from it never
         * having been asked for: no error, no console output, nothing in the
         * network tab. Nearly always it is benign — no Google session in this
         * browser, or the browser's own cooldown after earlier dismissals —
         * but during development it is the difference between a bug and
         * expected behaviour, so it is worth saying out loud.
         */
        if (process.env.NODE_ENV === "development") {
          console.info(
            "[one-tap] prompt closed without a sign-in",
            notification,
          );
        }
      },
    }).catch((error: unknown) => {
      // A real failure: Google's script did not load, or its callback threw.
      // Nothing is broken for the user, who still has both login routes.
      console.error("[one-tap] could not run", error);
    });

    return cancelOneTap;
  }, [isPending, session, router]);

  return null;
}
