import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  // No `tablesFilter`: this database is dedicated to the app, so drizzle-kit
  // should see every table. A filter here would hide the Better Auth tables
  // (`user`, `session`, `account`, `verification`) from introspection, making
  // push try to re-create them on every run.
} satisfies Config;
