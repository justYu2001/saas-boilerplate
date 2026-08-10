import { authClient } from "@/server/better-auth/client";

/**
 * Why a deletion did not happen.
 *
 * Two cases, because only two lead anywhere different. `stale-session` has a
 * recovery the user can perform; everything else is a retry.
 */
export type DeleteAccountFailure = "stale-session" | "unknown";

/**
 * Better Auth's code for a session too old to authorise a sensitive action.
 *
 * Spelled out rather than imported: it reaches the browser as a string in the
 * response body, and the constant that produces it is not part of the client
 * package's public surface.
 */
const STALE_SESSION_CODE = "SESSION_EXPIRED";

export class DeleteAccountError extends Error {
  readonly reason: DeleteAccountFailure;

  constructor(reason: DeleteAccountFailure, message: string) {
    super(message);
    this.name = "DeleteAccountError";
    this.reason = reason;
  }
}

/**
 * Deletes the signed-in user's account.
 *
 * Resolves on success and rejects with a {@link DeleteAccountError} otherwise,
 * which is the contract the dialog's loading and error states are built
 * against — the same one `./send-login-code` uses, so the two read alike.
 *
 * The server clears the session cookie in the response, so a caller only has
 * to navigate away. It does not have to sign out first, and must not: the
 * endpoint needs the session it is deleting.
 *
 * Every row that references the user goes with it, by `on delete cascade` in
 * `@/server/db/schema` — sessions, linked provider accounts, and the demo
 * posts. Anything a fork stores outside that graph, or outside the database
 * entirely, belongs in the `beforeDelete` hook in
 * `@/server/better-auth/config`, not here: this runs in the browser and a
 * closed tab would skip it.
 */
export const deleteAccount = async () => {
  const { error } = await authClient.deleteUser({});

  if (!error) return;

  throw new DeleteAccountError(
    error.code === STALE_SESSION_CODE ? "stale-session" : "unknown",
    error.message ?? "Better Auth refused to delete the account.",
  );
};
