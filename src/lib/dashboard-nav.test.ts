import { describe, expect, it } from "vitest";

import { DASHBOARD_PATH } from "@/constants/dashboard";

import { isNavItemCurrent } from "./dashboard-nav";

const SETTINGS_PATH = `${DASHBOARD_PATH}/settings`;

describe("isNavItemCurrent", () => {
  it("should mark an entry current on its own route", () => {
    expect(isNavItemCurrent(SETTINGS_PATH, SETTINGS_PATH)).toBe(true);
  });

  it("should keep a section current on its sub-routes", () => {
    expect(isNavItemCurrent(`${SETTINGS_PATH}/billing`, SETTINGS_PATH)).toBe(
      true,
    );
  });

  it("should not confuse a sibling route that merely shares a prefix", () => {
    expect(isNavItemCurrent(`${SETTINGS_PATH}-archive`, SETTINGS_PATH)).toBe(
      false,
    );
  });

  it("should not mark an entry current on an unrelated route", () => {
    expect(isNavItemCurrent(DASHBOARD_PATH, SETTINGS_PATH)).toBe(false);
  });

  it("should mark the dashboard root current on the root itself", () => {
    expect(isNavItemCurrent(DASHBOARD_PATH, DASHBOARD_PATH)).toBe(true);
  });

  /*
   * The reason the root gets its own rule. Every route in the app is prefixed
   * by it, so the subtree test that serves every other entry would mark a root
   * entry current on every page there is. The root is not in `DASHBOARD_NAV`
   * today; this keeps the rule honest for a fork that puts it back.
   */
  it("should not mark the dashboard root current on a deeper route that starts with it", () => {
    expect(isNavItemCurrent(SETTINGS_PATH, DASHBOARD_PATH)).toBe(false);
  });
});
