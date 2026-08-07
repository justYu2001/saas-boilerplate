import { type MetadataRoute } from "next";

import { DOMAIN } from "@/constants/domain";

type SitemapEntry = MetadataRoute.Sitemap[number];

interface Route {
  path: string;
  changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>;
  priority: number;
}

/** Every indexable page. Add new routes here as pages are created. */
const ROUTES: readonly Route[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, DOMAIN).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));
}
