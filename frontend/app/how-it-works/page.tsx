import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText,
  FolderLock,
  Gavel,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PublicPage } from "@/components/layout/PublicPage";

export const metadata: Metadata = {
  title: "Qanday ishlaydi",
  description:
    "ImageRights.uz himoya jarayoni: tasvirni ro‘yxatdan o‘tkazish, huquqbuzarlikni aniqlash, dalillarni saqlash, huquqiy tahlil, talabnoma yaratish va ish holatini kuzatish.",
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  {
    icon: ShieldCheck,
    title: "1. Tasvirni ro‘yxatdan o‘tkazing",
    text: "Kabinetda suratingizni yuklab, sarlavha, yaratilgan sana, birinchi e’lon qilingan manba va rozilik cheklovlarini kiritasiz. Tizim faylga SHA-256 nazorat yig‘indisi va vaqt tamg‘asini biriktirib, unikal reyestr kodini beradi. Bu yozuv egalikni dalillashda yordamchi hujjat bo‘lib xizmat qiladi.",
  },
  {
    icon: ScanSearch,
    title: "2. Huquqbuzarlikni aniqlang",
    text: "Suratingiz ruxsatsiz ishlatilganini ko‘rsangiz — havolani saqlang va darhol skrinshot oling. Kabinetdagi ko‘p bosqichli forma orqali qayerda, qachon va qanday sharoitda foydalanilganini, rozilik bor-yo‘qligini va tijorat maqsadi mavjudligini qayd etasiz.",
  },
  {
    icon: FolderLock,
    title: "3. Dalillarni saqlang",
    text: "Skrinshotlar, asl suratlar, PDF hujjatlar va yozishmalarni dalillar omboriga yuklaysiz. Har bir fayl uchun asl nomi, hajmi, turi, yuklangan vaqti va nazorat yig‘indisi saqlanadi — bu keyinchalik dalil yaxlitligini ko‘rsatishga yordam beradi.",
  },
  {
    icon: Sparkles,
    title: "4. Huquqiy tahlil oling",
    text: "AI yordamchi hisobotingizni o‘qib, faktlar xulosasini, kuchli va zaif tomonlar bahosini, yetishmayotgan ma’lumotlar ro‘yxatini va advokat uchun savollarni tayyorlaydi. Har bir natija axborot xarakteriga ega va yuridik maslahat o‘rnini bosmaydi.",
  },
  {
    icon: FileText,
    title: "5. Talabnoma yarating",
    text: "Ish ma’lumotlari asosida platformaga shikoyat, olib tashlash talabi, rasmiy ogohlantirish xati, dalillar xulosasi yoki advokat uchun brief avtomatik to‘ldiriladi. Siz matnni tahrirlaysiz, tasdiqlaysiz va PDF sifatida yuklab olasiz — platforma hech narsani avtomatik yubormaydi.",
  },
  {
    icon: Gavel,
    title: "6. Ish holatini kuzating",
    text: "Hisobot yuborilgach ish (case) ochiladi va unga raqam beriladi. Holat o‘zgarishlari vaqt chizig‘ida ko‘rinadi: ko‘rib chiqilmoqda, ma’lumot so‘raldi, talabnoma tayyorlandi, hal qilindi. Zarur bo‘lsa, administrator ishingizga tasdiqlangan advokatni biriktiradi va u bilan kabinet ichida yozishasiz.",
  },
];

export default function HowItWorksPage() {
  return (
    <PublicPage
      eyebrow="Qanday ishlaydi"
      title="Huquqbuzarlikka tartibli javob berishning to‘liq jarayoni"
      intro="Platforma tasvir huquqlaringizni himoya qilish yo‘lini olti aniq bosqichga ajratadi — har bir bosqich hujjatlashtiriladi va kuzatiladi."
    >
      <ol className="mx-auto max-w-3xl space-y-6">
        {STEPS.map((s) => (
          <li key={s.title} className="card flex gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <s.icon className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mx-auto mt-12 max-w-3xl text-center">
        <Link href="/auth/register" className="btn-primary px-7 py-3.5 text-base">
          Hoziroq boshlash
        </Link>
      </div>
    </PublicPage>
  );
}
