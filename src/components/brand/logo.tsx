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
        className="border-secondary from-primary via-primary/70 to-primary mr-2 size-9 rounded-lg border bg-linear-to-tr text-white"
      />
      {showWordmark ? APP_NAME : <span className="sr-only">{APP_NAME}</span>}
    </span>
  );
}
