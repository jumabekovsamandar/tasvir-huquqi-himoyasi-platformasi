"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Check, FileUp, Link2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { PLATFORM_LABELS } from "@/lib/labels";
import type { Evidence, Platform, ProtectedImage, ViolationReport } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Voqea haqida",
  "Qayerda ishlatilgan",
  "Dalillar",
  "Rozilik",
  "Zarar",
  "Ko‘rib chiqish",
];

type Draft = {
  protectedImageId?: string;
  description: string;
  discoveredAt: string;
  platform: Platform;
  platformOther?: string;
  infringingUrl?: string;
  publishedAt?: string;
  hadConsent: boolean;
  consentDetails?: string;
  commercialUse: boolean;
  damageDescription?: string;
};

function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [images, setImages] = useState<ProtectedImage[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [urlDesc, setUrlDesc] = useState("");
  const [draft, setDraft] = useState<Draft>({
    protectedImageId: params.get("imageId") ?? undefined,
    description: "",
    discoveredAt: new Date().toISOString().slice(0, 10),
    platform: "INSTAGRAM",
    hadConsent: false,
    commercialUse: false,
  });

  useEffect(() => {
    api<ProtectedImage[]>("/images")
      .then(setImages)
      .catch(() => {});
  }, []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function draftPayload() {
    return {
      protectedImageId: draft.protectedImageId || undefined,
      description: draft.description,
      discoveredAt: new Date(draft.discoveredAt).toISOString(),
      platform: draft.platform,
      platformOther: draft.platform === "OTHER" ? draft.platformOther : undefined,
      infringingUrl: draft.infringingUrl || undefined,
      publishedAt: draft.publishedAt ? new Date(draft.publishedAt).toISOString() : undefined,
      hadConsent: draft.hadConsent,
      consentDetails: draft.consentDetails || undefined,
      commercialUse: draft.commercialUse,
      damageDescription: draft.damageDescription || undefined,
    };
  }

  /** 2-bosqichdan keyin qoralama yaratiladi (dalillar unga bog'lanadi). */
  async function next() {
    setError(null);
    if (step === 0) {
      if (draft.description.trim().length < 20) {
        setError("Voqea tavsifi kamida 20 belgidan iborat bo‘lishi kerak.");
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!draft.infringingUrl && draft.platform !== "OTHER") {
        // URL ixtiyoriy, lekin yuborishda kamida bitta havola yoki dalil talab qilinadi
      }
      setBusy(true);
      try {
        if (!reportId) {
          const r = await api<ViolationReport>("/violations", { body: draftPayload() });
          setReportId(r.id);
        } else {
          await api(`/violations/${reportId}`, { method: "PATCH", body: draftPayload() });
        }
        setStep(2);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Saqlashda xatolik");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (step >= 2 && step < 5) {
      setBusy(true);
      try {
        await api(`/violations/${reportId}`, { method: "PATCH", body: draftPayload() });
        setStep(step + 1);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Saqlashda xatolik");
      } finally {
        setBusy(false);
      }
    }
  }

  async function submitReport() {
    if (!reportId) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/violations/${reportId}`, { method: "PATCH", body: draftPayload() });
      const r = await api<ViolationReport>(`/violations/${reportId}/submit`, { body: {} });
      router.replace(`/dashboard/cases/${r.case!.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Yuborishda xatolik");
      setBusy(false);
    }
  }

  async function uploadFile(file: File, type: string) {
    if (!reportId) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("reportId", reportId);
    fd.append("type", type);
    try {
      const ev = await api<Evidence>("/evidence/upload", { formData: fd });
      setEvidence((list) => [ev, ...list]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Fayl yuklanmadi");
    } finally {
      setBusy(false);
    }
  }

  async function addUrl() {
    if (!reportId || !urlInput) return;
    setBusy(true);
    setError(null);
    try {
      const ev = await api<Evidence>("/evidence/url", {
        body: { reportId, url: urlInput, description: urlDesc || undefined },
      });
      setEvidence((list) => [ev, ...list]);
      setUrlInput("");
      setUrlDesc("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "URL qo‘shilmadi");
    } finally {
      setBusy(false);
    }
  }

  async function removeEvidence(id: string) {
    try {
      await api(`/evidence/${id}`, { method: "DELETE" });
      setEvidence((list) => list.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "O‘chirilmadi");
    }
  }

  const selectedImage = images.find((i) => i.id === draft.protectedImageId);

  return (
    <>
      <PageHeader
        title="Huquqbuzarlik haqida hisobot"
        description="Ma’lumotlar bosqichma-bosqich saqlanadi — jarayonni keyinroq davom ettirishingiz mumkin."
      />

      {/* Bosqichlar indikatori */}
      <ol className="flex flex-wrap gap-2" aria-label="Hisobot bosqichlari">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
              i < step
                ? "bg-green-50 text-green-700"
                : i === step
                  ? "bg-ink-900 text-white"
                  : "bg-ink-100 text-ink-400",
            )}
          >
            {i < step ? <Check className="h-3 w-3" aria-hidden /> : `${i + 1}.`} {s}
          </li>
        ))}
      </ol>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="card max-w-3xl">
        {/* 1: Voqea haqida */}
        {step === 0 && (
          <div className="space-y-4">
            <Field
              label="Himoyalangan tasvir (ixtiyoriy)"
              htmlFor="image"
              hint="Reyestrdagi qaysi tasvir bilan bog‘liq bo‘lsa, tanlang"
            >
              <Select
                id="image"
                value={draft.protectedImageId ?? ""}
                onChange={(e) => set("protectedImageId", e.target.value || undefined)}
              >
                <option value="">— Tanlanmagan —</option>
                {images.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.title} ({img.registryCode})
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Nima sodir bo‘ldi?"
              htmlFor="description"
              hint="Suratingiz qayerda va qanday ishlatilganini batafsil yozing (kamida 20 belgi)"
              required
            >
              <Textarea
                id="description"
                rows={5}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Qachon aniqladingiz?" htmlFor="discoveredAt" required>
              <Input
                id="discoveredAt"
                type="date"
                value={draft.discoveredAt}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => set("discoveredAt", e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* 2: Qayerda */}
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Platforma" htmlFor="platform" required>
              <Select
                id="platform"
                value={draft.platform}
                onChange={(e) => set("platform", e.target.value as Platform)}
              >
                {Object.entries(PLATFORM_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            {draft.platform === "OTHER" && (
              <Field label="Platformani ko‘rsating" htmlFor="platformOther">
                <Input
                  id="platformOther"
                  value={draft.platformOther ?? ""}
                  onChange={(e) => set("platformOther", e.target.value)}
                />
              </Field>
            )}
            <Field
              label="Huquqbuzar kontent havolasi"
              htmlFor="url"
              hint="To‘liq URL (https:// bilan). Keyinroq dalil sifatida boshqa havolalar ham qo‘shishingiz mumkin."
            >
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={draft.infringingUrl ?? ""}
                onChange={(e) => set("infringingUrl", e.target.value)}
              />
            </Field>
            <Field label="E’lon qilingan sana (ma’lum bo‘lsa)" htmlFor="publishedAt">
              <Input
                id="publishedAt"
                type="date"
                value={draft.publishedAt ?? ""}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => set("publishedAt", e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* 3: Dalillar */}
        {step === 2 && (
          <div className="space-y-5">
            <Alert tone="info">
              Skrinshot, asl surat yoki PDF yuklang. Har bir fayl SHA-256
              nazorat yig‘indisi bilan saqlanadi. Yuborish uchun kamida bitta
              havola yoki dalil talab qilinadi.
            </Alert>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-ink-200 px-4 py-8 text-center hover:border-brand-300 hover:bg-brand-50/40">
                <FileUp className="h-6 w-6 text-ink-300" aria-hidden />
                <span className="mt-2 text-sm font-semibold text-ink-700">Skrinshot yuklash</span>
                <span className="mt-1 text-xs text-ink-400">JPEG, PNG, WebP · maks. 20 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f, "SCREENSHOT");
                    e.target.value = "";
                  }}
                />
              </label>
              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-ink-200 px-4 py-8 text-center hover:border-brand-300 hover:bg-brand-50/40">
                <FileUp className="h-6 w-6 text-ink-300" aria-hidden />
                <span className="mt-2 text-sm font-semibold text-ink-700">Boshqa fayl (rasm/PDF)</span>
                <span className="mt-1 text-xs text-ink-400">PDF ham qabul qilinadi</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f)
                      void uploadFile(
                        f,
                        f.type === "application/pdf" ? "PDF_DOCUMENT" : "ORIGINAL_IMAGE",
                      );
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className="rounded-xl border border-ink-100 p-4">
              <p className="label">URL dalil qo‘shish</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  aria-label="Dalil URL manzili"
                  type="url"
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <Input
                  aria-label="URL izohi"
                  placeholder="Izoh (ixtiyoriy)"
                  value={urlDesc}
                  onChange={(e) => setUrlDesc(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => void addUrl()} loading={busy}>
                  <Link2 className="h-4 w-4" aria-hidden /> Qo‘shish
                </Button>
              </div>
            </div>
            {evidence.length > 0 && (
              <ul className="divide-y divide-ink-50 rounded-xl border border-ink-100">
                {evidence.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {ev.kind === "URL" ? ev.url : ev.originalFilename}
                      </p>
                      <p className="text-xs text-ink-400">
                        {ev.kind === "URL" ? "Havola" : ev.mimeType}
                        {ev.description ? ` · ${ev.description}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => void removeEvidence(ev.id)}
                      className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Dalilni o‘chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 4: Rozilik */}
        {step === 3 && (
          <div className="space-y-4">
            <fieldset>
              <legend className="label">Ushbu foydalanishga rozilik berganmisiz?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  { v: false, label: "Yo‘q, rozilik bermaganman" },
                  { v: true, label: "Ha, lekin boshqa maqsad uchun" },
                ].map((opt) => (
                  <label
                    key={String(opt.v)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium",
                      draft.hadConsent === opt.v
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-ink-200 text-ink-600",
                    )}
                  >
                    <input
                      type="radio"
                      name="hadConsent"
                      className="h-4 w-4 text-brand-600 focus:ring-brand-400"
                      checked={draft.hadConsent === opt.v}
                      onChange={() => set("hadConsent", opt.v)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {draft.hadConsent && (
              <Field
                label="Rozilik tafsilotlari"
                htmlFor="consentDetails"
                hint="Qanday rozilik bergansiz va joriy foydalanish undan qanday farq qiladi?"
              >
                <Textarea
                  id="consentDetails"
                  rows={4}
                  value={draft.consentDetails ?? ""}
                  onChange={(e) => set("consentDetails", e.target.value)}
                />
              </Field>
            )}
            <label className="flex items-start gap-2.5 rounded-xl border border-ink-200 px-4 py-3 text-sm text-ink-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                checked={draft.commercialUse}
                onChange={(e) => set("commercialUse", e.target.checked)}
              />
              <span>
                <strong>Tijorat maqsadida ishlatilgan.</strong> Kontent reklama,
                sotuv yoki daromad olish bilan bog‘liq holda foydalanilgan.
              </span>
            </label>
          </div>
        )}

        {/* 5: Zarar */}
        {step === 4 && (
          <Field
            label="Zarar va oqibatlar"
            htmlFor="damage"
            hint="Moddiy yo‘qotish, obro‘ga ta’sir, ruhiy noqulaylik — bu ma’lumot talabnoma va tahlillarda ishlatiladi (ixtiyoriy)"
          >
            <Textarea
              id="damage"
              rows={6}
              value={draft.damageDescription ?? ""}
              onChange={(e) => set("damageDescription", e.target.value)}
            />
          </Field>
        )}

        {/* 6: Ko'rib chiqish */}
        {step === 5 && (
          <div className="space-y-4">
            <dl className="divide-y divide-ink-50">
              {(
                [
                  ["Tasvir", selectedImage ? `${selectedImage.title} (${selectedImage.registryCode})` : "Ko‘rsatilmagan"],
                  ["Tavsif", draft.description],
                  ["Platforma", PLATFORM_LABELS[draft.platform]],
                  ["Havola", draft.infringingUrl ?? "—"],
                  ["Aniqlangan sana", draft.discoveredAt],
                  ["Rozilik", draft.hadConsent ? "Berilgan (boshqa maqsadga)" : "Berilmagan"],
                  ["Tijorat foydalanish", draft.commercialUse ? "Ha" : "Yo‘q"],
                  ["Dalillar", `${evidence.length} ta${draft.infringingUrl ? " + asosiy havola" : ""}`],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-sm text-ink-500">{k}</dt>
                  <dd className="break-words text-sm font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            <Alert tone="warning">
              Yuborilgach hisobot tahrirlanmaydi va u bo‘yicha rasmiy ish (case)
              ochiladi. Ma’lumotlar to‘g‘riligini tekshiring.
            </Alert>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
          >
            {step === 0 ? "Bekor qilish" : "Orqaga"}
          </Button>
          {step < 5 ? (
            <Button type="button" onClick={() => void next()} loading={busy}>
              Davom etish
            </Button>
          ) : (
            <Button type="button" onClick={() => void submitReport()} loading={busy}>
              Hisobotni yuborish
            </Button>
          )}
        </div>
      </div>

      {reportId && step < 5 && (
        <p className="text-xs text-ink-400">
          Qoralama saqlangan.{" "}
          <Link href="/dashboard/violations?status=DRAFT" className="underline">
            Keyinroq davom ettirish
          </Link>{" "}
          mumkin.
        </p>
      )}
    </>
  );
}

export default function NewViolationPage() {
  return (
    <Suspense>
      <Wizard />
    </Suspense>
  );
}
