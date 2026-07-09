"use client";

import type { ReactNode } from "react";
import { AppShell, LAWYER_NAV, USER_NAV } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Bildirishnoma/profil sahifalari advokat va admin uchun ham shu yerda
  const nav =
    user?.role === "LAWYER" ? LAWYER_NAV : USER_NAV;
  return (
    <AppShell allow={["USER", "LAWYER", "ADMIN"]} nav={nav}>
      {children}
    </AppShell>
  );
}
