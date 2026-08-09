import { ChevronsDown } from "lucide-react";

import { APP_NAME } from "@/constants/app";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Renders the wordmark beside the mark. Set false for a mark-only lockup. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * The product lockup: gradient mark plus wordmark.
 *
 * Single source of truth so the navbar and the auth surfaces cannot drift
 * apart. Replace the mark and {@link APP_NAME} when rebranding a fork.
 */
export function Logo({ showWordmark = true, className }: LogoProps) {
  return (
    <span className={cn("flex items-center text-lg font-bold", className)}>
      <ChevronsDown
        aria-hidden="true"
        // `shrink-0` so a narrow or clipping container squeezes the wordmark
        // and never the mark itself — a squashed logo is worse than a hidden
        // one, and the dashboard's collapsed rail is exactly that container.
        className="border-secondary from-primary via-primary/70 to-primary mr-2 size-9 shrink-0 rounded-lg border bg-linear-to-tr text-white"
      />
      {/*
       * Wrapped rather than left as a bare text node so a lockup inside a
       * collapsing container can address the wordmark on its own — as the
       * dashboard rail does — without every caller re-deriving the brand.
       */}
      <span className={showWordmark ? undefined : "sr-only"}>{APP_NAME}</span>
    </span>
  );
}
