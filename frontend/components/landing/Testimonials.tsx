import { Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { TESTIMONIALS } from "@/lib/constants";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="border-y border-ink-100 bg-ink-50/60 py-20 sm:py-28"
    >
      <div className="container-px">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Mijozlar fikri</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Professionallar ImageRights.uz ga ishonadi
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Influencer, jurnalist, advokat va agentliklar tasvirlarini biz bilan
            himoya qiladi.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 4) * 0.07}>
              <figure className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-ink-800 text-sm font-bold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-ink-500">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
