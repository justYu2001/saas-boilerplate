import { Navbar } from "@/components/layout/navbar";

/**
 * Chrome for the public marketing pages.
 *
 * The navbar lives here rather than in the root layout so authentication
 * surfaces under `(auth)` render without it.
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
