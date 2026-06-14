"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, { native: string; short: string }> = {
  uz: { native: "O‘zbekcha", short: "UZ" },
  en: { native: "English", short: "EN" },
  ru: { native: "Русский", short: "RU" },
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languageSwitcher");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function select(next: Locale) {
    // Persist in localStorage (the NEXT_LOCALE cookie is set by next-intl on navigation).
    try {
      window.localStorage.setItem("NEXT_LOCALE", next);
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
    setOpen(false);
    router.replace(pathname, { locale: next });
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
      >
        <Globe className="h-4 w-4" />
        {LABELS[locale].short}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-card"
        >
          {locales.map((l) => (
            <button
              key={l}
              role="menuitem"
              onClick={() => select(l)}
              className="flex w-full items-center justify-between px-3.5 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-100"
            >
              {LABELS[l].native}
              {l === locale && <Check className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
