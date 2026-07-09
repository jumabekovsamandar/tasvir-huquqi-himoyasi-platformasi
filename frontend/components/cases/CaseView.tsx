"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Lock,
  Send,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  Field,
  PageSkeleton,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { api, apiBlob, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  AI_KIND_LABELS,
  DOCUMENT_TYPE_LABELS,
  formatBytes,
  formatDate,
  formatDateTime,
  PLATFORM_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from "@/lib/labels";
import type {
  CaseDetail,
  CaseMessage,
  CaseNote,
  ViolationStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const LAWYER_TRANSITIONS: Record<string, ViolationStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "CLOSED"],
  UNDER_REVIEW: ["ACTION_REQUIRED", "NOTICE_PREPARED", "LAWYER_REVIEW", "RESOLVED", "CLOSED"],
  ACTION_REQUIRED: ["UNDER_REVIEW", "LAWYER_REVIEW", "CLOSED"],
  NOTICE_PREPARED: ["LAWYER_REVIEW", "RESOLVED", "CLOSED"],
  LAWYER_REVIEW: ["NOTICE_PREPARED", "ACTION_REQUIRED", "RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

/** Ish sahifasi — foydalanuvchi va advokat rollari uchun umumiy ko‘rinish. */
export function CaseView({ caseId, mode }: { caseId: string; mode: "user" | "lawyer" }) {
  const { user } = useAuth();
  const [data, setData] = useState<CaseDetail | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [statusTo, setStatusTo] = useState<ViolationStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [infoText, setInfoText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const isManager = mode === "lawyer" || user?.role === "ADMIN";

  const load = useCallback(() => {
    api<CaseDetail>(`/cases/${caseId}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Ishni yuklab bo‘lmadi"));
    api<CaseMessage[]>(`/cases/${caseId}/messages`)
      .then(setMessages)
      .catch(() => {});
  }, [caseId]);

  useEffect(load, [load]);

  useEffect(() => {
    if (isManager) {
      api<CaseNote[]>(`/cases/${caseId}/notes`)
        .then(setNotes)
        .catch(() => {});
    }
  }, [caseId, isManager]);

  async function run(name: string, fn: () => Promise<unknown>) {
    setBusy(name);
    setActionError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Amal bajarilmadi");
    } finally {
      setBusy(null);
    }
  }

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <PageSkeleton />;

  const r = data.report;
  const status = r.status;
  const transitions = isManager ? (LAWYER_TRANSITIONS[status] ?? []) : [];

  return (
    <>
      <PageHeader
        title={`Ish ${data.caseNumber}`}
        description={`Ochilgan: ${formatDate(data.createdAt)} · ${
          data.assignedLawyer
            ? `Advokat: ${data.assignedLawyer.profile?.fullName ?? "—"}`
            : "Advokat hali biriktirilmagan"
        }`}
        action={<Badge className={cn("px-3 py-1 text-sm", STATUS_TONES[status])}>{STATUS_LABELS[status]}</Badge>}
      />

      {actionError && <Alert tone="error">{actionError}</Alert>}

      {status === "ACTION_REQUIRED" && mode === "user" && (
        <Alert tone="warning">
          <strong>Sizdan qo‘shimcha ma’lumot so‘ralgan.</strong> Quyidagi
          yozishmalar bo‘limida advokat xabarini o‘qing va javob yuboring —
          javobingiz bilan ish avtomatik ko‘rib chiqishga qaytadi.
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Chap ustun: faktlar + dalillar + hujjatlar + AI */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card" aria-labelledby="case-facts">
            <h2 id="case-facts" className="font-semibold text-ink-900">
              Hisobot ma’lumotlari
            </h2>
            <dl className="mt-4 divide-y divide-ink-50">
              {(
                [
                  ["Tavsif", r.description],
                  [
                    "Platforma",
                    r.platform === "OTHER" && r.platformOther
                      ? r.platformOther
                      : PLATFORM_LABELS[r.platform],
                  ],
                  [
                    "Himoyalangan tasvir",
                    r.protectedImage
                      ? `${r.protectedImage.title} (${r.protectedImage.registryCode})`
                      : "Ko‘rsatilmagan",
                  ],
                  ["Aniqlangan", formatDate(r.discoveredAt)],
                  ["Rozilik", r.hadConsent ? "Berilgan (boshqa maqsadga)" : "Berilmagan"],
                  ["Tijorat foydalanish", r.commercialUse ? "Ha" : "Yo‘q"],
                  ["Zarar", r.damageDescription ?? "—"],
                  ...(isManager
                    ? ([
                        [
                          "Mijoz",
                          `${r.reporter.profile?.fullName ?? "—"} · ${r.reporter.email}`,
                        ],
                      ] as [string, string][])
                    : []),
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[170px_1fr]">
                  <dt className="text-sm text-ink-500">{k}</dt>
                  <dd className="break-words text-sm font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            {r.infringingUrl && (
              <a
                href={r.infringingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
              >
                Huquqbuzar kontent <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </section>

          <section className="card" aria-labelledby="case-evidence">
            <h2 id="case-evidence" className="font-semibold text-ink-900">
              Dalillar ({r.evidence?.length ?? 0})
            </h2>
            {!r.evidence?.length ? (
              <p className="mt-3 text-sm text-ink-500">Dalillar yo‘q.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-50">
                {r.evidence.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {ev.kind === "URL" ? ev.url : ev.originalFilename}
                      </p>
                      <p className="text-xs text-ink-400">
                        {ev.kind === "URL"
                          ? "Havola"
                          : `${ev.mimeType} · ${formatBytes(ev.sizeBytes)}`}
                        {" · "}
                        {formatDate(ev.createdAt)}
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
                          void apiBlob(`/evidence/${ev.id}/download`).then((blob) => {
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(blob);
                            a.download = ev.originalFilename ?? `dalil-${ev.id}`;
                            a.click();
                            URL.revokeObjectURL(a.href);
                          })
                        }
                        className="rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-brand-600"
                        aria-label="Yuklab olish"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card" aria-labelledby="case-docs">
            <div className="flex items-center justify-between">
              <h2 id="case-docs" className="font-semibold text-ink-900">
                Hujjatlar ({data.documents.length})
              </h2>
              <Link
                href={`/dashboard/documents?caseId=${data.id}`}
                className="text-sm font-semibold text-brand-600 hover:underline"
              >
                Hujjat yaratish →
              </Link>
            </div>
            {data.documents.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">
                Hali hujjat yaratilmagan. «Hujjatlar» bo‘limida shu ish uchun
                talabnoma yoki shikoyat qoralamasini tayyorlang.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-50">
                {data.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                    <Link
                      href={`/dashboard/documents/${d.id}`}
                      className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-ink-900 hover:text-brand-600"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-ink-300" aria-hidden />
                      <span className="truncate">{d.title}</span>
                    </Link>
                    <Badge
                      className={
                        d.status === "FINALIZED"
                          ? "bg-green-50 text-green-700"
                          : "bg-ink-100 text-ink-500"
                      }
                    >
                      {d.status === "FINALIZED" ? "Tasdiqlangan" : "Qoralama"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {data.aiAnalyses.length > 0 && (
            <section className="card" aria-labelledby="case-ai">
              <h2 id="case-ai" className="flex items-center gap-2 font-semibold text-ink-900">
                <Sparkles className="h-4 w-4 text-gold-600" aria-hidden /> AI tahlillari
              </h2>
              <div className="mt-3 space-y-3">
                {data.aiAnalyses.map((a) => (
                  <details key={a.id} className="rounded-xl border border-ink-100">
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-ink-800 [&::-webkit-details-marker]:hidden">
                      {AI_KIND_LABELS[a.kind]}
                      <span className="text-xs font-normal text-ink-400">
                        {formatDateTime(a.createdAt)}
                      </span>
                    </summary>
                    <pre className="whitespace-pre-wrap border-t border-ink-100 px-4 py-3 font-sans text-sm leading-relaxed text-ink-700">
                      {a.output}
                    </pre>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Yozishmalar */}
          <section className="card" aria-labelledby="case-messages">
            <h2 id="case-messages" className="font-semibold text-ink-900">
              Yozishmalar
            </h2>
            {messages.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Hozircha xabarlar yo‘q.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {messages.map((m) => {
                  const mine = m.author.id === user?.id;
                  return (
                    <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                          mine ? "bg-brand-600 text-white" : "bg-ink-50 text-ink-800",
                        )}
                      >
                        <p className={cn("text-xs font-semibold", mine ? "text-brand-100" : "text-ink-500")}>
                          {m.author.profile?.fullName ?? "Foydalanuvchi"}
                          {m.author.role === "LAWYER" && " · Advokat"}
                          {m.author.role === "ADMIN" && " · Administrator"}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                        <p className={cn("mt-1 text-[11px]", mine ? "text-brand-200" : "text-ink-400")}>
                          {formatDateTime(m.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {status !== "CLOSED" && (
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!messageText.trim()) return;
                  void run("message", async () => {
                    if (mode === "user" && status === "ACTION_REQUIRED") {
                      await api(`/cases/${caseId}/provide-info`, { body: { body: messageText } });
                    } else {
                      await api(`/cases/${caseId}/messages`, { body: { body: messageText } });
                    }
                    setMessageText("");
                    const list = await api<CaseMessage[]>(`/cases/${caseId}/messages`);
                    setMessages(list);
                  });
                }}
              >
                <Textarea
                  aria-label="Xabar matni"
                  rows={2}
                  className="min-h-0"
                  placeholder={
                    status === "ACTION_REQUIRED" && mode === "user"
                      ? "So‘ralgan ma’lumotni yozing…"
                      : "Xabar yozing…"
                  }
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <Button type="submit" loading={busy === "message"} aria-label="Xabarni yuborish">
                  <Send className="h-4 w-4" aria-hidden />
                </Button>
              </form>
            )}
          </section>
        </div>

        {/* O'ng ustun: timeline + advokat amallari + ichki eslatmalar */}
        <div className="space-y-6">
          <section className="card" aria-labelledby="case-timeline">
            <h2 id="case-timeline" className="font-semibold text-ink-900">
              Ish tarixi
            </h2>
            <ol className="mt-4 space-y-0">
              {data.statusHistory.map((h, i) => (
                <li key={h.id} className="relative pb-5 pl-6 last:pb-0">
                  {i < data.statusHistory.length - 1 && (
                    <span className="absolute left-[7px] top-4 h-full w-px bg-ink-100" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-white",
                      i === data.statusHistory.length - 1 ? "bg-brand-500" : "bg-ink-200",
                    )}
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-ink-900">
                    {STATUS_LABELS[h.toStatus]}
                  </p>
                  {h.note && <p className="mt-0.5 text-xs text-ink-500">{h.note}</p>}
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatDateTime(h.createdAt)}
                    {h.changedBy?.profile?.fullName && ` · ${h.changedBy.profile.fullName}`}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {isManager && transitions.length > 0 && (
            <section className="card" aria-labelledby="case-actions">
              <h2 id="case-actions" className="font-semibold text-ink-900">
                Holatni boshqarish
              </h2>
              <div className="mt-4 space-y-3">
                <Field label="Yangi holat" htmlFor="statusTo">
                  <Select
                    id="statusTo"
                    value={statusTo}
                    onChange={(e) => setStatusTo(e.target.value as ViolationStatus)}
                  >
                    <option value="">— Tanlang —</option>
                    {transitions.map((t) => (
                      <option key={t} value={t}>
                        {STATUS_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Izoh (mijozga ko‘rinadi)" htmlFor="statusNote">
                  <Textarea
                    id="statusNote"
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </Field>
                <Button
                  className="w-full"
                  disabled={!statusTo}
                  loading={busy === "status"}
                  onClick={() =>
                    void run("status", () =>
                      api(`/cases/${caseId}/status`, {
                        method: "PATCH",
                        body: { status: statusTo, note: statusNote || undefined },
                      }),
                    ).then(() => {
                      setStatusTo("");
                      setStatusNote("");
                    })
                  }
                >
                  Holatni yangilash
                </Button>
              </div>
              <div className="mt-5 border-t border-ink-100 pt-4">
                <p className="label">Mijozdan ma’lumot so‘rash</p>
                <Textarea
                  aria-label="So‘rov matni"
                  rows={2}
                  placeholder="Qanday ma’lumot kerakligini yozing…"
                  value={infoText}
                  onChange={(e) => setInfoText(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="mt-2 w-full"
                  disabled={infoText.trim().length < 5}
                  loading={busy === "info"}
                  onClick={() =>
                    void run("info", () =>
                      api(`/cases/${caseId}/request-info`, { body: { message: infoText } }),
                    ).then(() => setInfoText(""))
                  }
                >
                  So‘rov yuborish
                </Button>
              </div>
            </section>
          )}

          {isManager && (
            <section className="card" aria-labelledby="case-notes">
              <h2 id="case-notes" className="flex items-center gap-2 font-semibold text-ink-900">
                <Lock className="h-4 w-4 text-gold-600" aria-hidden />
                Ichki eslatmalar
              </h2>
              <p className="mt-1 text-xs text-ink-400">
                Faqat advokat va administratorga ko‘rinadi — mijoz ko‘rmaydi.
              </p>
              {notes.length > 0 && (
                <ul className="mt-3 space-y-2.5">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-xl bg-gold-50/60 px-3.5 py-2.5">
                      <p className="whitespace-pre-wrap text-sm text-ink-800">{n.body}</p>
                      <p className="mt-1 text-xs text-ink-400">
                        {n.author.profile?.fullName ?? "—"} · {formatDateTime(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (noteText.trim().length < 2) return;
                  void run("note", async () => {
                    await api(`/cases/${caseId}/notes`, { body: { body: noteText } });
                    setNoteText("");
                    const list = await api<CaseNote[]>(`/cases/${caseId}/notes`);
                    setNotes(list);
                  });
                }}
              >
                <Textarea
                  aria-label="Ichki eslatma"
                  rows={2}
                  className="min-h-0"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button type="submit" variant="secondary" loading={busy === "note"}>
                  Saqlash
                </Button>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
