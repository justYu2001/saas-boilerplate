import { Navbar } from "@/components/layout/navbar";
import { getSession } from "@/server/better-auth/server";

/**
 * Chrome for the public marketing pages.
 *
 * The navbar lives here rather than in the root layout so authentication
 * surfaces under `(auth)` render without it.
 *
 * The session is read here, once for the group, so the header's auth entry
 * points are part of the first HTML with their final destinations already on
 * them. The alternative — asking the browser for the session after hydration —
 * costs a round trip during which the header can only show nothing, since
 * guessing wrong sends a signed-in visitor to the login page.
 *
 * The price is that these routes render per request instead of being
 * prerendered: `getSession` reads `headers()`, and that opts the whole group
 * out of static rendering. Everything below the header is still static markup,
 * so what each request actually pays for is one session lookup. If that lookup
 * ever becomes the bottleneck, Better Auth's `session.cookieCache` answers it
 * from a signed cookie instead of the database.
 */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <>
      <Navbar isSignedIn={Boolean(session)} />
      {children}
    </>
  );
}
