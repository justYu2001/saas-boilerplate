import { type Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { APP_NAME } from "@/constants/app";
import { LOGIN_PATH } from "@/constants/auth";
import { SIDEBAR_COLLAPSED_COOKIE } from "@/constants/dashboard";
import { getSession } from "@/server/better-auth/server";

export const metadata: Metadata = {
  title: {
    default: `Dashboard · ${APP_NAME}`,
    template: `%s · ${APP_NAME}`,
  },
  // Signed-in surfaces carry no public content, so they stay out of the index
  // and out of `sitemap.ts` — the same treatment `/login` gets.
  robots: { index: false, follow: false },
};

/**
 * The gate and the chrome for every signed-in route.
 *
 * The session is read here rather than in each page so a new route under
 * `/dashboard` is protected by existing, not by remembering. `getSession` is
 * `cache`d per request, so a page that needs the user again pays nothing.
 *
 * This is a server-side redirect on purpose. A client-side guard would have to
 * render something first and take it back once the session resolved, which is
 * both a flash of the wrong screen and a shell briefly shipped to someone who
 * is not signed in.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getSession();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  const cookieStore = await cookies();
  const isSidebarCollapsed =
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "true";

  return (
    <DashboardShell
      user={{ name: session.user.name, email: session.user.email }}
      defaultCollapsed={isSidebarCollapsed}
    >
      {children}
    </DashboardShell>
  );
}
