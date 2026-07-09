"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  Field,
  Input,
  PageSkeleton,
  Textarea,
} from "@/components/ui/primitives";
import { api, apiBlob, ApiError } from "@/lib/api";
import { DOCUMENT_TYPE_LABELS, formatDateTime } from "@/lib/labels";
import type { LegalDocument } from "@/lib/types";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");

  const load = useCallback(() => {
    api<LegalDocument>(`/documents/${id}`)
      .then((d) => {
        setDoc(d);
        setContent(d.content);
        setTitle(d.title);
        setRecipientName(d.recipientName ?? "");
        setRecipientContact(d.recipientContact ?? "");
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Hujjat topilmadi"));
  }, [id]);

  useEffect(load, [load]);

  async function save() {
    setBusy("save");
    setError(null);
    try {
      await api(`/documents/${id}`, {
        method: "PATCH",
        body: {
          title,
          content,
          recipientName: recipientName || undefined,
          recipientContact: recipientContact || undefined,
        },
      });
      setNotice("Saqlangan.");
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Saqlashda xatolik");
    } finally {
      setBusy(null);
    }
  }

  async function finalize() {
    setBusy("finalize");
    setError(null);
    try {
      await api(`/documents/${id}/finalize`, { body: {} });
      setConfirmFinalize(false);
      setNotice("Hujjat tasdiqlandi.");
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tasdiqlashda xatolik");
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    setBusy("pdf");
    try {
      const blob = await apiBlob(`/documents/${id}/pdf`);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `imagerights-${doc?.type.toLowerCase() ?? "hujjat"}-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError("PDF yuklab olinmadi");
    } finally {
      setBusy(null);
    }
  }

  if (error && !doc) return <Alert tone="error">{error}</Alert>;
  if (!doc) return <PageSkeleton />;

  const finalized = doc.status === "FINALIZED";

  return (
    <>
      <PageHeader
        title={DOCUMENT_TYPE_LABELS[doc.type]}
        description={`Ish: ${doc.case?.caseNumber ?? "—"} · Yaratilgan: ${formatDateTime(doc.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void downloadPdf()} loading={busy === "pdf"}>
              <Download className="h-4 w-4" aria-hidden /> PDF yuklab olish
            </Button>
            {!finalized && (
              <Button onClick={() => setConfirmFinalize(true)}>
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Tasdiqlash
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <Badge
          className={finalized ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-500"}
        >
          {finalized ? "Tasdiqlangan" : "Qoralama"}
        </Badge>
        {finalized && doc.finalizedAt && (
          <span className="text-sm text-ink-400">
            Tasdiqlangan: {formatDateTime(doc.finalizedAt)}
          </span>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {notice && !error && <Alert tone="success">{notice}</Alert>}
      {finalized && (
        <Alert tone="info">
          Tasdiqlangan hujjat tahrirlanmaydi. O‘zgartirish kerak bo‘lsa, xuddi
          shu ish uchun yangi hujjat yarating.
        </Alert>
      )}

      <div className="card max-w-4xl space-y-4">
        <Field label="Hujjat sarlavhasi" htmlFor="title">
          <Input
            id="title"
            value={title}
            disabled={finalized}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Qabul qiluvchi" htmlFor="recipientName">
            <Input
              id="recipientName"
              value={recipientName}
              disabled={finalized}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </Field>
          <Field label="Qabul qiluvchi kontakti" htmlFor="recipientContact">
            <Input
              id="recipientContact"
              value={recipientContact}
              disabled={finalized}
              onChange={(e) => setRecipientContact(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Hujjat matni" htmlFor="content" hint="Yuborishdan oldin barcha ma’lumotlar to‘g‘riligini tekshiring">
          <Textarea
            id="content"
            rows={24}
            className="font-mono text-[13px] leading-relaxed"
            value={content}
            disabled={finalized}
            onChange={(e) => setContent(e.target.value)}
          />
        </Field>
        {!finalized && (
          <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
            <Button variant="secondary" onClick={() => void save()} loading={busy === "save"}>
              <Save className="h-4 w-4" aria-hidden /> Saqlash
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmFinalize}
        title="Hujjatni tasdiqlash"
        description="Tasdiqlangach hujjat matni o‘zgartirilmaydi. Hujjatni o‘zingiz yuborishingiz kerak — platforma uni avtomatik yubormaydi."
        confirmLabel="Tasdiqlash"
        loading={busy === "finalize"}
        onConfirm={() => void finalize()}
        onClose={() => setConfirmFinalize(false)}
      />
    </>
  );
}
