"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Archive, ArchiveRestore, Download, FileWarning } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, apiBlob, ApiError } from "@/lib/api";
import { formatDate, formatBytes, STATUS_LABELS, STATUS_TONES } from "@/lib/labels";
import type { ProtectedImage } from "@/lib/types";

export default function ImageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [image, setImage] = useState<ProtectedImage | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<ProtectedImage>(`/images/${id}`)
      .then(setImage)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Tasvirni yuklab bo‘lmadi"),
      );
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    let url: string | null = null;
    apiBlob(`/images/${id}/file`)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setPreview(url);
      })
      .catch(() => {});
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  async function toggleArchive() {
    if (!image) return;
    setBusy(true);
    try {
      await api(`/images/${id}/${image.state === "ACTIVE" ? "archive" : "restore"}`, { body: {} });
      setConfirmArchive(false);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Amal bajarilmadi");
    } finally {
      setBusy(false);
    }
  }

  async function downloadSummary() {
    const data = await api<Record<string, unknown>>(`/images/${id}/summary`);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `imagerights-reyestr-${image?.registryCode ?? id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!image) return <PageSkeleton />;

  const meta: [string, string][] = [
    ["Reyestr kodi", image.registryCode],
    ["Qo‘shilgan sana", formatDate(image.createdAt)],
    ["Fayl turi", image.mimeType],
    ["Hajmi", formatBytes(image.sizeBytes)],
    ["SHA-256", image.sha256],
    ["Yaratilgan sana", formatDate(image.capturedAt)],
    ["Birinchi e’lon", formatDate(image.firstPublishedAt)],
    ["E’lon manbasi", image.publicationSource ?? "—"],
    ["Rozilik cheklovlari", image.consentRestrictions ?? "—"],
    ["Egalik izohi", image.ownershipNote ?? "—"],
    [
      "Tijorat foydalanish",
      image.commercialUseAllowed ? "Ruxsat berilgan" : "Taqiqlangan",
    ],
    [
      "Maxfiylik",
      image.privacyLevel === "PRIVATE" ? "Faqat egasi" : "Egasi va biriktirilgan advokat",
    ],
  ];

  return (
    <>
      <PageHeader
        title={image.title}
        description={image.description ?? undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={downloadSummary}>
              <Download className="h-4 w-4" aria-hidden /> Reyestr xulosasi
            </Button>
            <Link
              href={`/dashboard/violations/new?imageId=${image.id}`}
              className="btn-primary"
            >
              <FileWarning className="h-4 w-4" aria-hidden /> Huquqbuzarlik haqida xabar
            </Link>
          </div>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[400px_1fr]">
        <div className="card">
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt={image.title}
              className="w-full rounded-xl object-contain"
            />
          ) : (
            <div className="flex h-56 items-center justify-center rounded-xl bg-ink-50 text-sm text-ink-400">
              Tasvir yuklanmoqda…
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-ink-100 font-mono text-ink-700">{image.registryCode}</Badge>
            <Badge
              className={
                image.state === "ACTIVE"
                  ? "bg-green-50 text-green-700"
                  : "bg-ink-100 text-ink-500"
              }
            >
              {image.state === "ACTIVE" ? "Faol" : "Arxivda"}
            </Badge>
            {image.tags.map((t) => (
              <Badge key={t} className="bg-brand-50 text-brand-700">
                #{t}
              </Badge>
            ))}
          </div>
          <Button
            variant={image.state === "ACTIVE" ? "danger" : "secondary"}
            className="mt-4 w-full"
            onClick={() =>
              image.state === "ACTIVE" ? setConfirmArchive(true) : void toggleArchive()
            }
            loading={busy && image.state !== "ACTIVE"}
          >
            {image.state === "ACTIVE" ? (
              <>
                <Archive className="h-4 w-4" aria-hidden /> Arxivlash
              </>
            ) : (
              <>
                <ArchiveRestore className="h-4 w-4" aria-hidden /> Arxivdan qaytarish
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <section className="card" aria-labelledby="meta-title">
            <h2 id="meta-title" className="font-semibold text-ink-900">
              Ro‘yxatga olish ma’lumotlari
            </h2>
            <dl className="mt-4 divide-y divide-ink-50">
              {meta.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[200px_1fr]">
                  <dt className="text-sm text-ink-500">{k}</dt>
                  <dd className="break-all text-sm font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card" aria-labelledby="reports-title">
            <h2 id="reports-title" className="font-semibold text-ink-900">
              Bog‘liq hisobotlar
            </h2>
            {!image.reports?.length ? (
              <p className="mt-3 text-sm text-ink-500">
                Bu tasvir bo‘yicha huquqbuzarlik hisobotlari yo‘q.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-50">
                {image.reports.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <Link
                      href={`/dashboard/violations/${r.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Hisobot · {formatDate(r.createdAt)}
                    </Link>
                    <Badge className={STATUS_TONES[r.status]}>
                      {STATUS_LABELS[r.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        title="Tasvirni arxivlash"
        description="Arxivlangan tasvir ro‘yxatlarda ko‘rinmaydi, lekin reyestr yozuvi va bog‘liq hisobotlar saqlanib qoladi. Keyin qaytarishingiz mumkin."
        confirmLabel="Arxivlash"
        danger
        loading={busy}
        onConfirm={() => void toggleArchive()}
        onClose={() => setConfirmArchive(false)}
      />
    </>
  );
}
