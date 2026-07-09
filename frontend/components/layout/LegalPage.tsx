import type { ReactNode } from "react";
import { PublicPage } from "./PublicPage";
import { Alert } from "@/components/ui/primitives";

/**
 * Huquqiy hujjatlar sahifasi. Barcha hujjatlar QORALAMA maqomida —
 * ishga tushirishdan oldin malakali yurist ko‘rigidan o‘tishi shart.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PublicPage eyebrow="Huquqiy hujjat" title={title}>
      <article className="prose-sm mx-auto max-w-3xl">
        <Alert tone="warning" className="mb-8">
          <strong>Qoralama versiya.</strong> Ushbu hujjat dastlabki loyiha
          bo‘lib, platforma rasmiy ishga tushirilishidan oldin O‘zbekiston
          Respublikasi qonunchiligi bo‘yicha malakali yurist tomonidan ko‘rib
          chiqilishi va tasdiqlanishi shart. Oxirgi yangilanish: {updated}.
        </Alert>
        <div className="space-y-6 text-[15px] leading-relaxed text-ink-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink-900 [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </article>
    </PublicPage>
  );
}
