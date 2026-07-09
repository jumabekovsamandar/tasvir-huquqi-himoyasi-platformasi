"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Download, ExternalLink, Gavel, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, apiBlob, ApiError } from "@/lib/api";
import {
  formatDate,
  formatBytes,
  PLATFORM_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from "@/lib/labels";
import type { ViolationReport } from "@/lib/types";

export default function ViolationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ViolationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<ViolationReport>(`/violations/${id}`)
      .then(setReport)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Hisobotni yuklab bo‘lmadi"),
      );
  }, [id]);

  useEffect(load, [load]);

  async function downloadEvidence(evidenceId: string, filename: string) {
    try {
      const blob = await apiBlob(`/evidence/${evidenceId}/download`);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError("Faylni yuklab bo‘lmadi");
    }
  }

  async function deleteDraft() {
    setBusy(true);
    try {
      await api(`/violations/${id}`, { method: "DELETE" });
      router.replace("/dashboard/violations");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "O‘chirilmadi");
      setBusy(false);
    }
  }

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!report) return <PageSkeleton />;

  const isDraft = report.status === "DRAFT";

  return (
    <>
      <PageHeader
        title={isDraft ? "Qoralama hisobot" : "Huquqbuzarlik hisoboti"}
        description={report.case ? `Ish raqami: ${report.case.caseNumber}` : undefined}
        action={
          <div className="flex flex-wrap gap-2">
            {isDraft && (
              <>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" aria-hidden /> O‘chirish
                </Button>
                <Link href={`/dashboard/violations/new`} className="btn-secondary">
                  Yangi hisobot boshlash
                </Link>
              </>
            )}
            {report.case && (
              <Link href={`/dashboard/cases/${report.case.id}`} className="btn-primary">
                <Gavel className="h-4 w-4" aria-hidden /> Ishni ochish
              </Link>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <Badge className={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</Badge>
        <span className="text-sm text-ink-400">
          Yaratilgan: {formatDate(report.createdAt)}
        </span>
      </div>

      {isDraft && (
        <Alert tone="warning">
          Bu hisobot hali yuborilmagan. Yuborish uchun hisobot ustida ishlashni
          yakunlang — yuborilgach u bo‘yicha ish (case) ochiladi.
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="facts-title">
          <h2 id="facts-title" className="font-semibold text-ink-900">
            Hisobot ma’lumotlari
          </h2>
          <dl className="mt-4 divide-y divide-ink-50">
            {(
              [
                ["Tavsif", report.description],
                [
                  "Himoyalangan tasvir",
                  report.protectedImage
                    ? `${report.protectedImage.title} (${report.protectedImage.registryCode})`
                    : "Ko‘rsatilmagan",
                ],
                [
                  "Platforma",
                  report.platform === "OTHER" && report.platformOther
                    ? report.platformOther
                    : PLATFORM_LABELS[report.platform],
                ],
                ["Aniqlangan sana", formatDate(report.discoveredAt)],
                ["E’lon qilingan sana", formatDate(report.publishedAt)],
                ["Rozilik", report.hadConsent ? "Berilgan (boshqa maqsadga)" : "Berilmagan"],
                ["Rozilik tafsiloti", report.consentDetails ?? "—"],
                ["Tijorat foydalanish", report.commercialUse ? "Ha" : "Yo‘q"],
                ["Zarar tavsifi", report.damageDescription ?? "—"],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[170px_1fr]">
                <dt className="text-sm text-ink-500">{k}</dt>
                <dd className="break-words text-sm font-medium text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
          {report.infringingUrl && (
            <a
              href={report.infringingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
            >
              Huquqbuzar kontentni ochish <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </section>

        <section className="card" aria-labelledby="evidence-title">
          <h2 id="evidence-title" className="font-semibold text-ink-900">
            Dalillar ({report.evidence?.length ?? 0})
          </h2>
          {!report.evidence?.length ? (
            <p className="mt-3 text-sm text-ink-500">Dalillar qo‘shilmagan.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-50">
              {report.evidence.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {ev.kind === "URL" ? ev.url : ev.originalFilename}
                    </p>
                    <p className="text-xs text-ink-400">
                      {ev.kind === "URL"
                        ? "Havola"
                        : `${ev.mimeType} · ${formatBytes(ev.sizeBytes)}`}{" "}
                      · {formatDate(ev.createdAt)}
                      {ev.sha256 && (
                        <span className="ml-1 font-mono">
                          · SHA-256: {ev.sha256.slice(0, 12)}…
                        </span>
                      )}
                    </p>
                  </div>
                  {ev.kind === "URL" ? (
                    <a
                      href={ev.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-brand-600"
                      aria-label="Havolani ochish"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() =>
                        void downloadEvidence(ev.id, ev.originalFilename ?? `dalil-${ev.id}`)
                      }
                      className="rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-brand-600"
                      aria-label="Dalilni yuklab olish"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Qoralamani o‘chirish"
        description="Qoralama hisobot va unga yuklangan dalillar butunlay o‘chiriladi. Bu amalni bekor qilib bo‘lmaydi."
        confirmLabel="O‘chirish"
        danger
        loading={busy}
        onConfirm={() => void deleteDraft()}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
