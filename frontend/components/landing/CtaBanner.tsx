import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  return (
    <section className="pb-24">
      <div className="container-px">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-ink-900 px-8 py-16 text-center shadow-premium sm:px-16">
            <div className="aurora pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Tasviringizni bugunoq himoya qilishni boshlang
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Bir necha daqiqada ro‘yxatdan o‘ting va tasvir huquqlaringizni
                sun'iy intellekt nazoratiga oling.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="btn bg-white px-6 py-3.5 text-base text-ink-900 hover:bg-ink-100"
                >
                  Bepul boshlash <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="btn border border-white/20 px-6 py-3.5 text-base text-white hover:bg-white/10"
                >
                  Demo dashboard
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
