import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  FolderLock,
  Gavel,
  MessageSquare,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { PublicPage } from "@/components/layout/PublicPage";

export const metadata: Metadata = {
  title: "Advokatlar uchun",
  description:
    "ImageRights.uz advokat portali: tuzilmali ishlar, tartiblangan dalillar, mijoz bilan xavfsiz muloqot va ish jarayonini boshqarish.",
  alternates: { canonical: "/for-lawyers" },
};

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Tuzilmali ishlar",
    text: "Har bir ish tayyor tuzilmada keladi: faktlar, sanalar, platforma, rozilik holati, tijorat belgisi va mijoz tavsifi — birinchi suhbatdan oldin to‘liq manzara.",
  },
  {
    icon: FolderLock,
    title: "Tartiblangan dalillar",
    text: "Skrinshotlar, havolalar va hujjatlar nazorat yig‘indisi hamda vaqt tamg‘asi bilan saqlangan — dalil yaxlitligini ko‘rsatish oson.",
  },
  {
    icon: MessageSquare,
    title: "Mijoz bilan muloqot",
    text: "Ish ichidagi yozishmalar orqali qo‘shimcha ma’lumot so‘raysiz. Ichki eslatmalaringiz esa faqat sizga va administratsiyaga ko‘rinadi.",
  },
  {
    icon: Workflow,
    title: "Jarayon boshqaruvi",
    text: "Ish holatini bosqichma-bosqich yangilaysiz: ko‘rib chiqilmoqda → talabnoma tayyorlandi → hal qilindi. Mijoz har bir o‘zgarishdan xabardor bo‘ladi.",
  },
  {
    icon: Gavel,
    title: "Hujjatlar bazasi",
    text: "Shikoyat, talabnoma va ogohlantirish xatlarining qoralamalari ish ma’lumotlaridan avtomatik to‘ldiriladi — siz yakuniy tahrirni qilasiz.",
  },
  {
    icon: ShieldCheck,
    title: "Tasdiqlangan maqom",
    text: "Advokatlar litsenziya raqami bilan ro‘yxatdan o‘tadi va administrator tekshiruvidan so‘ng tasdiqlanadi. Faqat tasdiqlangan advokatlarga ish biriktiriladi.",
  },
];

export default function ForLawyersPage() {
  return (
    <PublicPage
      eyebrow="Advokatlar uchun"
      title="Tasvir huquqlari bo‘yicha ishlarni bir joyda yuriting"
      intro="Platforma mijoz murojaatini tayyor, hujjatlashtirilgan ishga aylantiradi — siz esa asosiy ishingizga, huquqiy himoyaga e’tibor qaratasiz."
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                <f.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-semibold text-ink-900">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 card bg-ink-950 text-white sm:p-10">
          <h2 className="text-2xl font-bold">Qanday qo‘shilaman?</h2>
          <ol className="mt-5 space-y-3 text-sm text-ink-300">
            <li>1. «Advokat» sifatida ro‘yxatdan o‘ting va litsenziya raqamingizni kiriting.</li>
            <li>2. Administrator ma’lumotlaringizni tekshirib profilingizni tasdiqlaydi.</li>
            <li>3. Sizga mos ishlar biriktiriladi — kabinetda ular bilan ishlashni boshlaysiz.</li>
          </ol>
          <Link href="/auth/register" className="btn-primary mt-7 w-fit">
            Advokat sifatida ro‘yxatdan o‘tish
          </Link>
        </div>
      </div>
    </PublicPage>
  );
}
