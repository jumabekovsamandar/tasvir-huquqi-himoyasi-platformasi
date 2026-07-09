"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Archive, ImageIcon, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  EmptyState,
  PageSkeleton,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/labels";
import type { ProtectedImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ImagesPage() {
  const [state, setState] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [images, setImages] = useState<ProtectedImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImages(null);
    api<ProtectedImage[]>(`/images?state=${state}`)
      .then(setImages)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"),
      );
  }, [state]);

  return (
    <>
      <PageHeader
        title="Himoyalangan tasvirlar"
        description="Reyestrga kiritilgan tasvirlaringiz — har biri vaqt tamg‘asi va SHA-256 nazorat yig‘indisi bilan."
        action={
          <Link href="/dashboard/images/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> Tasvir qo‘shish
          </Link>
        }
      />

      <div className="flex gap-2" role="tablist" aria-label="Tasvir holati">
        {(
          [
            { v: "ACTIVE", label: "Faol" },
            { v: "ARCHIVED", label: "Arxiv" },
          ] as const
        ).map((t) => (
          <button
            key={t.v}
            role="tab"
            aria-selected={state === t.v}
            onClick={() => setState(t.v)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold",
              state === t.v ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {!error && images === null && <PageSkeleton />}
      {images !== null &&
        (images.length === 0 ? (
          state === "ACTIVE" ? (
            <EmptyState
              icon={ImageIcon}
              title="Hozircha tasvir qo‘shilmagan"
              description="Birinchi tasviringizni reyestrga kiriting — huquqbuzarlik yuz berganda tayyor dalil bazangiz bo‘ladi."
              action={{ label: "Tasvirni ro‘yxatdan o‘tkazish", href: "/dashboard/images/new" }}
            />
          ) : (
            <EmptyState
              icon={Archive}
              title="Arxiv bo‘sh"
              description="Arxivlangan tasvirlar shu yerda ko‘rinadi."
            />
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <Link
                key={img.id}
                href={`/dashboard/images/${img.id}`}
                className="card transition-shadow hover:shadow-premium"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <ImageIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <Badge className="bg-ink-100 font-mono text-ink-600">{img.registryCode}</Badge>
                </div>
                <h2 className="mt-3 truncate font-semibold text-ink-900">{img.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">
                  {img.description || "Tavsif kiritilmagan"}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
                  <span>Qo‘shilgan: {formatDate(img.createdAt)}</span>
                  {(img.reports?.length ?? 0) > 0 && (
                    <Badge className="bg-amber-50 text-amber-700">
                      {img.reports!.length} hisobot
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ))}
    </>
  );
}
