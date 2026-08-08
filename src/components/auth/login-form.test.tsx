import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  LOGIN_CODE_LENGTH,
  LOGIN_COPY,
  LOGIN_REDIRECT_PATH,
} from "@/constants/auth";
import {
  sendLoginCode,
  signInWithProvider,
  verifyLoginCode,
} from "@/lib/auth/send-login-code";

import { LoginForm } from "./login-form";

vi.mock("@/lib/auth/send-login-code", () => ({
  sendLoginCode: vi.fn(),
  verifyLoginCode: vi.fn(),
  signInWithProvider: vi.fn(),
}));

const routerReplace = vi.fn();
const routerRefresh = vi.fn();

// The form navigates on success, and `useRouter` throws outside an App Router
// tree. What matters here is that it is asked to leave, not how Next does it.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, refresh: routerRefresh }),
}));

const sendLoginCodeMock = vi.mocked(sendLoginCode);
const verifyLoginCodeMock = vi.mocked(verifyLoginCode);
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
  verifyLoginCodeMock.mockResolvedValue(undefined);
  signInWithProviderMock.mockResolvedValue(undefined);
});

/** Walks the form to the code-entry step and returns the OTP input. */
const reachCodeStep = async (
  user: ReturnType<typeof userEvent.setup>,
  email = "founder@example.com",
) => {
  await user.type(emailField(), email);
  await user.click(submitButton());
  await screen.findByRole("status");

  return screen.getByLabelText(LOGIN_COPY.codeLabel);
};

const A_VALID_CODE = "4".repeat(LOGIN_CODE_LENGTH);

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

describe("LoginForm code entry", () => {
  it("should verify against the address the code was sent to, not whatever is typed later", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user, "  Founder@Example.COM  ");
    await user.type(codeField, A_VALID_CODE);

    await waitFor(() =>
      expect(verifyLoginCodeMock).toHaveBeenCalledWith(
        "founder@example.com",
        A_VALID_CODE,
      ),
    );
  });

  it("should submit as soon as the last digit lands, without waiting for the button", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user);
    await user.type(codeField, A_VALID_CODE);

    await waitFor(() => expect(verifyLoginCodeMock).toHaveBeenCalledTimes(1));
  });

  it("should not call the server with a half-typed code", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user);
    await user.type(codeField, "4".repeat(LOGIN_CODE_LENGTH - 1));
    await user.click(
      screen.getByRole("button", { name: LOGIN_COPY.verifySubmit }),
    );

    await expectAlert(`Enter the ${LOGIN_CODE_LENGTH}-digit code.`);
    expect(verifyLoginCodeMock).not.toHaveBeenCalled();
  });

  /*
   * Staying on the login page after a successful login reads as a login that
   * failed. `replace` rather than `push` so the back button cannot return a
   * signed-in user here.
   */
  it("should leave the login page once the code is accepted", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user);
    await user.type(codeField, A_VALID_CODE);

    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(LOGIN_REDIRECT_PATH),
    );
  });

  it("should discard the render taken before the session existed", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user);
    await user.type(codeField, A_VALID_CODE);

    await waitFor(() => expect(routerRefresh).toHaveBeenCalled());
  });

  it("should stay put and offer another try when the code is wrong", async () => {
    verifyLoginCodeMock.mockRejectedValue(new Error("Invalid OTP"));
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user);
    await user.type(codeField, A_VALID_CODE);

    await expectAlert(LOGIN_COPY.verifyError);
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("should not leak why verification failed", async () => {
    verifyLoginCodeMock.mockRejectedValue(
      new Error("OTP expired for founder@example.com"),
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user);
    await user.type(codeField, A_VALID_CODE);
    await expectAlert(LOGIN_COPY.verifyError);

    expect(screen.queryByText(/expired/i)).not.toBeInTheDocument();
  });

  it("should request a fresh code for the same address when asked to resend", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await reachCodeStep(user);
    sendLoginCodeMock.mockClear();

    await user.click(
      screen.getByRole("button", { name: new RegExp(LOGIN_COPY.resendAction) }),
    );

    await waitFor(() =>
      expect(sendLoginCodeMock).toHaveBeenCalledWith("founder@example.com"),
    );
  });

  /*
   * Resending rotates the code server-side, so whatever is in the field is
   * already dead. Leaving it there invites the user to submit it.
   */
  it("should clear the stale code after a resend", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const codeField = await reachCodeStep(user);
    await user.type(codeField, "4".repeat(LOGIN_CODE_LENGTH - 1));

    await user.click(
      screen.getByRole("button", { name: new RegExp(LOGIN_COPY.resendAction) }),
    );

    await waitFor(() => expect(codeField).toHaveValue(""));
  });

  it("should report a failed resend rather than pretending a code is on its way", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await reachCodeStep(user);
    sendLoginCodeMock.mockRejectedValue(new Error("Too many requests"));

    await user.click(
      screen.getByRole("button", { name: new RegExp(LOGIN_COPY.resendAction) }),
    );

    await expectAlert(LOGIN_COPY.genericError);
  });
});
