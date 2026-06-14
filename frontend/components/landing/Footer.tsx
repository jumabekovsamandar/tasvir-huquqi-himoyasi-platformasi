import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";

type Column = { title: string; links: { label: string; href: string }[] };

export function Footer() {
  const t = useTranslations("footer");
  const columns = t.raw("columns") as Column[];

  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container-px py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              {t("tagline")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-ink-900">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-600 transition-colors hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink-100 pt-10">
          <h3 className="text-sm font-semibold text-ink-900">
            {t("company.title")}
          </h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-ink-500">
                {t("company.ownerLabel")}
              </p>
              <p className="mt-1 text-sm text-ink-700">
                {t("company.ownerName")}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">
                {t("company.contactLabel")}
              </p>
              <a
                href="tel:+998996006938"
                className="mt-1 block text-sm text-ink-700 transition-colors hover:text-brand-600"
              >
                {t("company.phone")}
              </a>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">
                {t("company.instagramLabel")}
              </p>
              <a
                href="https://instagram.com/imagerights.uz"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-ink-700 transition-colors hover:text-brand-600"
              >
                {t("company.instagram")}
              </a>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">
                {t("company.personalLabel")}
              </p>
              <a
                href="https://instagram.com/jumabekov.samandar"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-ink-700 transition-colors hover:text-brand-600"
              >
                {t("company.personal")}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-8 sm:flex-row">
          <p className="text-sm text-ink-500">{t("copyright")}</p>
          <p className="text-sm text-ink-500">{t("location")}</p>
        </div>
      </div>
    </footer>
  );
}
