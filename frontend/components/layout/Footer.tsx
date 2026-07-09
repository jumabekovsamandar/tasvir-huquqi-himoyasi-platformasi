import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const GROUPS = [
  {
    title: "Platforma",
    links: [
      { label: "Qanday ishlaydi", href: "/how-it-works" },
      { label: "Tasvir huquqlari haqida", href: "/image-rights" },
      { label: "Huquqbuzarlik haqida xabar berish", href: "/report" },
      { label: "Advokatlar uchun", href: "/for-lawyers" },
    ],
  },
  {
    title: "Kompaniya",
    links: [
      { label: "Biz haqimizda", href: "/about" },
      { label: "Aloqa", href: "/contact" },
    ],
  },
  {
    title: "Huquqiy hujjatlar",
    links: [
      { label: "Maxfiylik siyosati", href: "/privacy" },
      { label: "Foydalanish shartlari", href: "/terms" },
      { label: "AI haqida ogohlantirish", href: "/ai-disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-ink-300">
      <div className="container-px grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
            Raqamli dunyoda tasvir huquqlaringiz kafolati. Huquqbuzarlikni
            hujjatlashtiring, dalillarni saqlang va huquqiy javob choralarini
            ko‘ring.
          </p>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-200">
              {g.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-400 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ink-800">
        <div className="container-px flex flex-col gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ImageRights.uz — Barcha huquqlar himoyalangan.</p>
          <p>
            Platformadagi ma’lumotlar axborot xarakteriga ega bo‘lib, yuridik
            maslahat o‘rnini bosmaydi.
          </p>
        </div>
      </div>
    </footer>
  );
}
