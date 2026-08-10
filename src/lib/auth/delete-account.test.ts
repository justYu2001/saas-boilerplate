import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteAccount, DeleteAccountError } from "./delete-account";

const deleteUser = vi.fn();

/*
 * Mocking the client whole keeps the real one from being constructed — it
 * registers the One Tap plugin, which wants a Google script jsdom cannot fetch.
 */
vi.mock("@/server/better-auth/client", () => ({
  authClient: { deleteUser: (body: unknown) => deleteUser(body) as unknown },
}));

beforeEach(() => {
  deleteUser.mockResolvedValue({ data: { success: true }, error: null });
});

describe("deleteAccount", () => {
  it("should resolve once Better Auth reports the account gone", async () => {
    await expect(deleteAccount()).resolves.toBeUndefined();
  });

  it("should ask the endpoint that owns session teardown rather than delete rows directly", async () => {
    await deleteAccount();

    expect(deleteUser).toHaveBeenCalledTimes(1);
  });

  /*
   * The distinction the dialog's footer branches on. A session past
   * `freshAge` cannot be talked round by retrying, so it has to arrive as its
   * own reason rather than folded into the generic failure.
   */
  it("should mark a session too old to authorise the delete as recoverable by logging in again", async () => {
    deleteUser.mockResolvedValue({
      data: null,
      error: {
        code: "SESSION_EXPIRED",
        message: "Session expired. Re-authenticate to perform this action.",
      },
    });

    await expect(deleteAccount()).rejects.toMatchObject({
      reason: "stale-session",
    });
  });

  it("should treat every other refusal as a retry", async () => {
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
    });

    await expect(deleteAccount()).rejects.toMatchObject({ reason: "unknown" });
  });

  it("should reject with an error the caller can narrow", async () => {
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
    });

    await expect(deleteAccount()).rejects.toBeInstanceOf(DeleteAccountError);
  });

  it("should carry the underlying message for the console and for tests", async () => {
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
    });

    await expect(deleteAccount()).rejects.toThrow("boom");
  });

  it("should still describe a failure that arrived without a message", async () => {
    deleteUser.mockResolvedValue({
      data: null,
      error: { code: "INTERNAL_SERVER_ERROR" },
    });

    await expect(deleteAccount()).rejects.toThrow(
      "Better Auth refused to delete the account.",
    );
  });
});
