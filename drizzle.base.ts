import { type Config } from "drizzle-kit";

/**
 * Everything the local and production drizzle-kit configs share. Only the
 * connection string differs between them, so it is the single parameter here —
 * anything else added below applies to both environments by construction,
 * which is the point of keeping this file separate.
 */
export const createDrizzleConfig = (databaseUrl: string) =>
  ({
    schema: "./src/server/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
      url: databaseUrl,
    },
    // No `tablesFilter`: this database is dedicated to the app, so drizzle-kit
    // should see every table. A filter here would hide the Better Auth tables
    // (`user`, `session`, `account`, `verification`) from introspection, making
    // push try to re-create them on every run.
  }) satisfies Config;
