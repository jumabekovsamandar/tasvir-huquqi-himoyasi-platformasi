"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  PageSkeleton,
  Select,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { DOCUMENT_TYPE_LABELS, formatDate } from "@/lib/labels";
import type { CaseListItem, DocumentType, LegalDocument } from "@/lib/types";

function DocumentsPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [docs, setDocs] = useState<LegalDocument[] | null>(null);
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [caseId, setCaseId] = useState(params.get("caseId") ?? "");
  const [docType, setDocType] = useState<DocumentType>("TAKEDOWN_REQUEST");
  const [recipientName, setRecipientName] = useState("");

  useEffect(() => {
    api<LegalDocument[]>("/documents")
      .then(setDocs)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
    api<CaseListItem[]>("/cases")
      .then(setCases)
      .catch(() => {});
  }, []);

  async function generate() {
    if (!caseId) {
      setGenError("Avval ishni tanlang.");
      return;
    }
    setBusy(true);
    setGenError(null);
    try {
      const doc = await api<LegalDocument>("/documents/generate", {
        body: {
          caseId,
          type: docType,
          recipientName: recipientName || undefined,
        },
      });
      router.push(`/dashboard/documents/${doc.id}`);
    } catch (e) {
      setGenError(e instanceof ApiError ? e.message : "Hujjat yaratilmadi");
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Huquqiy hujjatlar"
        description="Ish ma’lumotlari asosida avtomatik to‘ldiriladigan hujjat qoralamalari."
      />

      <section className="card" aria-labelledby="gen-title">
        <h2 id="gen-title" className="font-semibold text-ink-900">
          Yangi hujjat yaratish
        </h2>
        {cases.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            Hujjat yaratish uchun avval{" "}
            <Link href="/dashboard/violations/new" className="font-semibold text-brand-600 hover:underline">
              huquqbuzarlik hisoboti
            </Link>{" "}
            yuborilgan bo‘lishi kerak.
          </p>
        ) : (
          <>
            {genError && (
              <Alert tone="error" className="mt-3">
                {genError}
              </Alert>
            )}
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
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
              <Field label="Hujjat turi" htmlFor="docType" required>
                <Select
                  id="docType"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                >
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Qabul qiluvchi (ixtiyoriy)" htmlFor="recipient">
                <Input
                  id="recipient"
                  placeholder="Masalan: Instagram Support"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </Field>
              <div className="flex items-end">
                <Button onClick={() => void generate()} loading={busy}>
                  <Plus className="h-4 w-4" aria-hidden /> Yaratish
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-400">
              Hujjat qoralama sifatida yaratiladi — uni tahrirlab, tasdiqlagach
              PDF sifatida yuklab olasiz. Platforma hujjatni avtomatik yubormaydi.
            </p>
          </>
        )}
      </section>

      {error && <Alert tone="error">{error}</Alert>}
      {!error && docs === null && <PageSkeleton />}
      {docs !== null &&
        (docs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Hujjatlar yo‘q"
            description="Yuqoridagi forma orqali ishingiz uchun birinchi hujjat qoralamasini yarating."
          />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3.5 font-semibold">Hujjat</th>
                  <th className="px-5 py-3.5 font-semibold">Ish</th>
                  <th className="px-5 py-3.5 font-semibold">Yaratilgan</th>
                  <th className="px-5 py-3.5 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-ink-50/60">
                    <td className="max-w-[320px] px-5 py-3.5">
                      <Link
                        href={`/dashboard/documents/${d.id}`}
                        className="font-medium text-ink-900 hover:text-brand-600"
                      >
                        <span className="line-clamp-1">{d.title}</span>
                      </Link>
                      <span className="text-xs text-ink-400">
                        {DOCUMENT_TYPE_LABELS[d.type]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-ink-600">
                      {d.case?.caseNumber ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">{formatDate(d.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className={
                          d.status === "FINALIZED"
                            ? "bg-green-50 text-green-700"
                            : "bg-ink-100 text-ink-500"
                        }
                      >
                        {d.status === "FINALIZED" ? "Tasdiqlangan" : "Qoralama"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense>
      <DocumentsPageInner />
    </Suspense>
  );
}
