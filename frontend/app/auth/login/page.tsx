import Link from "next/link";
import type { Metadata } from "next";
import {
  AuthShell,
  AuthDivider,
  SocialAuthButtons,
} from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Kirish" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Hisobingizga kiring"
      subtitle="Tasvir huquqlaringizni boshqarish uchun davom eting."
      footer={
        <>
          Hisobingiz yo‘qmi?{" "}
          <Link href="/auth/register" className="font-semibold text-brand-600">
            Ro‘yxatdan o‘tish
          </Link>
        </>
      }
    >
      <SocialAuthButtons />
      <AuthDivider />

      <form className="space-y-4" action="/dashboard">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="siz@email.com"
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-700">Parol</label>
            <a href="#" className="text-xs font-medium text-brand-600">
              Parolni unutdingizmi?
            </a>
          </div>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Kirish
        </button>
      </form>
    </AuthShell>
  );
}
