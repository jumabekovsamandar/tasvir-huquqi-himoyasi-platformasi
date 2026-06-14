"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, PlayCircle, ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Stat = { value: string; label: string };

export function Hero() {
  const t = useTranslations("hero");
  const stats = t.raw("stats") as Stat[];
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pt-44">
      {/* background */}
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-light [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <div className="container-px">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                {t("badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
            >
              {t("titlePre")}{" "}
              <span className="gradient-text">{t("titleHighlight")}</span>
              <br className="hidden sm:block" /> {t("titlePost")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/auth/register" className="btn-primary px-6 py-3.5 text-base">
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#solution" className="btn-secondary px-6 py-3.5 text-base">
                <PlayCircle className="h-4 w-4" />
                {t("ctaSecondary")}
              </a>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold text-ink-900">{s.value}</dt>
                  <dd className="mt-1 text-xs font-medium text-ink-500">
                    {s.label}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* product visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-4xl border border-ink-100 bg-white/80 p-3 shadow-premium backdrop-blur">
              <div className="rounded-3xl bg-ink-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ScanFace className="h-4 w-4 text-brand-300" />
                    {t("demo.title")}
                  </div>
                  <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300">
                    {t("demo.risk")}
                  </span>
                </div>

                <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 ring-1 ring-white/10">
                  <div className="flex h-full items-center justify-center">
                    <ScanFace className="h-20 w-20 text-white/20" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Meter label={t("demo.meterFaceSwap")} value={92} tone="red" />
                  <Meter label={t("demo.meterVideoEdit")} value={68} tone="amber" />
                  <Meter label={t("demo.meterAiContent")} value={88} tone="red" />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/5 p-3 text-sm">
                  <span className="text-white/70">{t("demo.confidence")}</span>
                  <span className="font-bold text-red-300">{t("demo.fake")}</span>
                </div>
              </div>
            </div>

            {/* floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 -top-4 hidden rounded-2xl border border-ink-100 bg-white p-3 shadow-card sm:flex sm:items-center sm:gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs font-semibold text-ink-900">
                  {t("demo.badgeTitle")}
                </div>
                <div className="text-[11px] text-ink-500">{t("demo.badgeSubtitle")}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Meter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber" | "green";
}) {
  const colors = {
    red: "bg-red-400",
    amber: "bg-amber-400",
    green: "bg-green-400",
  } as const;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${colors[tone]}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </div>
    </div>
  );
}
