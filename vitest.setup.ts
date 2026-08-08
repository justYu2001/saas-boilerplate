import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/mocks/server";

/*
 * jsdom runs no layout engine, so it ships no `ResizeObserver`. `input-otp`
 * constructs one on mount, and the throw takes the whole React tree down with
 * it — every test that reaches the code-entry step fails on a missing global
 * rather than on anything it meant to assert.
 *
 * A no-op stub is the honest shim rather than a workaround: without layout
 * there is nothing to observe, and no callback would ever have fired. Guarded
 * so a future jsdom that implements it for real wins.
 */
const noop = () => undefined;

if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe = noop;
    unobserve = noop;
    disconnect = noop;
  };
}

/*
 * Same root cause, second symptom: `input-otp` hit-tests its own container on a
 * timer to keep the fake caret aligned. jsdom has no `elementFromPoint`, and the
 * throw escapes the timer as an unhandled rejection rather than a test failure.
 * `null` is what a real browser returns when nothing occupies the point, which
 * is the truth in a document that was never laid out.
 */
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

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
