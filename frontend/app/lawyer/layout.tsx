"use client";

import type { ReactNode } from "react";
import { AppShell, LAWYER_NAV } from "@/components/layout/AppShell";

export default function LawyerLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell allow={["LAWYER", "ADMIN"]} nav={LAWYER_NAV}>
      {children}
    </AppShell>
  );
}
