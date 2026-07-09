import type { MetadataRoute } from "next";

const BASE = "https://imagerights.uz";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/how-it-works",
    "/image-rights",
    "/report",
    "/for-lawyers",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/ai-disclaimer",
  ];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
