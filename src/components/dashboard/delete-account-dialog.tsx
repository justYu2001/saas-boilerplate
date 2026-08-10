"use client";

import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACCOUNT_COPY, DELETE_ACCOUNT_CONFIRMATION } from "@/constants/account";
import { LOGIN_PATH } from "@/constants/auth";
import {
  deleteAccount,
  DeleteAccountError,
  type DeleteAccountFailure,
} from "@/lib/auth/delete-account";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/client";

/*
 * `idle` → `deleting` → `leaving`. The last one exists because the account is
 * already gone by then and the route transition has not finished: without it
 * the button would drop back to its resting label and sit there looking
 * untouched, inviting a second press at a session that no longer exists.
 */
type Status = "idle" | "deleting" | "leaving";

/** Trimmed and case-insensitive — see the note on the constant. */
const matchesConfirmation = (value: string) =>
  value.trim().toLowerCase() === DELETE_ACCOUNT_CONFIRMATION;

export function DeleteAccountDialog() {
  const router = useRouter();
  const confirmationId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [failure, setFailure] = React.useState<DeleteAccountFailure | null>(
    null,
  );
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [hasSignOutFailed, setHasSignOutFailed] = React.useState(false);

  const isConfirmed = matchesConfirmation(confirmation);
  const isBusy = status !== "idle" || isSigningOut;
  /*
   * A session too old to authorise this cannot be talked round by trying
   * again, so the destructive action leaves the footer entirely and the only
   * thing that would help takes its place.
   */
  const needsFreshLogin = failure === "stale-session";

  function handleOpenChange(open: boolean) {
    // Nothing may close the dialog while the request is in flight — not the
    // Escape key, and not the cancel button. There is no request to cancel.
    if (isBusy) return;

    setIsOpen(open);

    if (!open) {
      setConfirmation("");
      setStatus("idle");
      setFailure(null);
      setHasSignOutFailed(false);
    }
  }

  async function handleDelete(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfirmed || isBusy) return;

    setStatus("deleting");
    setFailure(null);

    try {
      await deleteAccount();

      setStatus("leaving");
      /*
       * `replace`, not `push`: `/dashboard` must not be somewhere the back
       * button can return to. `refresh` then discards the cached server
       * renders taken while the session existed — they were rendered for a
       * user the database no longer has.
       */
      router.replace("/");
      router.refresh();
    } catch (error) {
      setStatus("idle");
      setFailure(
        error instanceof DeleteAccountError ? error.reason : "unknown",
      );
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setHasSignOutFailed(false);

    const { error } = await authClient.signOut();

    if (error) {
      setHasSignOutFailed(true);
      setIsSigningOut(false);
      return;
    }

    router.push(LOGIN_PATH);
    router.refresh();
  }

  const isDeleting = status !== "idle";
  const errorMessage = hasSignOutFailed
    ? ACCOUNT_COPY.signOutError
    : needsFreshLogin
      ? ACCOUNT_COPY.staleSessionError
      : failure
        ? ACCOUNT_COPY.genericError
        : null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={<Button variant="destructive" size="lg" type="button" />}
      >
        {ACCOUNT_COPY.deleteAction}
      </AlertDialogTrigger>

      <AlertDialogContent className="data-[size=default]:sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive-emphasis">
            <TriangleAlert aria-hidden="true" />
          </AlertDialogMedia>

          <AlertDialogTitle>{ACCOUNT_COPY.dialogTitle}</AlertDialogTitle>

          <AlertDialogDescription>
            {ACCOUNT_COPY.dialogBody}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleDelete} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={confirmationId} className="gap-1.5">
              {ACCOUNT_COPY.confirmLabelPrefix}
              {/*
                The literal, set as one — the same chip the dashboard uses for
                a path you have to type. Quotation marks would leave it unclear
                whether they are part of the word.
              */}
              <code className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-[0.8125rem]">
                {DELETE_ACCOUNT_CONFIRMATION}
              </code>
              {ACCOUNT_COPY.confirmLabelSuffix}
            </Label>

            <div className="relative">
              <Input
                id={confirmationId}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={isBusy}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="h-9 pr-9"
              />

              {/*
                Confirmation that the field is right before the eye travels to
                a button that may still look inert. Without it, a trailing
                space is invisible and the only feedback is a control that
                refuses to enable for no stated reason.
              */}
              <Check
                aria-hidden="true"
                className={cn(
                  "text-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                  isConfirmed ? "scale-100 opacity-100" : "scale-75 opacity-0",
                )}
              />
            </div>

            {/* The check mark's twin, for anyone who is not looking at it. */}
            <span aria-live="polite" aria-atomic="true" className="sr-only">
              {isConfirmed ? ACCOUNT_COPY.confirmMatched : ""}
            </span>
          </div>

          {/*
            Kept mounted and empty so a message lands in a region that was
            already there — some screen readers miss an alert inserted at the
            same moment as its text.
          */}
          <p
            role="alert"
            className={cn(
              "text-destructive-emphasis text-sm leading-snug",
              !errorMessage && "sr-only",
            )}
          >
            {errorMessage ?? ""}
          </p>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>
              {ACCOUNT_COPY.cancel}
            </AlertDialogCancel>

            {needsFreshLogin ? (
              <Button
                type="button"
                variant="secondary"
                disabled={isSigningOut}
                aria-busy={isSigningOut}
                onClick={handleSignOut}
              >
                {isSigningOut && (
                  <LoaderCircle
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                )}
                {isSigningOut
                  ? ACCOUNT_COPY.staleSessionActionPending
                  : ACCOUNT_COPY.staleSessionAction}
              </Button>
            ) : (
              <AlertDialogAction
                type="submit"
                variant="destructive"
                disabled={!isConfirmed || isBusy}
                aria-busy={isDeleting}
              >
                {isDeleting && (
                  <LoaderCircle
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                )}
                {isDeleting
                  ? ACCOUNT_COPY.confirmActionPending
                  : ACCOUNT_COPY.confirmAction}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
