import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { FEATURES } from "@/lib/constants";

export function Features() {
  return (
    <section id="features" className="border-y border-ink-100 bg-ink-50/60 py-20 sm:py-28">
      <div className="container-px">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Imkoniyatlar</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Tasvir huquqlarini himoya qilishning to‘liq to‘plami
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Ro‘yxatga olishdan litsenziyalashgacha — sakkizta kuchli modul bitta
            platformada.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.06}>
              <Link
                href={f.href}
                className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-ink-800 text-white shadow-glow">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 flex items-center gap-1 text-lg font-semibold text-ink-900">
                  {f.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                  {f.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Batafsil <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
