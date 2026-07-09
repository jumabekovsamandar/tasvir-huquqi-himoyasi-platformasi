"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FileWarning, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  EmptyState,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import {
  formatDate,
  PLATFORM_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from "@/lib/labels";
import type { ViolationReport, ViolationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { v: string; label: string }[] = [
  { v: "", label: "Barchasi" },
  { v: "DRAFT", label: "Qoralama" },
  { v: "SUBMITTED", label: "Yuborilgan" },
  { v: "UNDER_REVIEW", label: "Ko‘rib chiqilmoqda" },
  { v: "ACTION_REQUIRED", label: "Ma’lumot kerak" },
  { v: "RESOLVED", label: "Hal qilingan" },
];

function ViolationsList() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [reports, setReports] = useState<ViolationReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReports(null);
    api<ViolationReport[]>(`/violations${status ? `?status=${status}` : ""}`)
      .then(setReports)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"),
      );
  }, [status]);

  return (
    <>
      <PageHeader
        title="Huquqbuzarlik hisobotlari"
        description="Ruxsatsiz foydalanish holatlari bo‘yicha hisobotlaringiz."
        action={
          <Link href="/dashboard/violations/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> Yangi hisobot
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Holat bo‘yicha filtr">
        {FILTERS.map((f) => (
          <button
            key={f.v}
            role="tab"
            aria-selected={status === f.v}
            onClick={() => setStatus(f.v)}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-semibold",
              status === f.v ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {!error && reports === null && <PageSkeleton />}
      {reports !== null &&
        (reports.length === 0 ? (
          <EmptyState
            icon={FileWarning}
            title="Hisobotlar topilmadi"
            description="Suratingiz ruxsatsiz ishlatilganini aniqlasangiz, tuzilmali hisobot yarating — dalillar tartibli saqlanadi."
            action={{ label: "Hisobot yaratish", href: "/dashboard/violations/new" }}
          />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3.5 font-semibold">Hisobot</th>
                  <th className="px-5 py-3.5 font-semibold">Platforma</th>
                  <th className="px-5 py-3.5 font-semibold">Dalillar</th>
                  <th className="px-5 py-3.5 font-semibold">Yangilangan</th>
                  <th className="px-5 py-3.5 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/60">
                    <td className="max-w-[280px] px-5 py-3.5">
                      <Link
                        href={`/dashboard/violations/${r.id}`}
                        className="font-medium text-ink-900 hover:text-brand-600"
                      >
                        <span className="line-clamp-1">{r.description}</span>
                      </Link>
                      {r.case && (
                        <span className="font-mono text-xs text-ink-400">
                          {r.case.caseNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">
                      {PLATFORM_LABELS[r.platform]}
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">
                      {r._count?.evidence ?? 0} ta
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">{formatDate(r.updatedAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={STATUS_TONES[r.status as ViolationStatus]}>
                        {STATUS_LABELS[r.status as ViolationStatus]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </>
  );
}

export default function ViolationsPage() {
  return (
    <Suspense>
      <ViolationsList />
    </Suspense>
  );
}
