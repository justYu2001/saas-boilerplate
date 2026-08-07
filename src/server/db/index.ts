import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/env";

import * as schema from "./schema";

/**
 * Hostname served by the `neon-http-proxy` container in `docker-compose.yml`. It resolves to
 * 127.0.0.1, so it only ever points at the local development database.
 */
const LOCAL_PROXY_HOST = "db.localtest.me";
const LOCAL_PROXY_PORT = 4444;

/**
 * Neon's driver talks HTTP to `https://<host>/sql`. Against the local proxy there is no TLS and the
 * port differs, so the endpoint has to be rewritten.
 */
if (new URL(env.DATABASE_URL).hostname === LOCAL_PROXY_HOST) {
  neonConfig.fetchEndpoint = (host) => `http://${host}:${LOCAL_PROXY_PORT}/sql`;
}

/**
 * `neon()` is stateless — every query is a one-off HTTP request — so there is no connection to cache
 * across HMR updates.
 */
export const db = drizzle(neon(env.DATABASE_URL), { schema });
