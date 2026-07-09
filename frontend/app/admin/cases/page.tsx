"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Gavel } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  PageSkeleton,
  Select,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import {
  formatDate,
  PLATFORM_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from "@/lib/labels";
import type { CaseListItem } from "@/lib/types";

type LawyerOption = {
  user: { id: string; profile?: { fullName: string } | null; email: string };
  verified: boolean;
};

export default function AdminCasesPage() {
  const [cases, setCases] = useState<CaseListItem[] | null>(null);
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    api<CaseListItem[]>("/cases")
      .then(setCases)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
    api<LawyerOption[]>("/admin/lawyers?verified=true")
      .then(setLawyers)
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function assign(caseId: string) {
    const lawyerId = selection[caseId];
    setAssigning(caseId);
    setError(null);
    try {
      await api(`/admin/cases/${caseId}/assign`, {
        method: "PATCH",
        body: { lawyerId: lawyerId || undefined },
      });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Biriktirishda xatolik");
    } finally {
      setAssigning(null);
    }
  }

  if (error && !cases) return <Alert tone="error">{error}</Alert>;
  if (!cases) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Barcha ishlar"
        description="Ishlarni ko‘rib chiqing va tasdiqlangan advokatlarga biriktiring."
      />
      {error && <Alert tone="error">{error}</Alert>}

      {cases.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="Ishlar yo‘q"
          description="Foydalanuvchilar hisobot yuborganda ishlar shu yerda ko‘rinadi."
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="px-5 py-3.5 font-semibold">Ish</th>
                <th className="px-5 py-3.5 font-semibold">Mijoz</th>
                <th className="px-5 py-3.5 font-semibold">Platforma</th>
                <th className="px-5 py-3.5 font-semibold">Holat</th>
                <th className="px-5 py-3.5 font-semibold">Advokat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50/60">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/lawyer/cases/${c.id}`}
                      className="font-mono font-semibold text-brand-600 hover:underline"
                    >
                      {c.caseNumber}
                    </Link>
                    <p className="text-xs text-ink-400">{formatDate(c.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3.5 text-ink-700">
                    {c.report.reporter?.profile?.fullName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-ink-600">
                    {PLATFORM_LABELS[c.report.platform]}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={STATUS_TONES[c.report.status]}>
                      {STATUS_LABELS[c.report.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.assignedLawyer ? (
                      <span className="text-ink-800">
                        {c.assignedLawyer.profile?.fullName ?? "—"}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Select
                          aria-label={`${c.caseNumber} uchun advokat tanlash`}
                          className="w-48 py-1.5 text-xs"
                          value={selection[c.id] ?? ""}
                          onChange={(e) =>
                            setSelection((s) => ({ ...s, [c.id]: e.target.value }))
                          }
                        >
                          <option value="">— Advokat tanlang —</option>
                          {lawyers.map((l) => (
                            <option key={l.user.id} value={l.user.id}>
                              {l.user.profile?.fullName ?? l.user.email}
                            </option>
                          ))}
                        </Select>
                        <Button
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          disabled={!selection[c.id]}
                          loading={assigning === c.id}
                          onClick={() => void assign(c.id)}
                        >
                          Biriktirish
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
