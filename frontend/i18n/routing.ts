import { defineRouting } from "next-intl/routing";

export const locales = ["uz", "en", "ru"] as const;
export const defaultLocale = "uz" as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always show the locale prefix for SEO-friendly localized routes (/uz, /en, /ru)
  localePrefix: "always",
  // Persist the chosen locale and auto-detect the browser language
  localeDetection: true,
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});
