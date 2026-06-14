import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

type Point = { title: string; description: string };
type FlowItem = { title: string; desc: string };

export function Solution() {
  const t = useTranslations("solution");
  const points = t.raw("points") as Point[];
  const flow = t.raw("flow") as FlowItem[];

  return (
    <section id="solution" className="py-20 sm:py-28">
      <div className="container-px">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-ink-600">{t("subtitle")}</p>

            <ul className="mt-8 space-y-5">
              {points.map((s) => (
                <li key={s.title} className="flex gap-3.5">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-brand-600" />
                  <div>
                    <h3 className="font-semibold text-ink-900">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">
                      {s.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-100/60 to-ink-100/40 blur-2xl" />
              <div className="rounded-4xl border border-ink-100 bg-white p-6 shadow-premium">
                {flow.map((step, i) => (
                  <div key={step.title}>
                    <FlowStep
                      step={String(i + 1).padStart(2, "0")}
                      title={step.title}
                      desc={step.desc}
                      last={i === flow.length - 1}
                    />
                    {i < flow.length - 1 && <Connector />}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FlowStep({
  step,
  title,
  desc,
  last,
}: {
  step: string;
  title: string;
  desc: string;
  last?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
          last
            ? "bg-brand-600 text-white"
            : "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
        }`}
      >
        {step}
      </span>
      <div className="pt-1">
        <h4 className="font-semibold text-ink-900">{title}</h4>
        <p className="mt-0.5 text-sm text-ink-600">{desc}</p>
      </div>
    </div>
  );
}

function Connector() {
  return <div className="ml-[1.35rem] h-6 w-px bg-ink-100" />;
}
