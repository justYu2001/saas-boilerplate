/**
 * The word a user has to type before their account is deleted.
 *
 * Lowercase, and compared case-insensitively after trimming — a phone that
 * autocapitalises the first letter must not be the reason someone cannot
 * complete a deliberate action. What the gate is for is stopping a click that
 * was never deliberate, and typing five letters does that whatever their case.
 *
 * Translate this alongside {@link ACCOUNT_COPY} if the product is localised;
 * asking for an English word in a Japanese interface is a lock, not a
 * confirmation.
 */
export const DELETE_ACCOUNT_CONFIRMATION = "delete";

/**
 * Every user-facing string in the account settings section.
 *
 * In one place because this is the surface a fork rebrands first, and because
 * the deletion copy is the one place in the app where imprecise wording has a
 * cost that cannot be undone. Say what goes, say that it is permanent, and do
 * not soften either.
 */
export const ACCOUNT_COPY = {
  sectionTitle: "Account",

  emailLabel: "Email",
  nameLabel: "Name",
  memberSinceLabel: "Member since",

  deleteHeading: "Delete this account",
  /*
   * One line, because this one is read by everyone who scrolls past the
   * section rather than by someone who has decided. At that distance only the
   * irreversibility matters; the detail waits for the dialog.
   */
  deleteDescription: "Removes your account. There is no undo.",
  deleteAction: "Delete account",

  dialogTitle: "Delete your account?",
  /*
   * "All your data" is a claim, so it has to stay one. Everything that
   * references `user` cascades today — sessions, linked sign-in methods, and
   * the demo posts. A fork that adds a table without `onDelete: "cascade"`, or
   * that stores anything outside this database at all, either handles it in
   * the `beforeDelete` hook in `@/server/better-auth/config` or narrows this
   * sentence. Leaving both alone is how the promise quietly stops being true.
   */
  dialogBody: "This will delete all your data and it's irreversible.",

  /*
   * No trailing or leading space on either half. They sit either side of a
   * code chip in a flex row, so the gap between the three is set once in the
   * layout — a literal space here would land on top of it and leave the chip
   * further from one neighbour than the other.
   */
  confirmLabelPrefix: "Type",
  confirmLabelSuffix: "to confirm",
  /** Announced when the typed word matches; the check mark is its visual twin. */
  confirmMatched: "Confirmation word matched.",

  cancel: "Cancel",
  confirmAction: "Delete account",
  confirmActionPending: "Deleting account",

  genericError: "We couldn't delete your account. Try again in a moment.",
  /*
   * Better Auth refuses to delete an account from a session older than
   * `session.freshAge` — one day by default — and there is no password on this
   * account to prove intent with instead. A retry cannot clear that, so the
   * message names the only thing that can and the footer offers it.
   */
  staleSessionError:
    "For your security, deleting an account needs a recent login. Log in again, then try this once more.",
  staleSessionAction: "Log in again",
  staleSessionActionPending: "Signing out",
  signOutError: "We couldn't sign you out. Try again.",
} as const;
