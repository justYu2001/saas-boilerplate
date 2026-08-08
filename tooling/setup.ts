import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

const FILES = [
  "package.json",
  "docker-compose.yml",
  ".env.example",
  "src/constants/app.ts",
  "src/constants/domain.ts",
  "src/app/layout.tsx",
  "src/app/(marketing)/page.tsx",
  "src/components/layout/navbar.tsx",
  "src/components/layout/sections/hero.tsx",
  "src/components/layout/sections/footer.tsx",
  "src/components/layout/sections/faq.tsx",
  "src/components/layout/sections/testimonial.tsx",
];

const toKebabCase = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeDomain = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const printUsage = () => {
  console.error(
    'Usage: pnpm setup "<App Name>" "<Author Name>" "<domain.com>"',
  );
};

const main = () => {
  const [appName, authorName, domain] = process.argv.slice(2);

  if (!appName || !authorName || !domain) {
    printUsage();
    process.exit(1);
  }

  const replacements: Array<[string, string]> = [
    ["SAAS Boilerplate", appName],
    ["SaaS Boilerplate", appName],
    ["saas-boilerplate", toKebabCase(appName)],
    ["https://example.com", normalizeDomain(domain)],
    ["Euan", authorName],
  ];

  for (const file of FILES) {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) {
      console.warn(`skip (not found): ${file}`);
      continue;
    }

    let contents = readFileSync(path, "utf8");
    let changed = false;

    for (const [search, replace] of replacements) {
      if (contents.includes(search)) {
        contents = contents.replaceAll(search, replace);
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(path, contents);
      console.log(`updated: ${file}`);
    }
  }

  console.log("\nDone. Review the diff with `git diff` before committing.");
};

main();
