"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard, OAuthButtons } from "@/components/auth/AuthCard";
import { Alert, Button, Field, Input } from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Me } from "@/lib/types";

const schema = z.object({
  email: z.string().email("Email noto‘g‘ri formatda"),
  password: z.string().min(1, "Parolni kiriting"),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      const res = await api<{ accessToken: string; user: Me }>("/auth/login", {
        body: data,
      });
      login(res.accessToken, res.user);
      const next = params.get("next");
      router.replace(
        next && next.startsWith("/")
          ? next
          : res.user.role === "ADMIN"
            ? "/admin"
            : res.user.role === "LAWYER"
              ? "/lawyer"
              : "/dashboard",
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Kirishda xatolik yuz berdi");
    }
  });

  return (
    <AuthCard
      title="Tizimga kirish"
      subtitle="Kabinetingizga kirib, tasvirlaringiz holatini kuzating."
      footer={
        <>
          Akkauntingiz yo‘qmi?{" "}
          <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Ro‘yxatdan o‘tish
          </Link>
        </>
      }
    >
      {params.get("expired") && (
        <Alert tone="warning" className="mb-4">
          Sessiya muddati tugadi. Qaytadan kiring.
        </Alert>
      )}
      {params.get("reset") && (
        <Alert tone="success" className="mb-4">
          Parol yangilandi. Endi yangi parol bilan kiring.
        </Alert>
      )}
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
        <Field label="Parol" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Parolni unutdingizmi?
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Kirish
        </Button>
      </form>
      <OAuthButtons />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
