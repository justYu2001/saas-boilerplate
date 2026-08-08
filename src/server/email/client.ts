import { Resend } from "resend";

import { env } from "@/env";

/**
 * The one Resend client for the app.
 *
 * Constructed at module scope so a warm serverless instance reuses it across
 * invocations rather than rebuilding an HTTP client per email. It holds
 * `RESEND_API_KEY`, so this module must never be reached from a client
 * component — `env` throws if it is, which is the guard rather than a
 * convention.
 */
export const resend = new Resend(env.RESEND_API_KEY);
