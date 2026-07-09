"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Alert, Skeleton } from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";

function VerifyEmail() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Havola noto‘g‘ri.");
      return;
    }
    api<{ message: string }>("/auth/verify-email", { body: { token } })
      .then((r) => {
        setState("ok");
        setMessage(r.message);
      })
      .catch((e) => {
        setState("error");
        setMessage(e instanceof ApiError ? e.message : "Tasdiqlashda xatolik");
      });
  }, [token]);

  return (
    <AuthCard
      title="Email tasdiqlash"
      footer={
        <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Kirish sahifasiga o‘tish
        </Link>
      }
    >
      {state === "loading" && <Skeleton className="h-12" />}
      {state === "ok" && <Alert tone="success">{message}</Alert>}
      {state === "error" && <Alert tone="error">{message}</Alert>}
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
