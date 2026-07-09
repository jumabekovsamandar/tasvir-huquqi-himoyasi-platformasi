"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Alert, Skeleton } from "@/components/ui/primitives";
import { setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/** OAuth (Google/OneID) muvaffaqiyatli yakunlangach token shu yerga keladi. */
function Callback() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const { refresh } = useAuth();

  useEffect(() => {
    if (!token) return;
    setToken(token);
    void refresh().then(() => router.replace("/dashboard"));
  }, [token, refresh, router]);

  if (!token) {
    return (
      <AuthCard title="Kirish yakunlanmadi">
        <Alert tone="error">
          Token topilmadi. Iltimos, qaytadan urinib ko‘ring.
        </Alert>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Kirish yakunlanmoqda…">
      <Skeleton className="h-12" />
    </AuthCard>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <Callback />
    </Suspense>
  );
}
