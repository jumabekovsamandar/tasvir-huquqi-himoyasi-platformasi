import Link from "next/link";
import type { Metadata } from "next";
import {
  AuthShell,
  AuthDivider,
  SocialAuthButtons,
} from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Ro‘yxatdan o‘tish" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Bepul hisob yarating"
      subtitle="Bir necha daqiqada tasviringizni himoya qilishni boshlang."
      footer={
        <>
          Hisobingiz bormi?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600">
            Kirish
          </Link>
        </>
      }
    >
      <SocialAuthButtons />
      <AuthDivider />

      <form className="space-y-4" action="/dashboard">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            To‘liq ism
          </label>
          <input
            required
            placeholder="Ism Familiya"
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
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
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Parol
          </label>
          <input
            type="password"
            required
            placeholder="Kamida 8 ta belgi"
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <label className="flex items-start gap-2.5 text-xs text-ink-600">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600" />
          <span>
            Men{" "}
            <a href="#" className="font-medium text-brand-600">
              Foydalanish shartlari
            </a>{" "}
            va{" "}
            <a href="#" className="font-medium text-brand-600">
              Maxfiylik siyosati
            </a>
            ga roziman.
          </span>
        </label>
        <button type="submit" className="btn-primary w-full py-3">
          Bepul boshlash
        </button>
      </form>
    </AuthShell>
  );
}
