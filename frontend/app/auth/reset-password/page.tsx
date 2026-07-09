"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { Alert, Button, Field, Input } from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";

const schema = z
  .object({
    password: z.string().min(8, "Parol kamida 8 belgidan iborat bo‘lishi kerak"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Parollar mos kelmadi",
    path: ["confirm"],
  });
type FormData = z.infer<typeof schema>;

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await api("/auth/reset-password", { body: { token, password: data.password } });
      router.replace("/auth/login?reset=1");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi");
    }
  });

  if (!token) {
    return (
      <AuthCard title="Parolni tiklash">
        <Alert tone="error">
          Havola noto‘g‘ri. Iltimos, emaildagi havoladan foydalaning yoki
          qaytadan so‘rov yuboring.
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Yangi parol o‘rnatish">
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Yangi parol" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <Field label="Parolni takrorlang" htmlFor="confirm" error={errors.confirm?.message} required>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Parolni yangilash
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
