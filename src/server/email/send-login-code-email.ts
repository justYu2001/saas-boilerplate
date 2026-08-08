import { env } from "@/env";
import { resend } from "@/server/email/client";
import {
  renderLoginCodeEmail,
  type LoginCodeEmailType,
} from "@/server/email/templates/login-code-email";

interface SendLoginCodeEmailInput {
  /** Recipient. Already lowercased and validated by Better Auth. */
  email: string;
  /** The one-time code to deliver. */
  code: string;
  type: LoginCodeEmailType;
}

/**
 * Delivers a one-time code through Resend.
 *
 * Rejects when the mail does not leave, so the caller can log a real cause
 * instead of a silent nothing. The Resend SDK reports most failures as an
 * `error` in the resolved value rather than a rejection, and reserves throwing
 * for transport problems — both are turned into one thrown `Error` here so
 * callers have a single shape to handle.
 *
 * Nothing in the message or the thrown error is shown to the user: the login
 * form deliberately answers every failure with the same sentence, so an
 * attacker cannot read the difference between "no such account", "that domain
 * bounces", and "our key expired".
 */
export async function sendLoginCodeEmail({
  email,
  code,
  type,
}: SendLoginCodeEmailInput): Promise<void> {
  const { subject, html, text } = renderLoginCodeEmail({ code, type });

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject,
    html,
    text,
    /*
     * A login code is time-critical and worthless once stale, so it must not
     * queue behind a marketing send or get grouped with one.
     */
    headers: { "X-Entity-Ref-ID": `login-code-${type}` },
  });

  if (error) {
    throw new Error(
      `Resend rejected the ${type} code email: ${error.name} — ${error.message}`,
    );
  }

  /*
   * Belt and braces: the SDK's types allow both fields to be null, and a
   * "success" with no message id means nothing was actually accepted.
   */
  if (!data?.id) {
    throw new Error(
      `Resend accepted the ${type} code email without returning a message id.`,
    );
  }
}
