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
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
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
