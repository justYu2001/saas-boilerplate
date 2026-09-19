import { env } from "@/env";

import { createDrizzleConfig } from "./drizzle.base";

/**
 * Local development. drizzle-kit loads `.env` itself before evaluating this
 * file, so `@/env` sees the same variables the dev server does.
 *
 * For the production database use `drizzle.prod.config.ts` instead — see the
 * `db:*:prod` scripts in package.json.
 */
export default createDrizzleConfig(env.DATABASE_URL);
