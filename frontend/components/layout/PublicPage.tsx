import type { ReactNode } from "react";
import { PublicNav } from "./PublicNav";
import { Footer } from "./Footer";

/** Ochiq sahifalar uchun umumiy qobiq: nav + sarlavha + kontent + footer. */
export function PublicPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PublicNav />
      <main>
        <section className="border-b border-ink-100 bg-ink-50/60">
          <div className="container-px py-16">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              {title}
            </h1>
            {intro && <p className="mt-4 max-w-2xl text-lg text-ink-600">{intro}</p>}
          </div>
        </section>
        <div className="container-px py-14">{children}</div>
      </main>
      <Footer />
    </>
  );
}
