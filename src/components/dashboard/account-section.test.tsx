import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ACCOUNT_COPY } from "@/constants/account";

import { AccountSection } from "./account-section";

/*
 * The dialog is a client component that constructs the Better Auth client on
 * import — which registers the One Tap plugin and wants a Google script jsdom
 * cannot fetch. Its own behaviour is covered in `delete-account-dialog.test`;
 * here only its presence matters.
 */
vi.mock("./delete-account-dialog", () => ({
  DeleteAccountDialog: () => (
    <button type="button">{ACCOUNT_COPY.deleteAction}</button>
  ),
}));

const CREATED_AT = new Date("2026-02-03T09:15:00Z");

const GOOGLE_USER = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  createdAt: CREATED_AT,
};

/** No name of its own — Better Auth derived one from the address. */
const CODE_USER = {
  name: "ada",
  email: "ada@example.com",
  createdAt: CREATED_AT,
};

describe("AccountSection", () => {
  it("should name the section so the page can grow more of them", () => {
    render(<AccountSection user={GOOGLE_USER} />);

    expect(
      screen.getByRole("heading", { name: ACCOUNT_COPY.sectionTitle }),
    ).toBeInTheDocument();
  });

  it("should show the address the account signs in with", () => {
    render(<AccountSection user={GOOGLE_USER} />);

    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("should show a display name the user actually chose", () => {
    render(<AccountSection user={GOOGLE_USER} />);

    expect(screen.getByText(ACCOUNT_COPY.nameLabel)).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  /*
   * A "Name: ada" row above "Email: ada@example.com" would present Better
   * Auth's guess as something the user picked, and spend a row saying less
   * than the row under it.
   */
  it("should omit the name row when the stored name was derived from the address", () => {
    render(<AccountSection user={CODE_USER} />);

    expect(screen.queryByText(ACCOUNT_COPY.nameLabel)).not.toBeInTheDocument();
  });

  it("should not print the address twice when it is standing in as the name", () => {
    render(<AccountSection user={CODE_USER} />);

    expect(screen.getAllByText("ada@example.com")).toHaveLength(1);
  });

  it("should date the account from the row that created it", () => {
    render(<AccountSection user={GOOGLE_USER} />);

    expect(screen.getByText(ACCOUNT_COPY.memberSinceLabel)).toBeInTheDocument();
    expect(screen.getByText("February 3, 2026")).toBeInTheDocument();
  });

  it("should say what deletion costs before offering it", () => {
    render(<AccountSection user={GOOGLE_USER} />);

    expect(
      screen.getByText(ACCOUNT_COPY.deleteDescription),
    ).toBeInTheDocument();
  });

  it("should offer the deletion behind a control rather than inline", () => {
    render(<AccountSection user={GOOGLE_USER} />);

    expect(
      screen.getByRole("button", { name: ACCOUNT_COPY.deleteAction }),
    ).toBeInTheDocument();
  });
});
