"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Button,
  EmptyState,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/labels";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [data, setData] = useState<{ items: AppNotification[]; unreadCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<{ items: AppNotification[]; unreadCount: number }>("/notifications")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
  }, []);

  useEffect(load, [load]);

  async function markAll() {
    setBusy(true);
    try {
      await api("/notifications/read-all", { body: {} });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function markOne(id: string) {
    try {
      await api(`/notifications/${id}/read`, { body: {} });
      load();
    } catch {
      /* o'qildi deb belgilashda xato kritik emas */
    }
  }

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Bildirishnomalar"
        description={
          data.unreadCount > 0
            ? `${data.unreadCount} ta o‘qilmagan bildirishnoma`
            : "Barcha bildirishnomalar o‘qilgan"
        }
        action={
          data.unreadCount > 0 ? (
            <Button variant="secondary" onClick={() => void markAll()} loading={busy}>
              <CheckCheck className="h-4 w-4" aria-hidden /> Barchasini o‘qilgan deb belgilash
            </Button>
          ) : undefined
        }
      />

      {data.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Bildirishnomalar yo‘q"
          description="Ish holati o‘zgarishi, advokat xabarlari va tizim ogohlantirishlari shu yerda ko‘rinadi."
        />
      ) : (
        <ul className="card divide-y divide-ink-50 p-0">
          {data.items.map((n) => (
            <li
              key={n.id}
              className={cn("flex items-start gap-3 px-5 py-4", !n.readAt && "bg-brand-50/40")}
            >
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  n.readAt ? "bg-ink-200" : "bg-brand-500",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-ink-600">{n.body}</p>}
                <p className="mt-1 text-xs text-ink-400">{formatDateTime(n.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {n.link && (
                  <Link
                    href={n.link}
                    onClick={() => void markOne(n.id)}
                    className="text-sm font-semibold text-brand-600 hover:underline"
                  >
                    Ochish
                  </Link>
                )}
                {!n.readAt && (
                  <button
                    onClick={() => void markOne(n.id)}
                    className="text-sm text-ink-400 hover:text-ink-700"
                  >
                    O‘qildi
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
