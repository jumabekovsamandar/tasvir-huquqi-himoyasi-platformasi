import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS = [
  {
    title: "Mahsulot",
    links: [
      { label: "Imkoniyatlar", href: "#features" },
      { label: "Tariflar", href: "#pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "API hujjatlari", href: "/dashboard" },
    ],
  },
  {
    title: "Modullar",
    links: [
      { label: "Tasvir reyestri", href: "/dashboard/registry" },
      { label: "Deepfake aniqlash", href: "/dashboard/deepfake" },
      { label: "Internet monitoring", href: "/dashboard/monitoring" },
      { label: "Litsenziya bozori", href: "/dashboard/marketplace" },
    ],
  },
  {
    title: "Kompaniya",
    links: [
      { label: "Biz haqimizda", href: "#" },
      { label: "Blog", href: "/blog" },
      { label: "Karyera", href: "#" },
      { label: "Bog‘lanish", href: "#" },
    ],
  },
  {
    title: "Huquqiy",
    links: [
      { label: "Maxfiylik siyosati", href: "#" },
      { label: "Foydalanish shartlari", href: "#" },
      { label: "Cookie siyosati", href: "#" },
      { label: "Xavfsizlik", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container-px py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              Markaziy Osiyodagi birinchi professional tasvir huquqlari himoyasi
              ekotizimi. Tasviringiz. Huquqingiz. Himoyangiz.
            </p>
          </div>

          {COLUMNS.map((col) => (
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
          <h3 className="text-sm font-semibold text-ink-900">Kompaniya</h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-ink-500">Owner</p>
              <p className="mt-1 text-sm text-ink-700">Jumabekov Samandar</p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">Bog‘lanish</p>
              <Link
                href="tel:+998996006938"
                className="mt-1 block text-sm text-ink-700 transition-colors hover:text-brand-600"
              >
                +998 99 600 69 38
              </Link>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">Instagram</p>
              <Link
                href="https://instagram.com/imagerights.uz"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-ink-700 transition-colors hover:text-brand-600"
              >
                @imagerights.uz
              </Link>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">Shaxsiy Instagram</p>
              <Link
                href="https://instagram.com/jumabekov.samandar"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-ink-700 transition-colors hover:text-brand-600"
              >
                @jumabekov.samandar
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-8 sm:flex-row">
          <p className="text-sm text-ink-500">
            © 2026 ImageRights.uz — Barcha huquqlar himoyalangan.
          </p>
          <p className="text-sm text-ink-500">
            Toshkent, O‘zbekiston · hello@imagerights.uz
          </p>
        </div>
      </div>
    </footer>
  );
}
