"use client";

import { useParams } from "next/navigation";
import { CaseView } from "@/components/cases/CaseView";

export default function LawyerCasePage() {
  const { id } = useParams<{ id: string }>();
  return <CaseView caseId={id} mode="lawyer" />;
}
