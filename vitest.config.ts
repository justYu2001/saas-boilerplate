import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Resolves the "@/*" alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    // jsdom is the default so React components work out of the box.
    // Server-only tests can opt out per file with:
    //   // @vitest-environment node
    environment: "jsdom",
    exclude: [...configDefaults.exclude, ".claude/worktrees/**"],
    setupFiles: ["./vitest.setup.ts"],
    // Dummy values so `src/env.js` validation passes when a test imports something that
    // transitively pulls in `@/server/better-auth` or `@/server/db` (e.g. a tRPC router).
    // Backend tests use PGlite (see `src/server/db/test-db.ts`) instead of `DATABASE_URL`.
    env: {
      BETTER_AUTH_URL: "http://localhost:3000",
      BETTER_AUTH_GOOGLE_CLIENT_ID: "test-client-id",
      BETTER_AUTH_GOOGLE_CLIENT_SECRET: "test-client-secret",
      DATABASE_URL: "postgres://user:password@localhost:5432/test",
      RESEND_API_KEY: "test-resend-api-key",
      EMAIL_FROM: "Test <login@test.example>",
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // `restoreMocks` only reaches spies created with `vi.spyOn`. Module-scope
    // `vi.fn()`s from a `vi.mock` factory outlive it, so call history leaks
    // between tests and any assertion on a call count silently counts the
    // previous test's work too. `clearMocks` wipes that history; the
    // implementations each suite sets in its own `beforeEach` still stand.
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/*.d.ts",
        "src/app/**/layout.tsx",
        "src/app/api/**",
        "src/server/db/schema.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
