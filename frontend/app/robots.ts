import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Shaxsiy kabinetlar indekslanmaydi
      disallow: ["/dashboard", "/lawyer", "/admin", "/auth"],
    },
    sitemap: "https://imagerights.uz/sitemap.xml",
  };
}
