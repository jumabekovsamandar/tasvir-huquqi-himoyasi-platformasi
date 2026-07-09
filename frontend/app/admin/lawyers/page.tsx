"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/labels";
import { Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

type LawyerRow = {
  id: string;
  licenseNumber: string;
  specialization?: string | null;
  experienceYears?: number | null;
  bio?: string | null;
  verified: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    profile?: { fullName: string; phone?: string | null } | null;
    _count: { assignedCases: number };
  };
};

function AdminLawyers() {
  const params = useSearchParams();
  const initial = params.get("verified");
  const [filter, setFilter] = useState<"" | "true" | "false">(
    initial === "true" || initial === "false" ? initial : "",
  );
  const [lawyers, setLawyers] = useState<LawyerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<LawyerRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLawyers(null);
    api<LawyerRow[]>(`/admin/lawyers${filter ? `?verified=${filter}` : ""}`)
      .then(setLawyers)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
  }, [filter]);

  useEffect(load, [load]);

  async function toggleVerify() {
    if (!target) return;
    setBusy(true);
    try {
      await api(`/admin/lawyers/${target.user.id}/verify`, {
        method: "PATCH",
        body: { verified: !target.verified },
      });
      setTarget(null);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Amal bajarilmadi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Advokatlar"
        description="Litsenziya ma’lumotlarini tekshiring va profillarni tasdiqlang — faqat tasdiqlangan advokatlarga ish biriktiriladi."
      />

      <div className="flex gap-2" role="tablist" aria-label="Tasdiqlash holati">
        {(
          [
            { v: "", label: "Barchasi" },
            { v: "false", label: "Tasdiqlanmagan" },
            { v: "true", label: "Tasdiqlangan" },
          ] as const
        ).map((t) => (
          <button
            key={t.v}
            role="tab"
            aria-selected={filter === t.v}
            onClick={() => setFilter(t.v)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold",
              filter === t.v ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {!error && lawyers === null && <PageSkeleton />}
      {lawyers !== null &&
        (lawyers.length === 0 ? (
          <EmptyState
            icon={Gavel}
            title="Advokatlar topilmadi"
            description="Advokatlar ro‘yxatdan o‘tganda shu yerda ko‘rinadi."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {lawyers.map((l) => (
              <div key={l.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-ink-900">
                      {l.user.profile?.fullName ?? "—"}
                    </h2>
                    <p className="text-sm text-ink-500">{l.user.email}</p>
                  </div>
                  <Badge
                    className={
                      l.verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }
                  >
                    {l.verified ? "Tasdiqlangan" : "Kutilmoqda"}
                  </Badge>
                </div>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-36 shrink-0 text-ink-500">Litsenziya:</dt>
                    <dd className="font-mono font-medium text-ink-900">{l.licenseNumber}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-36 shrink-0 text-ink-500">Mutaxassislik:</dt>
                    <dd className="text-ink-800">{l.specialization ?? "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-36 shrink-0 text-ink-500">Faol ishlar:</dt>
                    <dd className="text-ink-800">{l.user._count.assignedCases} ta</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-36 shrink-0 text-ink-500">Ro‘yxatdan o‘tgan:</dt>
                    <dd className="text-ink-800">{formatDate(l.createdAt)}</dd>
                  </div>
                </dl>
                {l.bio && <p className="mt-3 text-sm text-ink-600">{l.bio}</p>}
                <Button
                  variant={l.verified ? "danger" : "primary"}
                  className="mt-4"
                  onClick={() => setTarget(l)}
                >
                  {l.verified ? "Tasdiqni bekor qilish" : "Tasdiqlash"}
                </Button>
              </div>
            ))}
          </div>
        ))}

      <ConfirmDialog
        open={!!target}
        title={target?.verified ? "Tasdiqni bekor qilish" : "Advokatni tasdiqlash"}
        description={
          target?.verified
            ? `${target.user.email} profilining tasdig‘i bekor qilinadi — unga yangi ishlar biriktirilmaydi.`
            : `Litsenziya ma’lumotlarini tekshirganingizga ishonch hosil qiling: ${target?.licenseNumber}. Tasdiqlangach unga ishlar biriktirilishi mumkin.`
        }
        confirmLabel={target?.verified ? "Bekor qilish" : "Tasdiqlash"}
        danger={target?.verified}
        loading={busy}
        onConfirm={() => void toggleVerify()}
        onClose={() => setTarget(null)}
      />
    </>
  );
}

export default function AdminLawyersPage() {
  return (
    <Suspense>
      <AdminLawyers />
    </Suspense>
  );
}
