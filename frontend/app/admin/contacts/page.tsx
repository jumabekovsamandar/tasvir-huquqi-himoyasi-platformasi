"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: "NEW" | "REVIEWED" | "ARCHIVED";
  createdAt: string;
};

const STATUS_META = {
  NEW: { label: "Yangi", tone: "bg-brand-50 text-brand-700" },
  REVIEWED: { label: "Ko‘rib chiqilgan", tone: "bg-green-50 text-green-700" },
  ARCHIVED: { label: "Arxiv", tone: "bg-ink-100 text-ink-500" },
} as const;

export default function AdminContactsPage() {
  const [filter, setFilter] = useState<"" | "NEW" | "REVIEWED" | "ARCHIVED">("");
  const [items, setItems] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setItems(null);
    api<Contact[]>(`/admin/contacts${filter ? `?status=${filter}` : ""}`)
      .then(setItems)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
  }, [filter]);

  useEffect(load, [load]);

  async function setStatus(id: string, status: Contact["status"]) {
    setBusy(id);
    try {
      await api(`/admin/contacts/${id}/status`, { method: "PATCH", body: { status } });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Amal bajarilmadi");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader title="Murojaatlar" description="Aloqa formasi orqali kelgan xabarlar." />

      <div className="flex gap-2" role="tablist" aria-label="Murojaat holati">
        {(
          [
            { v: "", label: "Barchasi" },
            { v: "NEW", label: "Yangi" },
            { v: "REVIEWED", label: "Ko‘rib chiqilgan" },
            { v: "ARCHIVED", label: "Arxiv" },
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
      {!error && items === null && <PageSkeleton />}
      {items !== null &&
        (items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Murojaatlar yo‘q"
            description="Aloqa formasi orqali kelgan murojaatlar shu yerda ko‘rinadi."
          />
        ) : (
          <div className="space-y-4">
            {items.map((c) => (
              <div key={c.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-ink-900">{c.subject}</h2>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {c.name} · {c.email}
                      {c.phone && ` · ${c.phone}`} · {formatDateTime(c.createdAt)}
                    </p>
                  </div>
                  <Badge className={STATUS_META[c.status].tone}>
                    {STATUS_META[c.status].label}
                  </Badge>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                  {c.message}
                </p>
                <div className="mt-4 flex gap-2">
                  {c.status !== "REVIEWED" && (
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      loading={busy === c.id}
                      onClick={() => void setStatus(c.id, "REVIEWED")}
                    >
                      Ko‘rib chiqildi
                    </Button>
                  )}
                  {c.status !== "ARCHIVED" && (
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs"
                      loading={busy === c.id}
                      onClick={() => void setStatus(c.id, "ARCHIVED")}
                    >
                      Arxivlash
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
    </>
  );
}
