import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";

interface AuthShellProps {
  /** Card contents — compose with `CardHeader` / `CardContent`. */
  children: ReactNode;
}

/**
 * Centred single-card frame shared by every authentication surface.
 *
 * Owns the ground and the lockup only; the card's contents belong to the
 * surface so a state change (a sent code, a verification step) can replace the
 * whole card rather than being boxed inside it.
 *
 * The page sits a value step below `--card` so the card reads as elevated on
 * its own, before the two decorative layers — a warm field pulled from
 * `--primary` and a masked hairline grid — add depth.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="bg-muted/40 dark:bg-background relative isolate flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(48rem_34rem_at_50%_46%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_70%)] dark:bg-[radial-gradient(48rem_34rem_at_50%_46%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(36rem_28rem_at_50%_46%,black,transparent)] bg-size-[44px_44px] opacity-70 dark:opacity-100"
      />

      <Link
        href="/"
        aria-label="Go to the home page"
        className="focus-visible:ring-ring/50 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 rounded-lg duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-3 focus-visible:outline-none"
      >
        <Logo className="text-3xl" />
      </Link>

      <Card className="shadow-foreground/10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both w-full max-w-md shadow-xl delay-150 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)] dark:shadow-black/60">
        {children}
      </Card>
    </main>
  );
}
