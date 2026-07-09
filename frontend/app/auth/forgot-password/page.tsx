"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { Alert, Button, Field, Input } from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";

const schema = z.object({ email: z.string().email("Email noto‘g‘ri formatda") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await api("/auth/forgot-password", { body: data });
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi");
    }
  });

  return (
    <AuthCard
      title="Parolni tiklash"
      subtitle="Email manzilingizni kiriting — tiklash havolasini yuboramiz."
      footer={
        <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Kirish sahifasiga qaytish
        </Link>
      }
    >
      {done ? (
        <Alert tone="success">
          Agar bu email ro‘yxatdan o‘tgan bo‘lsa, parolni tiklash havolasi
          yuborildi. Pochta qutingizni tekshiring.
        </Alert>
      ) : (
        <>
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
            <Button type="submit" loading={isSubmitting} className="w-full">
              Havolani yuborish
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
