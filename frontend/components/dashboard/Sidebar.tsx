"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { DASHBOARD_NAV, DASHBOARD_FOOTER_NAV } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-ink-100 px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {DASHBOARD_NAV.map((group) => (
          <div key={group.title}>
            <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
              {group.title}
            </h4>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          active ? "text-brand-600" : "text-ink-400",
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-4">
        {DASHBOARD_FOOTER_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            <item.icon className="h-[18px] w-[18px] text-ink-400" />
            {item.label}
          </Link>
        ))}
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-brand-600 to-ink-800 p-4 text-white">
          <p className="text-sm font-semibold">Professional rejaga o‘ting</p>
          <p className="mt-1 text-xs text-white/70">
            Cheksiz tekshiruv va monitoring.
          </p>
          <Link
            href="/#pricing"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink-900"
          >
            Yangilash
          </Link>
        </div>
      </div>
    </aside>
  );
}
