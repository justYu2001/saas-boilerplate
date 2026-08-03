import { cn } from "@/lib/utils";

/**
 * Dependency-free replacement for `@devnomic/marquee`, which pins React 18.
 * The track is rendered twice so the animation can loop seamlessly: the copy
 * translates by exactly its own width plus one gap, landing where the original
 * started.
 */
function Marquee({
  className,
  innerClassName,
  fade = false,
  pauseOnHover = false,
  gap = "3rem",
  duration = "30s",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  innerClassName?: string;
  fade?: boolean;
  pauseOnHover?: boolean;
  gap?: string;
  duration?: string;
}) {
  const track = cn(
    "flex min-w-full shrink-0 items-center justify-around gap-(--marquee-gap)",
    "animate-marquee motion-reduce:animate-none",
    pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
    innerClassName,
  );

  return (
    <div
      data-slot="marquee"
      style={
        {
          "--marquee-gap": gap,
          "--marquee-duration": duration,
        } as React.CSSProperties
      }
      className={cn(
        "group/marquee flex w-full gap-(--marquee-gap) overflow-hidden",
        fade &&
          "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
      {...props}
    >
      <div className={track}>{children}</div>
      <div aria-hidden className={track}>
        {children}
      </div>
    </div>
  );
}

export { Marquee };
