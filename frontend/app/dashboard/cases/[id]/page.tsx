"use client";

import { useParams } from "next/navigation";
import { CaseView } from "@/components/cases/CaseView";

export default function UserCasePage() {
  const { id } = useParams<{ id: string }>();
  return <CaseView caseId={id} mode="user" />;
}
