"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FolderLock,
  Gavel,
  ImageIcon,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import { Alert, PageSkeleton, StatCard } from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";

type Overview = {
  users: number;
  lawyers: number;
  pendingLawyers: number;
  images: number;
  reports: number;
  openCases: number;
  contacts: number;
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Overview>("/admin/overview")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
  }, []);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <PageSkeleton />;

  return (
    <>
      <PageHeader title="Boshqaruv paneli" description="Platformaning umumiy holati." />

      {data.pendingLawyers > 0 && (
        <Alert tone="warning">
          {data.pendingLawyers} ta advokat profili tasdiqlashni kutmoqda.{" "}
          <Link href="/admin/lawyers?verified=false" className="font-semibold underline">
            Ko‘rib chiqish
          </Link>
        </Alert>
      )}
      {data.contacts > 0 && (
        <Alert tone="info">
          {data.contacts} ta yangi murojaat bor.{" "}
          <Link href="/admin/contacts" className="font-semibold underline">
            Ko‘rish
          </Link>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Foydalanuvchilar" value={data.users} icon={Users} tone="brand" />
        <StatCard label="Advokatlar" value={data.lawyers} icon={UserCheck} tone="ink" />
        <StatCard label="Ro‘yxatdagi tasvirlar" value={data.images} icon={ImageIcon} tone="green" />
        <StatCard label="Yuborilgan hisobotlar" value={data.reports} icon={ShieldAlert} tone="amber" />
        <StatCard label="Ochiq ishlar" value={data.openCases} icon={Gavel} tone="red" />
        <StatCard label="Yangi murojaatlar" value={data.contacts} icon={FolderLock} tone="ink" />
      </div>
    </>
  );
}
