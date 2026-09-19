import { config as loadEnvFile } from "dotenv";
import { z } from "zod";

import { createDrizzleConfig } from "./drizzle.base";

const PROD_ENV_FILE = ".env.production.local";

/**
 * Points drizzle-kit at the production database from a local machine, for the
 * `db:*:prod` scripts. Populate the file with `vercel env pull --environment
 * production .env.production.local`; it is gitignored by the `.env*.local`
 * rule.
 *
 * `override: true` is load-bearing. drizzle-kit runs `dotenv` on `.env` before
 * it ever evaluates this config, so `DATABASE_URL` already holds the local
 * value by now, and dotenv skips variables that are already set unless told
 * otherwise. Without the override this config would quietly point at the local
 * database while claiming to be production.
 */
const result = loadEnvFile({
  path: PROD_ENV_FILE,
  override: true,
  quiet: true,
});

if (result.error) {
  throw new Error(
    `Could not read ${PROD_ENV_FILE}. Create it with \`vercel env pull --environment production ${PROD_ENV_FILE}\`.`,
    { cause: result.error },
  );
}

/**
 * Validated here rather than through `@/env` because that module reads
 * `process.env` the moment it is imported, and ES module imports all run
 * before the `loadEnvFile` call above — it would therefore validate the local
 * values, not the production ones. Only the connection string matters to
 * drizzle-kit, so this checks exactly that one variable.
 */
const databaseUrl = z
  .url({ error: `${PROD_ENV_FILE} must define DATABASE_URL as a valid URL.` })
  .parse(process.env.DATABASE_URL);

export default createDrizzleConfig(databaseUrl);
