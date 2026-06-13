import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-600">{description}</p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "brand",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  tone?: "brand" | "green" | "amber" | "red";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  } as const;
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        {trend && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-bold text-ink-900">{value}</div>
      <div className="mt-1 text-sm text-ink-500">{label}</div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-ink-100 bg-white shadow-card", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

const STATUS_STYLES: Record<string, string> = {
  green: "bg-green-50 text-green-700 ring-green-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  gray: "bg-ink-100 text-ink-600 ring-ink-200",
};

export function StatusBadge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: keyof typeof STATUS_STYLES | string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STATUS_STYLES[tone] ?? STATUS_STYLES.gray,
      )}
    >
      {children}
    </span>
  );
}
