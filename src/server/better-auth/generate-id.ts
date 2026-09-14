import { v7 as uuidv7 } from "uuid";

/**
 * The id every Better Auth row gets, in place of the library's default.
 *
 * Better Auth ships a 32-character random string — collision-safe, but with no
 * order to it. Every insert lands at a random point in the primary key's
 * B-tree, which dirties a fresh page per row and leaves the index progressively
 * more fragmented; UUIDv7 leads with a 48-bit millisecond timestamp, so rows
 * written together sit together and inserts stay at the right-hand edge of the
 * tree. The same ordering makes the id usable as a coarse "when was this
 * created" sort key, which matters most for `session` and `verification` —
 * the two tables that churn.
 *
 * The trade is that the timestamp is readable by anyone holding the id: a user
 * id in a URL discloses roughly when that account was created. That is public
 * information for most products and a leak for a few; a fork where it isn't
 * acceptable should return a v4 instead, which keeps the format and drops the
 * ordering.
 *
 * Wired in through `advanced.database.generateId` in `./config`. Better Auth
 * also accepts the literal `"uuid"` there, but that resolves to
 * `crypto.randomUUID()` — a v4, random across its whole width — so it buys the
 * format without any of the ordering this exists for.
 */
export const generateId = (): string => uuidv7();
