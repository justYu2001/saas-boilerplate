import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    // The `neon-http` driver has no transaction support, so operations run
    // sequentially instead. This is Better Auth's default — set explicitly so it
    // isn't flipped on without noticing the driver can't honour it.
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    },
  },
  // Required so cookies set by auth.api.* calls (e.g. signInSocial in
  // server actions) actually reach the browser via next/headers — without
  // this, the OAuth state cookie never gets set and the callback fails
  // with state_mismatch.
  plugins: [nextCookies()], // must be the last plugin in the array
});

export type Session = typeof auth.$Infer.Session;
