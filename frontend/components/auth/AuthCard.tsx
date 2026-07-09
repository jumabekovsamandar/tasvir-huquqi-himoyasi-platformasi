"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { api, API_URL } from "@/lib/api";

/** OAuth tugmalari faqat backend haqiqatan sozlagan provayderlar uchun chiqadi. */
export function OAuthButtons() {
  const [providers, setProviders] = useState<{ google: boolean; oneid: boolean } | null>(null);

  useEffect(() => {
    api<{ google: boolean; oneid: boolean }>("/auth/providers")
      .then(setProviders)
      .catch(() => setProviders(null));
  }, []);

  if (!providers || (!providers.google && !providers.oneid)) return null;

  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100" aria-hidden />
        yoki
        <span className="h-px flex-1 bg-ink-100" aria-hidden />
      </div>
      <div className="space-y-2">
        {providers.google && (
          <a href={`${API_URL}/api/auth/google`} className="btn-secondary w-full">
            Google orqali davom etish
          </a>
        )}
        {providers.oneid && (
          <a href={`${API_URL}/api/auth/oneid`} className="btn-secondary w-full">
            OneID orqali davom etish
          </a>
        )}
      </div>
    </>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50/70 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-7 sm:p-8">
          <h1 className="text-xl font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <p className="mt-5 text-center text-sm text-ink-500">{footer}</p>
        )}
        <p className="mt-4 text-center text-xs text-ink-400">
          <Link href="/" className="hover:text-ink-600">
            ← Bosh sahifaga qaytish
          </Link>
        </p>
      </div>
    </div>
  );
}
