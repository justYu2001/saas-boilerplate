import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { LOGIN_PATH } from "@/constants/auth";

import { auth } from ".";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/**
 * The session, narrowed to non-null.
 *
 * The dashboard layout already redirects anyone without one, so a page under
 * it is never rendered signed out — but TypeScript cannot see that, and the
 * alternatives are a non-null assertion or every page repeating the layout's
 * guard. This states the guarantee once instead, and holds it for real if a
 * page is ever moved out from under that layout.
 *
 * Free to call: {@link getSession} is `cache`d for the request, so the second
 * caller reads the first one's result.
 */
export const requireSession = async () => {
  const session = await getSession();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  return session;
};
