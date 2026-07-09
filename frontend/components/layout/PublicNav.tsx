"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Qanday ishlaydi", href: "/how-it-works" },
  { label: "Tasvir huquqlari", href: "/image-rights" },
  { label: "Advokatlarga", href: "/for-lawyers" },
  { label: "Biz haqimizda", href: "/about" },
  { label: "Aloqa", href: "/contact" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "LAWYER" ? "/lawyer" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur">
      <nav className="container-px flex h-16 items-center justify-between" aria-label="Asosiy navigatsiya">
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === l.href
                  ? "text-brand-700"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          {!loading && user ? (
            <Link href={dashboardHref} className="btn-primary">
              Kabinetga kirish
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost">
                Kirish
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Tasvirimni himoya qilish
              </Link>
            </>
          )}
        </div>
        <button
          className="btn-ghost lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-ink-100 bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                {l.label}
              </Link>
            ))}
            <hr className="my-2 border-ink-100" />
            {user ? (
              <Link href={dashboardHref} className="btn-primary" onClick={() => setOpen(false)}>
                Kabinetga kirish
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary" onClick={() => setOpen(false)}>
                  Kirish
                </Link>
                <Link href="/auth/register" className="btn-primary mt-2" onClick={() => setOpen(false)}>
                  Tasvirimni himoya qilish
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
