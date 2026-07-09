"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard, OAuthButtons } from "@/components/auth/AuthCard";
import { Alert, Button, Field, Input } from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Me } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    fullName: z.string().min(3, "To‘liq ismingizni kiriting"),
    email: z.string().email("Email noto‘g‘ri formatda"),
    password: z.string().min(8, "Parol kamida 8 belgidan iborat bo‘lishi kerak"),
    role: z.enum(["USER", "LAWYER"]),
    licenseNumber: z.string().optional(),
    consent: z.boolean().refine((v) => v, {
      message: "Davom etish uchun shartlarga rozilik bildiring",
    }),
  })
  .refine((d) => d.role !== "LAWYER" || (d.licenseNumber ?? "").trim().length > 2, {
    message: "Advokat litsenziyasi raqamini kiriting",
    path: ["licenseNumber"],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "USER", consent: false },
  });
  const role = watch("role");

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      const res = await api<{ accessToken: string; user: Me }>("/auth/register", {
        body: {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          role: data.role,
          ...(data.role === "LAWYER" ? { licenseNumber: data.licenseNumber } : {}),
        },
      });
      login(res.accessToken, res.user);
      router.replace(data.role === "LAWYER" ? "/lawyer" : "/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ro‘yxatdan o‘tishda xatolik");
    }
  });

  return (
    <AuthCard
      title="Ro‘yxatdan o‘tish"
      subtitle="Bir necha daqiqada tasvirlaringizni himoya ostiga oling."
      footer={
        <>
          Akkauntingiz bormi?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Kirish
          </Link>
        </>
      }
    >
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      <div className="mb-5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Akkaunt turi">
        {(
          [
            { value: "USER", label: "Foydalanuvchi" },
            { value: "LAWYER", label: "Advokat" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={role === opt.value}
            onClick={() => setValue("role", opt.value)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
              role === opt.value
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-ink-200 text-ink-600 hover:border-ink-300",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="To‘liq ism" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Familiya Ism"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="siz@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
        <Field
          label="Parol"
          htmlFor="password"
          error={errors.password?.message}
          hint="Kamida 8 belgi"
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        {role === "LAWYER" && (
          <>
            <Field
              label="Advokat litsenziyasi raqami"
              htmlFor="licenseNumber"
              error={errors.licenseNumber?.message}
              hint="Profil administrator tomonidan tekshirilgach tasdiqlanadi"
              required
            >
              <Input
                id="licenseNumber"
                placeholder="Masalan: AD-12345"
                aria-invalid={!!errors.licenseNumber}
                {...register("licenseNumber")}
              />
            </Field>
            <Alert tone="info">
              Advokat akkauntlari administrator tekshiruvidan o‘tadi. Tasdiqlangunga
              qadar sizga ishlar biriktirilmaydi.
            </Alert>
          </>
        )}
        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
              {...register("consent")}
            />
            <span>
              <Link href="/terms" className="font-medium text-brand-600 hover:underline" target="_blank">
                Foydalanish shartlari
              </Link>{" "}
              va{" "}
              <Link href="/privacy" className="font-medium text-brand-600 hover:underline" target="_blank">
                Maxfiylik siyosati
              </Link>
              ga roziman
            </span>
          </label>
          {errors.consent && (
            <p role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.consent.message}
            </p>
          )}
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Ro‘yxatdan o‘tish
        </Button>
      </form>
      <OAuthButtons />
    </AuthCard>
  );
}
