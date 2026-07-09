"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Button,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import type { ProtectedImage } from "@/lib/types";

const MAX_MB = 10;

const schema = z.object({
  title: z.string().min(2, "Sarlavha kiriting"),
  description: z.string().optional(),
  ownershipNote: z.string().optional(),
  capturedAt: z.string().optional(),
  firstPublishedAt: z.string().optional(),
  publicationSource: z.string().optional(),
  consentRestrictions: z.string().optional(),
  commercialUseAllowed: z.boolean(),
  tags: z.string().optional(),
  privacyLevel: z.enum(["PRIVATE", "RESTRICTED"]),
});
type FormData = z.infer<typeof schema>;

export default function NewImagePage() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { commercialUseAllowed: false, privacyLevel: "PRIVATE" },
  });

  function pickFile(f: File | null) {
    setError(null);
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Faqat JPEG, PNG yoki WebP formatidagi fayllar qabul qilinadi.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Fayl hajmi ${MAX_MB} MB dan oshmasligi kerak.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!file) {
      setError("Tasvir faylini tanlang.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", data.title);
    if (data.description) fd.append("description", data.description);
    if (data.ownershipNote) fd.append("ownershipNote", data.ownershipNote);
    if (data.capturedAt) fd.append("capturedAt", new Date(data.capturedAt).toISOString());
    if (data.firstPublishedAt)
      fd.append("firstPublishedAt", new Date(data.firstPublishedAt).toISOString());
    if (data.publicationSource) fd.append("publicationSource", data.publicationSource);
    if (data.consentRestrictions) fd.append("consentRestrictions", data.consentRestrictions);
    fd.append("commercialUseAllowed", String(data.commercialUseAllowed));
    if (data.tags) fd.append("tags", data.tags);
    fd.append("privacyLevel", data.privacyLevel);

    try {
      const img = await api<ProtectedImage>("/images", { formData: fd });
      router.replace(`/dashboard/images/${img.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Yuklashda xatolik yuz berdi");
    }
  });

  return (
    <>
      <PageHeader
        title="Tasvirni ro‘yxatdan o‘tkazish"
        description="Yuklangan faylga vaqt tamg‘asi va SHA-256 nazorat yig‘indisi biriktiriladi hamda unikal reyestr kodi beriladi."
      />
      <Alert tone="info">
        Ichki reyestr yozuvi egalikni dalillashda yordamchi hujjat bo‘lib,
        davlat intellektual mulk ro‘yxatidan o‘tkazish o‘rnini bosmaydi.
      </Alert>
      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={onSubmit} className="grid items-start gap-6 lg:grid-cols-[360px_1fr]" noValidate>
        {/* Fayl tanlash */}
        <div className="card">
          <p className="label">
            Tasvir fayli <span className="text-red-500">*</span>
          </p>
          {preview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Tanlangan tasvir ko‘rinishi"
                className="max-h-72 w-full rounded-xl object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
                className="absolute right-2 top-2 rounded-full bg-ink-900/70 p-1.5 text-white hover:bg-ink-900"
                aria-label="Faylni olib tashlash"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-ink-200 px-6 py-12 text-center hover:border-brand-300 hover:bg-brand-50/40"
            >
              <ImagePlus className="h-8 w-8 text-ink-300" aria-hidden />
              <span className="mt-3 text-sm font-semibold text-ink-700">
                Faylni tanlash
              </span>
              <span className="mt-1 text-xs text-ink-400">
                JPEG, PNG yoki WebP · maks. {MAX_MB} MB
              </span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Tasvir faylini tanlash"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Metama'lumotlar */}
        <div className="card space-y-4">
          <Field label="Sarlavha" htmlFor="title" error={errors.title?.message} required>
            <Input id="title" placeholder="Masalan: Portret, 2026" {...register("title")} />
          </Field>
          <Field label="Tavsif" htmlFor="description">
            <Textarea id="description" rows={3} {...register("description")} />
          </Field>
          <Field
            label="Egalik haqida ma’lumot"
            htmlFor="ownershipNote"
            hint="Suratni kim va qanday sharoitda yaratgan, egalik asosi"
          >
            <Textarea id="ownershipNote" rows={2} {...register("ownershipNote")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Yaratilgan sana" htmlFor="capturedAt">
              <Input id="capturedAt" type="date" {...register("capturedAt")} />
            </Field>
            <Field label="Birinchi e’lon qilingan sana" htmlFor="firstPublishedAt">
              <Input id="firstPublishedAt" type="date" {...register("firstPublishedAt")} />
            </Field>
          </div>
          <Field label="E’lon qilingan manba" htmlFor="publicationSource" hint="Masalan: shaxsiy Instagram sahifa">
            <Input id="publicationSource" {...register("publicationSource")} />
          </Field>
          <Field
            label="Rozilik cheklovlari"
            htmlFor="consentRestrictions"
            hint="Kimga va qanday foydalanishga ruxsat berilgan yoki taqiqlangan"
          >
            <Textarea id="consentRestrictions" rows={2} {...register("consentRestrictions")} />
          </Field>
          <Field label="Teglar" htmlFor="tags" hint="Vergul bilan ajrating: portret, reklama, 2026">
            <Input id="tags" {...register("tags")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Maxfiylik darajasi"
              htmlFor="privacyLevel"
              hint="RESTRICTED — ishga biriktirilgan advokat ham ko‘ra oladi"
            >
              <Select id="privacyLevel" {...register("privacyLevel")}>
                <option value="PRIVATE">Faqat men</option>
                <option value="RESTRICTED">Men va biriktirilgan advokat</option>
              </Select>
            </Field>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 text-sm text-ink-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                  {...register("commercialUseAllowed")}
                />
                Tijorat maqsadida foydalanishga ruxsat berilgan
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Reyestrga kiritish
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
