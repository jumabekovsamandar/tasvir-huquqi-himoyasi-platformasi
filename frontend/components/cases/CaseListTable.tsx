"use client";

import Link from "next/link";
import { Gavel } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui/primitives";
import {
  formatDate,
  PLATFORM_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from "@/lib/labels";
import type { CaseListItem } from "@/lib/types";

export function CaseListTable({
  cases,
  baseHref,
  showReporter,
  emptyText,
}: {
  cases: CaseListItem[];
  baseHref: string;
  showReporter?: boolean;
  emptyText: string;
}) {
  if (cases.length === 0) {
    return (
      <EmptyState
        icon={Gavel}
        title="Ishlar topilmadi"
        description={emptyText}
      />
    );
  }
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
            <th className="px-5 py-3.5 font-semibold">Ish raqami</th>
            {showReporter && <th className="px-5 py-3.5 font-semibold">Mijoz</th>}
            <th className="px-5 py-3.5 font-semibold">Mavzu</th>
            <th className="px-5 py-3.5 font-semibold">Platforma</th>
            <th className="px-5 py-3.5 font-semibold">Yangilangan</th>
            <th className="px-5 py-3.5 font-semibold">Holat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-50">
          {cases.map((c) => (
            <tr key={c.id} className="hover:bg-ink-50/60">
              <td className="px-5 py-3.5">
                <Link
                  href={`${baseHref}/${c.id}`}
                  className="font-mono font-semibold text-brand-600 hover:underline"
                >
                  {c.caseNumber}
                </Link>
              </td>
              {showReporter && (
                <td className="px-5 py-3.5 text-ink-700">
                  {c.report.reporter?.profile?.fullName ?? "—"}
                </td>
              )}
              <td className="max-w-[280px] px-5 py-3.5">
                <span className="line-clamp-1 text-ink-800">{c.report.description}</span>
              </td>
              <td className="px-5 py-3.5 text-ink-600">
                {PLATFORM_LABELS[c.report.platform]}
              </td>
              <td className="px-5 py-3.5 text-ink-500">{formatDate(c.updatedAt)}</td>
              <td className="px-5 py-3.5">
                <Badge className={STATUS_TONES[c.report.status]}>
                  {STATUS_LABELS[c.report.status]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
