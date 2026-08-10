import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ACCOUNT_COPY, DELETE_ACCOUNT_CONFIRMATION } from "@/constants/account";
import { LOGIN_PATH } from "@/constants/auth";

import { DeleteAccountDialog } from "./delete-account-dialog";

const deleteUser = vi.fn<(body: unknown) => Promise<unknown>>();
const signOut = vi.fn<() => Promise<unknown>>();
const replace = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

/*
 * Mocking the client whole keeps the real one from being constructed — it
 * registers the One Tap plugin, which wants a Google script jsdom cannot
 * fetch. The real `deleteAccount` still runs on top of it, so the reason
 * mapping this component branches on is exercised rather than stubbed.
 */
vi.mock("@/server/better-auth/client", () => ({
  authClient: {
    deleteUser: (body: unknown) => deleteUser(body),
    signOut: () => signOut(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push, refresh }),
}));

const openButton = () =>
  screen.getByRole("button", { name: ACCOUNT_COPY.deleteAction });
const confirmButton = () =>
  screen.getByRole("button", { name: ACCOUNT_COPY.confirmAction });
const confirmField = () =>
  screen.getByLabelText(
    new RegExp(
      `${ACCOUNT_COPY.confirmLabelPrefix}\\s*${DELETE_ACCOUNT_CONFIRMATION}`,
    ),
  );

/** Opens the dialog and returns the confirmation field waiting inside it. */
const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(openButton());
  await screen.findByRole("alertdialog");

  return confirmField();
};

/** Opens, types the word, and presses the button through. */
const confirmDeletion = async (
  user: ReturnType<typeof userEvent.setup>,
  typed = DELETE_ACCOUNT_CONFIRMATION,
) => {
  await user.type(await open(user), typed);
  await user.click(confirmButton());
};

beforeEach(() => {
  deleteUser.mockResolvedValue({ data: { success: true }, error: null });
  signOut.mockResolvedValue({ data: { success: true }, error: null });
});

describe("DeleteAccountDialog", () => {
  it("should not delete anything until the dialog has been opened", () => {
    render(<DeleteAccountDialog />);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("should warn what is lost and that it is permanent", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await open(user);

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      ACCOUNT_COPY.dialogBody,
    );
  });

  it("should hold the deletion behind the typed word", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await open(user);

    expect(confirmButton()).toBeDisabled();
  });

  it("should keep the deletion locked while the field holds something else", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await user.type(await open(user), "remove");

    expect(confirmButton()).toBeDisabled();
  });

  it("should release the deletion once the word matches", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await user.type(await open(user), DELETE_ACCOUNT_CONFIRMATION);

    expect(confirmButton()).toBeEnabled();
  });

  /*
   * A phone that autocapitalises the first letter, or a paste that carried a
   * trailing space, must not be the reason a deliberate action cannot be
   * completed. The gate is against the unintended click, not against typing.
   */
  it("should accept the word whatever its case and surrounding space", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await user.type(await open(user), " Delete ");

    expect(confirmButton()).toBeEnabled();
  });

  it("should announce the match to anyone who cannot see the check mark", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await user.type(await open(user), DELETE_ACCOUNT_CONFIRMATION);

    expect(screen.getByText(ACCOUNT_COPY.confirmMatched)).toBeInTheDocument();
  });

  it("should delete the account once confirmed", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);

    await waitFor(() => expect(deleteUser).toHaveBeenCalledTimes(1));
  });

  it("should leave the protected area for the public site afterwards", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  /*
   * Every visited route still holds a server render taken while the session
   * existed. Without the refresh, going back would show the dashboard of a
   * user the database no longer has.
   */
  it("should discard the cached signed-in renders on the way out", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it("should close without deleting when the visitor backs out", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await user.type(await open(user), DELETE_ACCOUNT_CONFIRMATION);
    await user.click(screen.getByRole("button", { name: ACCOUNT_COPY.cancel }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("should forget what was typed so a reopened dialog asks again", async () => {
    const user = userEvent.setup();

    render(<DeleteAccountDialog />);
    await user.type(await open(user), DELETE_ACCOUNT_CONFIRMATION);
    await user.click(screen.getByRole("button", { name: ACCOUNT_COPY.cancel }));
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await open(user);

    expect(confirmButton()).toBeDisabled();
  });

  it("should report a failed deletion rather than pretend it worked", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
    });

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        ACCOUNT_COPY.genericError,
      ),
    );
  });

  it("should keep the visitor where they are when the deletion fails", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
    });

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);

    await waitFor(() => expect(deleteUser).toHaveBeenCalledTimes(1));
    expect(replace).not.toHaveBeenCalled();
  });

  it("should allow a retry after a failure that a retry could clear", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
    });

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        ACCOUNT_COPY.genericError,
      ),
    );

    expect(confirmButton()).toBeEnabled();
  });

  /*
   * Better Auth refuses to delete from a session older than `freshAge`, and
   * this account has no password to prove intent with instead. Pressing the
   * same button again cannot clear that, so it has to stop being offered.
   */
  it("should explain a session too old to authorise the deletion", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "SESSION_EXPIRED", message: "Session expired." },
    });

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        ACCOUNT_COPY.staleSessionError,
      ),
    );
  });

  it("should replace the deletion with the only action that helps", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "SESSION_EXPIRED", message: "Session expired." },
    });

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);

    expect(
      await screen.findByRole("button", {
        name: ACCOUNT_COPY.staleSessionAction,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: ACCOUNT_COPY.confirmAction }),
    ).not.toBeInTheDocument();
  });

  it("should end the stale session and send the visitor to log in again", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "SESSION_EXPIRED", message: "Session expired." },
    });

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);
    await user.click(
      await screen.findByRole("button", {
        name: ACCOUNT_COPY.staleSessionAction,
      }),
    );

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith(LOGIN_PATH);
  });

  it("should report a sign-out that failed rather than strand the visitor", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "SESSION_EXPIRED", message: "Session expired." },
    });
    signOut.mockResolvedValue({ data: null, error: { message: "nope" } });

    render(<DeleteAccountDialog />);
    await confirmDeletion(user);
    await user.click(
      await screen.findByRole("button", {
        name: ACCOUNT_COPY.staleSessionAction,
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        ACCOUNT_COPY.signOutError,
      ),
    );
    expect(push).not.toHaveBeenCalled();
  });
});
