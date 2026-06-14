import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Handles locale negotiation: reads the NEXT_LOCALE cookie, falls back to the
// Accept-Language header (browser auto-detection) and redirects to a localized
// route (/uz, /en, /ru).
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js internals (/_next, /_vercel)
  // - static files (with a dot, e.g. favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
