import { AlertTriangle, EyeOff, ImageOff, UserX } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { PROBLEMS } from "@/lib/constants";

const ICONS = [AlertTriangle, ImageOff, EyeOff, UserX];

export function Problem() {
  return (
    <section className="border-y border-ink-100 bg-ink-50/60 py-20 sm:py-28">
      <div className="container-px">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Muammo</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Raqamli dunyoda tasviringiz xavf ostida
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Sun'iy intellekt rivojlanishi bilan suratlaringizni nazoratsiz
            ishlatish va soxtalashtirish osonlashdi.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="group h-full rounded-3xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-colors group-hover:bg-red-100">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {p.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
