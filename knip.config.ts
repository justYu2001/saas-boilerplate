import { type KnipConfig } from "knip";

/**
 * Knip loads `drizzle.config.ts` to find the schema, and that module imports
 * `@/env`, which throws when the real variables are missing. Only the shape of
 * the config matters here, never the values, so skip validation the same way a
 * Docker build does. Setting it here rather than as a prefix on the `knip`
 * script keeps the script working on Windows too.
 */
process.env.SKIP_ENV_VALIDATION ??= "1";

export default {
  /**
   * The rest of the entry points are left at their defaults: the `next` plugin
   * already claims `src/app/**` routes and `next.config.js`, `vitest` claims
   * the test files and `vitest.setup.ts`, and `tooling/setup.ts` is reached
   * through the `setup` script in package.json.
   */
  entry: [
    /**
     * The two halves of the tRPC client surface this template hands to whoever
     * builds on it: `server.ts` is the RSC caller (`api`, `HydrateClient`),
     * `react.tsx` the client-side one (`api`, `RouterInputs`, `RouterOutputs`).
     * Only `TRPCReactProvider` is wired up so far, so without this every other
     * export — and `server.ts` in its entirety — reads as dead code. Declaring
     * them entry points says the opposite: they are the edge of the graph, not
     * a loose end. Their imports still count, which is what keeps
     * `server-only` off the unused-dependency list.
     */
    "src/trpc/server.ts",
    "src/trpc/react.tsx",
  ],
  ignoreDependencies: [
    /**
     * `eslint.config.js` pulls the Next.js rules in through
     * `FlatCompat#extends("next/core-web-vitals")`. That is a bare string
     * resolved by ESLint at runtime, not an import, so knip cannot see the
     * config — nor `@next/eslint-plugin-next` and `eslint-plugin-react-hooks`,
     * which the config only names in the same indirect way.
     */
    "eslint-config-next",
    "@next/eslint-plugin-next",
    "eslint-plugin-react-hooks",
  ],
  ignoreIssues: {
    /**
     * Vendored shadcn/ui primitives. Each component is copied in whole, so
     * parts this app has not reached for yet (`SelectSeparator`, `SheetClose`,
     * …) are unused by design rather than dead code. Only the export reports
     * are silenced — the files still count towards dependency usage, and a
     * component nothing imports at all is still reported as an unused file.
     */
    "src/components/ui/**": ["exports", "types"],
  },
} satisfies KnipConfig;
