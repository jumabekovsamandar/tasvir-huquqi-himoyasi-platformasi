"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  FileText,
  FolderLock,
  Gavel,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Sparkles,
  User,
  Users,
  ClipboardList,
  ScrollText,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PageSkeleton } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; href: string; icon: LucideIcon; exact?: boolean };

export const USER_NAV: NavItem[] = [
  { label: "Umumiy ko‘rinish", href: "/dashboard", icon: Home, exact: true },
  { label: "Himoyalangan tasvirlar", href: "/dashboard/images", icon: ImageIcon },
  { label: "Huquqbuzarliklar", href: "/dashboard/violations", icon: ShieldAlert },
  { label: "Ishlar", href: "/dashboard/cases", icon: Gavel },
  { label: "Hujjatlar", href: "/dashboard/documents", icon: FileText },
  { label: "AI yordamchi", href: "/dashboard/assistant", icon: Sparkles },
  { label: "Bildirishnomalar", href: "/dashboard/notifications", icon: Bell },
  { label: "Profil", href: "/dashboard/profile", icon: User },
  { label: "Sozlamalar", href: "/dashboard/settings", icon: Settings },
];

export const LAWYER_NAV: NavItem[] = [
  { label: "Umumiy ko‘rinish", href: "/lawyer", icon: Home, exact: true },
  { label: "Ishlarim", href: "/lawyer/cases", icon: Gavel },
  { label: "Bildirishnomalar", href: "/dashboard/notifications", icon: Bell },
  { label: "Profil", href: "/dashboard/profile", icon: User },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Umumiy ko‘rinish", href: "/admin", icon: Home, exact: true },
  { label: "Foydalanuvchilar", href: "/admin/users", icon: Users },
  { label: "Advokatlar", href: "/admin/lawyers", icon: Gavel },
  { label: "Ishlar", href: "/admin/cases", icon: ClipboardList },
  { label: "Murojaatlar", href: "/admin/contacts", icon: FolderLock },
  { label: "Audit log", href: "/admin/audit", icon: ScrollText },
  { label: "Bildirishnomalar", href: "/dashboard/notifications", icon: Bell },
];

/**
 * Rolga bog'liq himoyalangan qobiq: sessiya bo'lmasa login sahifasiga,
 * roli mos kelmasa o'z kabinetiga yo'naltiradi. Frontend tekshiruvi faqat
 * UX uchun — haqiqiy avtorizatsiya backendda amalga oshiriladi.
 */
export function AppShell({
  allow,
  nav,
  children,
}: {
  allow: Role[];
  nav: NavItem[];
  children: ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace(
        user.role === "ADMIN" ? "/admin" : user.role === "LAWYER" ? "/lawyer" : "/dashboard",
      );
    }
  }, [user, loading, allow, router, pathname]);

  useEffect(() => {
    if (!user) return;
    api<{ unreadCount: number }>("/notifications?unread=true")
      .then((d) => setUnread(d.unreadCount))
      .catch(() => {});
  }, [user, pathname]);

  if (loading || !user || !allow.includes(user.role)) {
    return (
      <div className="container-px py-10">
        <PageSkeleton />
      </div>
    );
  }

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="Kabinet navigatsiyasi">
      <div className="px-5 py-5">
        <Logo light />
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-ink-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.icon === Bell && unread > 0 && (
                  <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {(user.profile?.fullName ?? user.email).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.profile?.fullName ?? user.email}
            </p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-ink-400 hover:bg-white/10 hover:text-white"
            aria-label="Chiqish"
            title="Chiqish"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-ink-50/60">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink-950 lg:block">
        {sidebar}
      </aside>

      {/* Mobil sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink-950 shadow-xl">
            <button
              className="absolute right-3 top-4 rounded-lg p-2 text-ink-300 hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Menyuni yopish"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink-100 bg-white/85 px-4 backdrop-blur lg:px-8">
          <button
            className="btn-ghost lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menyuni ochish"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            href="/dashboard/notifications"
            className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-50"
            aria-label={`Bildirishnomalar${unread ? ` (${unread} ta o‘qilmagan)` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-500" aria-hidden />
            )}
          </Link>
        </header>
        <main className="container-px flex-1 space-y-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
