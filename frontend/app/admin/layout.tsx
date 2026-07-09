"use client";

import type { ReactNode } from "react";
import { ADMIN_NAV, AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell allow={["ADMIN"]} nav={ADMIN_NAV}>
      {children}
    </AppShell>
  );
}
