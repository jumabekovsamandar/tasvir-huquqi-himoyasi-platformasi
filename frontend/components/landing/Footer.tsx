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
