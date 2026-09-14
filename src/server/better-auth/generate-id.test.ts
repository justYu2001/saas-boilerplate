// @vitest-environment node
import { describe, expect, it } from "vitest";

import { generateId } from "./generate-id";

/**
 * Canonical UUID text form with the version nibble pinned to 7 and the variant
 * nibble to one of the RFC 9562 values (8, 9, a, b).
 */
const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Milliseconds held in the leading 48 bits of a v7. */
const timestampOf = (id: string) =>
  Number.parseInt(id.replaceAll("-", "").slice(0, 12), 16);

describe("generateId", () => {
  it("returns a well-formed UUIDv7", () => {
    expect(generateId()).toMatch(UUID_V7);
  });

  it("never repeats an id", () => {
    const ids = Array.from({ length: 1000 }, generateId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  /*
   * The whole reason for choosing v7 over the library default. Ids minted in
   * the same millisecond still have to sort after their predecessors, which is
   * what the uuid package's monotonic counter is for — so this compares as
   * strings, the way Postgres orders the `text` column these land in, rather
   * than only comparing timestamps.
   */
  it("mints ids that sort in creation order", () => {
    const ids = Array.from({ length: 1000 }, generateId);

    expect(ids).toStrictEqual([...ids].sort());
  });

  it("encodes the current time in the leading 48 bits", () => {
    const before = Date.now();
    const id = generateId();
    const after = Date.now();

    expect(timestampOf(id)).toBeGreaterThanOrEqual(before);
    expect(timestampOf(id)).toBeLessThanOrEqual(after);
  });
});
