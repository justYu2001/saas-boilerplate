import type { MetadataRoute } from "next";

import { DOMAIN } from "@/constants/domain";

const BLOCKED_CRAWLERS = [
  "Google-Extended",
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Amazonbot",
  "SemrushBot",
  "Meta-ExternalAgent",
  "SERankingBacklinksBot",
  "Baiduspider",
];

const robots = () =>
  ({
    rules: [
      {
        userAgent: BLOCKED_CRAWLERS,
        disallow: ["/"],
      },
    ],
    sitemap: `${DOMAIN}/sitemap.xml`,
  }) satisfies MetadataRoute.Robots;

export default robots;
