"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Button,
  Field,
  PageSkeleton,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { AI_KIND_LABELS, formatDateTime } from "@/lib/labels";
import type { AIKind, CaseListItem } from "@/lib/types";

type Analysis = {
  id: string;
  kind: AIKind;
  output: string;
  model: string;
  caseId?: string | null;
  createdAt: string;
};

const KIND_HINTS: Record<AIKind, string> = {
  CASE_SUMMARY: "Faktlarni tartiblab, qisqa xulosa tayyorlaydi",
  RISK_ASSESSMENT: "Kuchli va zaif tomonlarni hamda keyingi qadamlarni baholaydi",
  MISSING_INFO: "Qanday ma’lumot va dalil yetishmayotganini ko‘rsatadi",
  LAWYER_QUESTIONS: "Advokat bilan uchrashuvga savollar ro‘yxatini tuzadi",
  DOCUMENT_DRAFT: "Talabnoma qoralamasi matnini tayyorlaydi",
};

export default function AssistantPage() {
  const [status, setStatus] = useState<{ configured: boolean; disclaimer: string } | null>(null);
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[] | null>(null);
  const [caseId, setCaseId] = useState("");
  const [kind, setKind] = useState<AIKind>("CASE_SUMMARY");
  const [extraContext, setExtraContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);

  useEffect(() => {
    api<{ configured: boolean; disclaimer: string }>("/ai/status")
      .then(setStatus)
      .catch(() => setStatus({ configured: false, disclaimer: "" }));
    api<CaseListItem[]>("/cases")
      .then(setCases)
      .catch(() => {});
    api<Analysis[]>("/ai/analyses")
      .then(setAnalyses)
      .catch(() => setAnalyses([]));
  }, []);

  async function analyze() {
    if (!caseId) {
      setError("Avval ishni tanlang.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const a = await api<Analysis>("/ai/analyze", {
        body: { caseId, kind, extraContext: extraContext || undefined },
      });
      setResult(a);
      setAnalyses((list) => [a, ...(list ?? [])]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tahlil bajarilmadi");
    } finally {
      setBusy(false);
    }
  }

  if (!status) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="AI huquqiy yordamchi"
        description="Ish ma’lumotlaringiz asosida faktlarni tartiblash va dastlabki tahlil."
      />

      <Alert tone="warning">
        Ushbu tahlil axborot xarakteriga ega va professional yuridik maslahat
        o‘rnini bosmaydi.{" "}
        <Link href="/ai-disclaimer" className="font-semibold underline" target="_blank">
          Batafsil
        </Link>
      </Alert>

      {!status.configured ? (
        <Alert tone="info">
          AI yordamchisi hozircha sozlanmagan. Administratsiya server
          konfiguratsiyasida ANTHROPIC_API_KEY kalitini o‘rnatgach bu bo‘lim
          faollashadi. Qolgan barcha funksiyalar (hisobot, dalillar, hujjatlar)
          AIsiz ham to‘liq ishlaydi.
        </Alert>
      ) : cases.length === 0 ? (
        <Alert tone="info">
          Tahlil olish uchun avval{" "}
          <Link href="/dashboard/violations/new" className="font-semibold underline">
            huquqbuzarlik hisoboti
          </Link>{" "}
          yuborilgan bo‘lishi kerak — AI aynan ish ma’lumotlari bilan ishlaydi.
        </Alert>
      ) : (
        <section className="card max-w-3xl" aria-labelledby="ai-form-title">
          <h2 id="ai-form-title" className="font-semibold text-ink-900">
            Yangi tahlil
          </h2>
          {error && (
            <Alert tone="error" className="mt-3">
              {error}
            </Alert>
          )}
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ish" htmlFor="case" required>
                <Select id="case" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                  <option value="">— Tanlang —</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tahlil turi" htmlFor="kind" hint={KIND_HINTS[kind]}>
                <Select
                  id="kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as AIKind)}
                >
                  {Object.entries(AI_KIND_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field
              label="Qo‘shimcha kontekst (ixtiyoriy)"
              htmlFor="extra"
              hint="Hisobotda aks etmagan muhim tafsilotlar bo‘lsa, yozing"
            >
              <Textarea
                id="extra"
                rows={3}
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
              />
            </Field>
            <Button onClick={() => void analyze()} loading={busy}>
              <Sparkles className="h-4 w-4" aria-hidden />
              {busy ? "Tahlil qilinmoqda…" : "Tahlilni boshlash"}
            </Button>
          </div>
        </section>
      )}

      {result && (
        <section className="card max-w-3xl border-gold-300/60" aria-labelledby="result-title">
          <h2 id="result-title" className="flex items-center gap-2 font-semibold text-ink-900">
            <Sparkles className="h-4 w-4 text-gold-600" aria-hidden />
            {AI_KIND_LABELS[result.kind]}
          </h2>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-700">
            {result.output}
          </pre>
        </section>
      )}

      {analyses !== null && analyses.length > 0 && (
        <section className="max-w-3xl" aria-labelledby="history-title">
          <h2 id="history-title" className="text-lg font-semibold text-ink-900">
            Oldingi tahlillar
          </h2>
          <div className="mt-3 space-y-3">
            {analyses.map((a) => (
              <details key={a.id} className="card p-0">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-sm font-semibold text-ink-800 [&::-webkit-details-marker]:hidden">
                  {AI_KIND_LABELS[a.kind]}
                  <span className="text-xs font-normal text-ink-400">
                    {formatDateTime(a.createdAt)}
                  </span>
                </summary>
                <pre className="whitespace-pre-wrap border-t border-ink-100 px-5 py-4 font-sans text-sm leading-relaxed text-ink-700">
                  {a.output}
                </pre>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
