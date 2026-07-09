import type { Metadata } from "next";
import Link from "next/link";
import { Camera, FileUp, Link2, ListChecks, ShieldCheck } from "lucide-react";
import { PublicPage } from "@/components/layout/PublicPage";

export const metadata: Metadata = {
  title: "Huquqbuzarlik haqida xabar berish",
  description:
    "Suratingiz ruxsatsiz ishlatilganini aniqladingizmi? Dalillarni to‘g‘ri saqlash bo‘yicha ko‘rsatmalar va tuzilmali hisobot yaratish.",
  alternates: { canonical: "/report" },
};

const TIPS = [
  {
    icon: Camera,
    title: "Darhol skrinshot oling",
    text: "Sahifaning to‘liq ko‘rinishini — manzil qatori va sana ko‘rinadigan holda — saqlang. Kontent o‘chirilishidan oldin bu eng muhim dalil.",
  },
  {
    icon: Link2,
    title: "Havolani saqlang",
    text: "Aniq URL manzilni nusxalang. Ijtimoiy tarmoqlarda postning o‘z havolasini (profil emas) olishga harakat qiling.",
  },
  {
    icon: ListChecks,
    title: "Tafsilotlarni yozib qo‘ying",
    text: "Qachon aniqladingiz, kontent qachondan beri turibdi, kim joylashtirgan, tijorat maqsadi bormi — bularning barchasi hisobotda so‘raladi.",
  },
  {
    icon: FileUp,
    title: "Asl faylni tayyorlang",
    text: "Suratning asl nusxasi (yuqori sifatli fayl) egalikni ko‘rsatishda kuchli dalil bo‘ladi.",
  },
];

const STEPS = [
  "Voqea haqida ma’lumot — nima bo‘lgani va qachon aniqlangani",
  "Qayerda ishlatilgani — platforma va havola",
  "Dalillarni yuklash — skrinshot, rasm, PDF, URL",
  "Rozilik holati — ruxsat berilgan-berilmagani",
  "Zarar va oqibatlar — moddiy yoki ma’naviy ta’sir",
  "Ko‘rib chiqish va yuborish — ish (case) ochiladi",
];

export default function ReportPage() {
  return (
    <PublicPage
      eyebrow="Huquqbuzarlik"
      title="Suratingiz ruxsatsiz ishlatilganmi? Xabar bering."
      intro="Hisobot kabinet ichidagi olti bosqichli forma orqali yaratiladi — bu dalillaringiz tartibli va to‘liq bo‘lishini ta’minlaydi."
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold text-ink-900">Xabar berishdan oldin: dalillarni saqlab oling</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {TIPS.map((t) => (
            <div key={t.title} className="card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <t.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-semibold text-ink-900">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Hisobot bosqichlari</h2>
            <ol className="mt-5 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-sm text-ink-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white" aria-hidden>
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="card bg-ink-950 text-white">
            <ShieldCheck className="h-7 w-7 text-gold-300" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Hisobot yaratish uchun kabinetga kiring</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
              Hisobotlar shaxsiy kabinetda yaratiladi — shunda dalillaringiz
              xavfsiz saqlanadi, ishingizga raqam beriladi va jarayonni
              bosqichma-bosqich kuzatib borasiz.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link href="/dashboard/violations/new" className="btn-primary">
                Hisobot yaratish
              </Link>
              <Link href="/auth/register" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">
                Ro‘yxatdan o‘tish
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
