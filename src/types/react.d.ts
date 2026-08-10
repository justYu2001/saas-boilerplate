export {};

/**
 * `CSSProperties` is generated from the known CSS property list, so a custom
 * property in a `style` object is a type error even though React sets it
 * correctly at runtime. Without this, every component passing a `--*` variable
 * inline needs an `as CSSProperties` cast, which silences the whole object
 * rather than the one key that needs it.
 *
 * Keyed on the `--` prefix so ordinary typos are still caught.
 */
declare module "react" {
  // Declaration merging only works on an interface, so the `Record` form
  // `consistent-indexed-object-style` asks for cannot apply here.
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
