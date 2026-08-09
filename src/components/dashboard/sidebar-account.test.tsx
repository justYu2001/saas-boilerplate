import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DASHBOARD_COPY } from "@/constants/dashboard";

import { SidebarAccount } from "./sidebar-account";

const signOut = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

/*
 * Mocking the client whole keeps the real one from being constructed — it
 * registers the One Tap plugin, which wants a Google script jsdom cannot fetch.
 */
vi.mock("@/server/better-auth/client", () => ({
  authClient: { signOut: () => signOut() as unknown },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const GOOGLE_USER = { name: "Ada Lovelace", email: "ada@example.com" };
/** No name of its own — Better Auth derived one from the address. */
const CODE_USER = { name: "ada", email: "ada@example.com" };

const signOutButton = () =>
  screen.getByRole("button", { name: DASHBOARD_COPY.signOut });

beforeEach(() => {
  signOut.mockResolvedValue({ data: { success: true }, error: null });
});

describe("SidebarAccount", () => {
  it("should name a social login by the display name it supplied", () => {
    render(<SidebarAccount user={GOOGLE_USER} />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("should not print the address alongside a real name, which already identifies the account", () => {
    render(<SidebarAccount user={GOOGLE_USER} />);

    expect(screen.queryByText("ada@example.com")).not.toBeInTheDocument();
  });

  it("should fall back to the address for an account with no name of its own", () => {
    render(<SidebarAccount user={CODE_USER} />);

    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("should show that address once, as the identity rather than as a subtitle under itself", () => {
    render(<SidebarAccount user={CODE_USER} />);

    expect(screen.getAllByText("ada@example.com")).toHaveLength(1);
  });

  it("should keep the identity announced when the rail is collapsed and there is no room to print it", () => {
    render(<SidebarAccount user={GOOGLE_USER} collapsed />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("should label who is signed in", () => {
    render(<SidebarAccount user={GOOGLE_USER} />);

    expect(screen.getByText(DASHBOARD_COPY.signedInAs)).toBeInTheDocument();
  });

  it("should end the session and leave the protected area on sign out", async () => {
    const user = userEvent.setup();

    render(<SidebarAccount user={GOOGLE_USER} />);
    await user.click(signOutButton());

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith("/");
  });

  /*
   * The layout reads the session on the server, so every visited route still
   * holds a signed-in render in the client cache. Without the refresh, going
   * back would show the shell again.
   */
  it("should discard the cached signed-in renders on the way out", async () => {
    const user = userEvent.setup();

    render(<SidebarAccount user={GOOGLE_USER} />);
    await user.click(signOutButton());

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it("should report a failed sign out rather than pretend it worked", async () => {
    const user = userEvent.setup();
    signOut.mockResolvedValue({ data: null, error: { message: "nope" } });

    render(<SidebarAccount user={GOOGLE_USER} />);
    await user.click(signOutButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      DASHBOARD_COPY.signOutError,
    );
  });

  it("should keep the visitor where they are when sign out fails", async () => {
    const user = userEvent.setup();
    signOut.mockResolvedValue({ data: null, error: { message: "nope" } });

    render(<SidebarAccount user={GOOGLE_USER} />);
    await user.click(signOutButton());

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(push).not.toHaveBeenCalled();
  });

  it("should allow a retry after a failure", async () => {
    const user = userEvent.setup();
    signOut.mockResolvedValue({ data: null, error: { message: "nope" } });

    render(<SidebarAccount user={GOOGLE_USER} />);
    await user.click(signOutButton());
    await screen.findByRole("alert");

    expect(signOutButton()).toBeEnabled();
  });

  it("should keep the sign-out control reachable by name when collapsed", () => {
    render(<SidebarAccount user={GOOGLE_USER} collapsed />);

    expect(signOutButton()).toBeInTheDocument();
  });
});
