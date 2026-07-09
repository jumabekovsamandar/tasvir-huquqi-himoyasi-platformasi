"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  FileWarning,
  Gavel,
  ImageIcon,
  Plus,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Button,
  EmptyState,
  PageSkeleton,
  StatCard,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ACTIVITY_LABELS, formatDateTime } from "@/lib/labels";
import type { UserOverview } from "@/lib/types";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<UserOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    api<UserOverview>("/dashboard/overview")
      .then(setData)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Ma’lumotlarni yuklab bo‘lmadi"),
      );
  }, []);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <PageSkeleton />;

  const isEmpty =
    data.images === 0 && data.openReports === 0 && data.activeCases === 0;

  return (
    <>
      <PageHeader
        title={`Xush kelibsiz, ${user?.profile?.fullName?.split(" ")[0] ?? ""}!`}
        description="Tasvir huquqlaringizning umumiy holati."
        action={
          <Link href="/dashboard/images/new" className="btn-primary">
            <Upload className="h-4 w-4" aria-hidden /> Tasvir qo‘shish
          </Link>
        }
      />

      {user && !user.emailVerified && user.provider === "EMAIL" && (
        <Alert tone="warning">
          Email manzilingiz hali tasdiqlanmagan.{" "}
          {resent ? (
            "Tasdiqlash havolasi yuborildi."
          ) : (
            <button
              className="font-semibold underline"
              onClick={() => {
                void api("/auth/resend-verification", { body: {} })
                  .then(() => setResent(true))
                  .catch(() => {});
              }}
            >
              Havolani qayta yuborish
            </button>
          )}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Himoyalangan tasvir" value={data.images} icon={ImageIcon} tone="brand" />
        <StatCard label="Ochiq hisobotlar" value={data.openReports} icon={ShieldAlert} tone="amber" />
        <StatCard label="Faol ishlar" value={data.activeCases} icon={Gavel} tone="ink" />
        <StatCard label="Yakunlangan ishlar" value={data.resolvedCases} icon={CheckCircle2} tone="green" />
      </div>

      {isEmpty ? (
        <EmptyState
          icon={ImageIcon}
          title="Himoyani boshlash uchun birinchi tasviringizni qo‘shing"
          description="Reyestrga kiritilgan tasvir vaqt tamg‘asi va raqamli barmoq izi bilan qayd etiladi — bu huquqbuzarlik yuz berganda dalil bazangiz bo‘ladi."
          action={{ label: "Tasvirni ro‘yxatdan o‘tkazish", href: "/dashboard/images/new" }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card lg:col-span-2" aria-labelledby="activity-title">
            <div className="flex items-center justify-between">
              <h2 id="activity-title" className="font-semibold text-ink-900">
                So‘nggi faoliyat
              </h2>
              <Activity className="h-4 w-4 text-ink-300" aria-hidden />
            </div>
            {data.recentActivity.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">Hozircha faoliyat qayd etilmagan.</p>
            ) : (
              <ul className="mt-4 divide-y divide-ink-50">
                {data.recentActivity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-ink-800">
                      {ACTIVITY_LABELS[a.action] ?? a.action}
                    </span>
                    <span className="shrink-0 text-xs text-ink-400">
                      {formatDateTime(a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card" aria-labelledby="quick-title">
            <h2 id="quick-title" className="font-semibold text-ink-900">
              Tezkor amallar
            </h2>
            <div className="mt-4 flex flex-col gap-2.5">
              <Link href="/dashboard/violations/new" className="btn-secondary justify-start">
                <FileWarning className="h-4 w-4 text-amber-500" aria-hidden />
                Huquqbuzarlik haqida xabar berish
              </Link>
              <Link href="/dashboard/images/new" className="btn-secondary justify-start">
                <Plus className="h-4 w-4 text-brand-500" aria-hidden />
                Yangi tasvir qo‘shish
              </Link>
              <Link href="/dashboard/assistant" className="btn-secondary justify-start">
                <Gavel className="h-4 w-4 text-gold-600" aria-hidden />
                AI yordamchidan tahlil olish
              </Link>
            </div>
            {data.drafts > 0 && (
              <Alert tone="info" className="mt-4">
                Sizda {data.drafts} ta yuborilmagan qoralama hisobot bor.{" "}
                <Link href="/dashboard/violations?status=DRAFT" className="font-semibold underline">
                  Ko‘rish
                </Link>
              </Alert>
            )}
          </section>
        </div>
      )}
    </>
  );
}
