import { describe, expect, it } from "vitest";

import { DOMAIN } from "@/constants/domain";

import sitemap from "./sitemap";

describe("sitemap", () => {
  it("should list the home page", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(`${DOMAIN}/`);
  });

  it("should only emit absolute URLs on the configured domain", () => {
    for (const { url } of sitemap()) {
      expect(url.startsWith(`${DOMAIN}/`)).toBe(true);
    }
  });

  it("should not contain duplicate URLs", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });

  it("should give every entry a lastModified date and a valid priority", () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });
});
