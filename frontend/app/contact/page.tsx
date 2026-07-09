"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { PublicPage } from "@/components/layout/PublicPage";
import {
  Alert,
  Button,
  Field,
  Input,
  Textarea,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Ismingizni kiriting"),
  email: z.string().email("Email noto‘g‘ri formatda"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Mavzuni kiriting"),
  message: z.string().min(10, "Xabar kamida 10 belgidan iborat bo‘lishi kerak"),
  privacyConsent: z.boolean().refine((v) => v, {
    message: "Maxfiylik siyosatiga rozilik berilishi shart",
  }),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { privacyConsent: false },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await api("/contact", {
        body: { ...data, phone: data.phone || undefined },
      });
      setDone(true);
      reset();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xabar yuborilmadi. Qayta urinib ko‘ring.");
    }
  });

  return (
    <PublicPage
      eyebrow="Aloqa"
      title="Biz bilan bog‘laning"
      intro="Savol, taklif yoki hamkorlik bo‘yicha murojaatingizni qoldiring — tez orada javob beramiz."
    >
      <div className="mx-auto grid max-w-4xl items-start gap-8 lg:grid-cols-[1fr_320px]">
        <div className="card">
          {done ? (
            <Alert tone="success">
              Murojaatingiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.
            </Alert>
          ) : (
            <>
              {error && (
                <Alert tone="error" className="mb-4">
                  {error}
                </Alert>
              )}
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Ismingiz" htmlFor="name" error={errors.name?.message} required>
                    <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
                  </Field>
                  <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Telefon (ixtiyoriy)" htmlFor="phone" error={errors.phone?.message}>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+998 90 123 45 67"
                      {...register("phone")}
                    />
                  </Field>
                  <Field label="Mavzu" htmlFor="subject" error={errors.subject?.message} required>
                    <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} />
                  </Field>
                </div>
                <Field label="Xabar" htmlFor="message" error={errors.message?.message} required>
                  <Textarea id="message" rows={6} aria-invalid={!!errors.message} {...register("message")} />
                </Field>
                <div>
                  <label className="flex items-start gap-2.5 text-sm text-ink-600">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                      {...register("privacyConsent")}
                    />
                    <span>
                      Shaxsiy ma’lumotlarim{" "}
                      <Link href="/privacy" target="_blank" className="font-medium text-brand-600 hover:underline">
                        Maxfiylik siyosati
                      </Link>
                      ga muvofiq qayta ishlanishiga roziman
                    </span>
                  </label>
                  {errors.privacyConsent && (
                    <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                      {errors.privacyConsent.message}
                    </p>
                  )}
                </div>
                <Button type="submit" loading={isSubmitting}>
                  Xabarni yuborish
                </Button>
              </form>
            </>
          )}
        </div>
        <aside className="card bg-ink-950 text-white">
          <Mail className="h-6 w-6 text-gold-300" aria-hidden />
          <h2 className="mt-3 font-semibold">Murojaatlar qanday ko‘rib chiqiladi?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            Har bir murojaat platforma administratsiyasi tomonidan ro‘yxatga
            olinadi va ko‘rib chiqiladi. Huquqbuzarlik holatini xabar qilmoqchi
            bo‘lsangiz, kabinet orqali tuzilmali hisobot yaratish tezroq natija
            beradi.
          </p>
          <Link
            href="/report"
            className="mt-4 inline-block text-sm font-semibold text-brand-400 hover:text-brand-300"
          >
            Huquqbuzarlik haqida xabar berish →
          </Link>
        </aside>
      </div>
    </PublicPage>
  );
}
