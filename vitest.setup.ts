import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach } from "vitest";

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
/*
 * Guarded on `document` rather than on the method alone: this file is the
 * setup for every environment, and a server-only test that opts out with
 * `// @vitest-environment node` has no document to patch.
 */
if (typeof document !== "undefined" && !document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

// Globals are disabled, so React Testing Library's automatic cleanup does not
// run. Unmount every rendered tree between tests to keep them isolated.
afterEach(async () => {
  cleanup();

  /*
   * Third symptom of the same `input-otp` behaviour as the shims above: it
   * schedules a zero-delay timer that calls `setState`, and unmounting does
   * not cancel it. Once the last test in a file finishes, vitest tears down
   * jsdom, and a timer that fires after that reaches React with no `window`
   * left — surfacing as an unhandled `ReferenceError: window is not defined`
   * attributed to whichever file happened to finish last.
   *
   * Yielding one macrotask lets those timers run while the document still
   * exists, on an already-unmounted tree where React discards the update.
   */
  await new Promise((resolve) => setTimeout(resolve, 0));
});

/*
 * Fail loudly on any request that isn't explicitly mocked, so missing handlers
 * surface as test failures instead of silent real network calls.
 *
 * Started at module scope rather than in `beforeAll`, which is where MSW's own
 * docs put it. Setup files run before test modules are imported; `beforeAll`
 * callbacks run after. Anything that captures `globalThis.fetch` at import time
 * — Better Auth's client does exactly this, storing it as `customFetchImpl`
 * when `createAuthClient()` is called — would otherwise keep a reference to the
 * real fetch and quietly talk to whatever is listening on localhost. Patching
 * first closes that window.
 */
server.listen({ onUnhandledRequest: "error" });

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
