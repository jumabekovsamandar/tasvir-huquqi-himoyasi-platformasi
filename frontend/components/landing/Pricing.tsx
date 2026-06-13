import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="container-px">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Tariflar</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Ehtiyojingizga mos rejani tanlang
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Bepul boshlang, o‘sgan sari kengaytiring. Yashirin to‘lovlar yo‘q.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.07} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-300",
                  plan.highlighted
                    ? "border-brand-300 bg-ink-900 text-white shadow-premium lg:-translate-y-3"
                    : "border-ink-100 bg-white hover:-translate-y-1 hover:shadow-card",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white shadow-glow">
                    <Sparkles className="h-3 w-3" /> Eng mashhur
                  </span>
                )}

                <h3
                  className={cn(
                    "text-lg font-bold",
                    plan.highlighted ? "text-white" : "text-ink-900",
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    plan.highlighted ? "text-white/60" : "text-ink-500",
                  )}
                >
                  {plan.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "text-3xl font-extrabold tracking-tight",
                      plan.highlighted ? "text-white" : "text-ink-900",
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      plan.highlighted ? "text-white/50" : "text-ink-400",
                    )}
                  >
                    {plan.period}
                  </span>
                </div>

                <Link
                  href="/auth/register"
                  className={cn(
                    "mt-6 w-full",
                    plan.highlighted ? "btn bg-white text-ink-900 hover:bg-ink-100" : "btn-secondary",
                  )}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-7 space-y-3.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 flex-shrink-0",
                          plan.highlighted ? "text-brand-300" : "text-brand-600",
                        )}
                      />
                      <span
                        className={plan.highlighted ? "text-white/80" : "text-ink-600"}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
