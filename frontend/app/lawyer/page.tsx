"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, ClipboardList, Gavel } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import { CaseListTable } from "@/components/cases/CaseListTable";
import {
  Alert,
  PageSkeleton,
  StatCard,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { CaseListItem, LawyerOverview } from "@/lib/types";

export default function LawyerOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LawyerOverview | null>(null);
  const [cases, setCases] = useState<CaseListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<LawyerOverview>("/dashboard/overview")
      .then((d) => setData(d as LawyerOverview))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
    api<CaseListItem[]>("/cases")
      .then(setCases)
      .catch(() => setCases([]));
  }, []);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data || cases === null) return <PageSkeleton />;

  const verified = user?.lawyerProfile?.verified;

  return (
    <>
      <PageHeader
        title="Advokat kabineti"
        description="Sizga biriktirilgan ishlar va ularning holati."
      />

      {!verified && (
        <Alert tone="warning">
          Profilingiz hali administrator tomonidan tasdiqlanmagan. Tasdiqlangach
          sizga ishlar biriktiriladi.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faol ishlar" value={data.assigned} icon={Gavel} tone="brand" />
        <StatCard label="Ko‘rib chiqish kerak" value={data.needReview} icon={ClipboardList} tone="amber" />
        <StatCard label="Yakunlangan" value={data.resolved} icon={CheckCircle2} tone="green" />
        <StatCard label="O‘qilmagan bildirishnoma" value={data.unreadMessages} icon={Bell} tone="ink" />
      </div>

      <CaseListTable
        cases={cases}
        baseHref="/lawyer/cases"
        showReporter
        emptyText="Sizga hali ish biriktirilmagan. Administrator ish biriktirganda shu yerda ko‘rinadi."
      />
    </>
  );
}
