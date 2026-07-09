"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Button,
  Input,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/labels";

type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { email: string; profile?: { fullName: string } | null } | null;
};

export default function AdminAuditPage() {
  const [data, setData] = useState<{ items: AuditRow[]; total: number; page: number; pageSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("action", query);
    api<typeof data>(`/admin/audit-logs?${params}`)
      .then((d) => setData(d))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
  }, [page, query]);

  useEffect(load, [load]);

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Tizimda qayd etilgan muhim harakatlar jurnali."
      />

      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(action);
        }}
      >
        <div>
          <label htmlFor="action" className="label">
            Harakat bo‘yicha filtr
          </label>
          <Input
            id="action"
            placeholder="Masalan: LOGIN yoki IMAGE"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-64"
          />
        </div>
        <Button type="submit" variant="secondary" aria-label="Qidirish">
          <Search className="h-4 w-4" aria-hidden />
        </Button>
      </form>

      {error && <Alert tone="error">{error}</Alert>}
      {!error && !data && <PageSkeleton />}
      {data && (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3.5 font-semibold">Vaqt</th>
                  <th className="px-5 py-3.5 font-semibold">Harakat</th>
                  <th className="px-5 py-3.5 font-semibold">Obyekt</th>
                  <th className="px-5 py-3.5 font-semibold">Foydalanuvchi</th>
                  <th className="px-5 py-3.5 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {data.items.map((row) => (
                  <tr key={row.id} className="hover:bg-ink-50/60">
                    <td className="whitespace-nowrap px-5 py-3 text-ink-500">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-ink-800">
                      {row.action}
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {row.entityType}
                      {row.entityId && (
                        <span className="ml-1 font-mono text-xs text-ink-400">
                          {row.entityId.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {row.user?.profile?.fullName ?? row.user?.email ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-400">
                      {row.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm text-ink-500">
            <span>Jami: {data.total}</span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Oldingi
              </Button>
              <Button
                variant="secondary"
                disabled={page * data.pageSize >= data.total}
                onClick={() => setPage(page + 1)}
              >
                Keyingi
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
