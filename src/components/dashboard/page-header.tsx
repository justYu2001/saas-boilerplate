import type { PropsWithChildren } from "react";

/** `children` are the primary actions for the page, aligned to the heading's baseline row. */
interface PageHeaderProps extends PropsWithChildren {
  title: string;
  description?: string;
};

/**
 * The heading block every dashboard page opens with.
 *
 * A rule under the title rather than a card around it: the canvas is one
 * surface, and boxing each region would put a second border inside the rail's
 * border for no gain. The rule is where the page's chrome ends and its content
 * starts, which is the only division most pages need.
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="border-border flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b pb-5">
      <div className="min-w-0">
        <h1 className="text-foreground text-xl font-semibold tracking-tight text-balance sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="text-muted-foreground mt-1.5 max-w-prose text-sm">
            {description}
          </p>
        )}
      </div>

      {children}
    </header>
  );
}
