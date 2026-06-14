"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      // Token JWT — keyingi API so‘rovlari uchun saqlanadi.
      window.localStorage.setItem("imagerights_token", token);
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [params, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Logo />
      <div className="flex items-center gap-3 text-ink-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
        Tizimga kiritilmoqda...
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
