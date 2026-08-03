import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/mocks/server";

// Globals are disabled, so React Testing Library's automatic cleanup does not
// run. Unmount every rendered tree between tests to keep them isolated.
afterEach(() => {
  cleanup();
});

// Fail loudly on any request that isn't explicitly mocked, so missing
// handlers surface as test failures instead of silent real network calls.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
