"use client";

import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tugma ───────────────────────────────────────────────────

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(`btn-${variant}`, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

// ─── Forma elementlari ───────────────────────────────────────

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={cn("input", className)} {...rest} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <textarea ref={ref} className={cn("input min-h-[110px]", className)} {...rest} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...rest }, ref) => (
  <select ref={ref} className={cn("input", className)} {...rest}>
    {children}
  </select>
));
Select.displayName = "Select";

// ─── Belgi (badge) ───────────────────────────────────────────

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Ogohlantirish ───────────────────────────────────────────

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-brand-200 bg-brand-50 text-brand-900",
    success: "border-green-200 bg-green-50 text-green-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone], className)}
    >
      {children}
    </div>
  );
}

// ─── Bo'sh holat ─────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="card flex flex-col items-center py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-5">
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ─── Yuklanish skeletlari ────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-ink-100", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Yuklanmoqda">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

// ─── Stat karta ──────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "green" | "amber" | "red" | "ink";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    ink: "bg-ink-50 text-ink-600",
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-ink-900">{value}</p>
      </div>
    </div>
  );
}

// ─── Modal (tasdiqlash) ──────────────────────────────────────

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Tasdiqlash",
  danger,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
