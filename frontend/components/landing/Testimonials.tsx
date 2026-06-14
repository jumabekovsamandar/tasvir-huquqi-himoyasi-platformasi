import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { TESTIMONIAL_META } from "@/lib/constants";

type Item = { role: string; quote: string };

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Item[];

  return (
    <section
      id="testimonials"
      className="border-y border-ink-100 bg-ink-50/60 py-20 sm:py-28"
    >
      <div className="container-px">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-ink-600">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const meta = TESTIMONIAL_META[i];
            return (
              <Reveal key={meta.name} delay={(i % 4) * 0.07}>
                <figure className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-ink-800 text-sm font-bold text-white">
                      {meta.initials}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-ink-900">
                        {meta.name}
                      </div>
                      <div className="text-xs text-ink-500">{item.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
