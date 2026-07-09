"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { CaseListTable } from "@/components/cases/CaseListTable";
import { Alert, PageSkeleton } from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import type { CaseListItem } from "@/lib/types";

export default function LawyerCasesPage() {
  const [cases, setCases] = useState<CaseListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<CaseListItem[]>("/cases")
      .then(setCases)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
  }, []);

  return (
    <>
      <PageHeader title="Ishlarim" description="Sizga biriktirilgan barcha ishlar." />
      {error && <Alert tone="error">{error}</Alert>}
      {!error && cases === null && <PageSkeleton />}
      {cases !== null && (
        <CaseListTable
          cases={cases}
          baseHref="/lawyer/cases"
          showReporter
          emptyText="Sizga hali ish biriktirilmagan."
        />
      )}
    </>
  );
}
