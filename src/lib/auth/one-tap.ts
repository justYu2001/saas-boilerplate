import { authClient } from "@/server/better-auth/client";

/**
 * The One Tap half of the login page's transport layer in `./send-login-code`.
 *
 * It is separate because it obeys a different contract. Those functions settle
 * on the outcome of a request the user asked for. These wrap a prompt the user
 * did not ask for, shown by the browser rather than by us, whose most common
 * ending is that nothing happened at all.
 */

/**
 * The sliver of Google Identity Services this module touches.
 *
 * Better Auth loads the script and declares only `googleScriptInitialized` on
 * `Window`, so the namespace itself is untyped for callers. Declaring the whole
 * API would be a liability — this is the one method we call, and the plugin
 * exposes no wrapper for it.
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          cancel: () => void;
        };
      };
    };
  }
}

interface PromptOneTapOptions {
  /** Runs after Better Auth has accepted the id token and set the session. */
  onSignedIn: () => void;
  /**
   * Runs when the prompt ends without a sign-in — dismissed, skipped, or never
   * displayed at all. Receives Google's notification object, whose
   * `getNotDisplayedReason()` and `getSkippedReason()` are the only account of
   * why; there is no error and no other signal.
   */
  onDismissed: (notification?: unknown) => void;
}

/**
 * Shows the Google One Tap prompt and completes sign-in if the user takes it.
 *
 * Resolves when the prompt sequence is over, which says nothing about whether
 * anyone signed in — that is what `onSignedIn` is for. Rejects only if Google's
 * script cannot be loaded or its callback throws, so a rejection means the
 * feature is broken rather than declined.
 *
 * No `callbackURL` is passed. Supplying one makes Better Auth finish with
 * `window.location.href`, a full document load — wasteful here, since the
 * prompt only ever runs on the page it would be reloading. Passing
 * `fetchOptions` is what suppresses that redirect, leaving the caller to
 * re-render however it likes.
 */
export async function promptOneTap({
  onSignedIn,
  onDismissed,
}: PromptOneTapOptions): Promise<void> {
  await authClient.oneTap({
    onPromptNotification: onDismissed,
    fetchOptions: {
      onSuccess: () => onSignedIn(),
    },
  });
}

/**
 * Closes the prompt if it is open.
 *
 * Necessary because the prompt is not ours. It is painted by the browser
 * outside our React tree, so unmounting the component that asked for it leaves
 * it on screen — and since it is pinned to the viewport, it would follow the
 * user onto whatever page they navigated to next. Safe to call when the script
 * never loaded or no prompt is showing.
 */
export function cancelOneTap(): void {
  window.google?.accounts.id.cancel();
}
