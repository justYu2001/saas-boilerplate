import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOGIN_COPY } from "@/constants/auth";
import { sendLoginCode, signInWithProvider } from "@/lib/auth/send-login-code";

import { LoginForm } from "./login-form";

vi.mock("@/lib/auth/send-login-code", () => ({
  sendLoginCode: vi.fn(),
  signInWithProvider: vi.fn(),
}));

const sendLoginCodeMock = vi.mocked(sendLoginCode);
const signInWithProviderMock = vi.mocked(signInWithProvider);

const emailField = () => screen.getByLabelText(LOGIN_COPY.emailLabel);
const submitButton = () =>
  screen.getByRole("button", { name: LOGIN_COPY.submit });

/**
 * The alert region is mounted from the start — an already-present live region
 * announces more reliably than a freshly inserted one — so wait on its content
 * rather than on the element appearing.
 */
const expectAlert = (message: string) =>
  waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(message));

beforeEach(() => {
  sendLoginCodeMock.mockResolvedValue(undefined);
  signInWithProviderMock.mockResolvedValue(undefined);
});

describe("LoginForm", () => {
  it("should render the email field, submit action and helper text", () => {
    render(<LoginForm />);

    expect(emailField()).toBeInTheDocument();
    expect(submitButton()).toBeInTheDocument();
    expect(screen.getByText(LOGIN_COPY.helper)).toBeInTheDocument();
  });

  it("should render a button for each configured OAuth provider", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("should block submission and report the problem when the field is empty", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(submitButton());

    await expectAlert("Enter your email address.");
    expect(sendLoginCodeMock).not.toHaveBeenCalled();
  });

  it("should block submission when the address is malformed", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailField(), "not-an-email");
    await user.click(submitButton());

    await expectAlert("That doesn't look like a valid email address.");
    expect(sendLoginCodeMock).not.toHaveBeenCalled();
  });

  it("should mark the field invalid so assistive tech announces the error", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(submitButton());

    await waitFor(() =>
      expect(emailField()).toHaveAttribute("aria-invalid", "true"),
    );
  });

  it("should send the code using the normalized address", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailField(), "  Founder@Example.COM  ");
    await user.click(submitButton());

    await waitFor(() =>
      expect(sendLoginCodeMock).toHaveBeenCalledWith("founder@example.com"),
    );
  });

  it("should confirm delivery and name the address once the code is sent", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailField(), "founder@example.com");
    await user.click(submitButton());

    const confirmation = await screen.findByRole("status");

    expect(confirmation).toHaveTextContent(LOGIN_COPY.sentTitle);
    expect(confirmation).toHaveTextContent("founder@example.com");
    expect(
      screen.queryByRole("button", { name: LOGIN_COPY.submit }),
    ).not.toBeInTheDocument();
  });

  it("should retire the provider choice once the code is on its way", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailField(), "founder@example.com");
    await user.click(submitButton());
    await screen.findByRole("status");

    expect(
      screen.queryByRole("button", { name: /continue with google/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_COPY.dividerLabel)).not.toBeInTheDocument();
  });

  it("should return to an empty form when choosing a different email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailField(), "founder@example.com");
    await user.click(submitButton());
    await screen.findByRole("status");

    await user.click(
      screen.getByRole("button", { name: LOGIN_COPY.sentReset }),
    );

    expect(await screen.findByLabelText(LOGIN_COPY.emailLabel)).toHaveValue("");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("should surface a recoverable error when sending fails", async () => {
    sendLoginCodeMock.mockRejectedValue(new Error("smtp is down"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailField(), "founder@example.com");
    await user.click(submitButton());

    await expectAlert(LOGIN_COPY.genericError);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("should not leak the underlying failure reason to the user", async () => {
    sendLoginCodeMock.mockRejectedValue(new Error("smtp is down"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(emailField(), "founder@example.com");
    await user.click(submitButton());
    await expectAlert(LOGIN_COPY.genericError);

    expect(screen.queryByText(/smtp is down/i)).not.toBeInTheDocument();
  });

  it("should start the OAuth flow when a provider is chosen", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() =>
      expect(signInWithProviderMock).toHaveBeenCalledWith("google"),
    );
  });

  it("should report a failed OAuth attempt instead of failing silently", async () => {
    signInWithProviderMock.mockRejectedValue(new Error("popup blocked"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await expectAlert(LOGIN_COPY.genericError);
  });
});
