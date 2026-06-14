import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation APIs — these keep the active locale prefix
// (/uz, /en, /ru) on internal navigation automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
