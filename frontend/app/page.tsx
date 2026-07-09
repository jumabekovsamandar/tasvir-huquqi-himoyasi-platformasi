import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  FileText,
  FolderLock,
  Gavel,
  LockKeyhole,
  ScanSearch,
  Scale,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ImageRights.uz — Raqamli dunyoda tasvir huquqlaringiz kafolati",
  description:
    "Suratingiz ruxsatsiz ishlatildimi? ImageRights.uz huquqbuzarlikni hujjatlashtirish, dalillarni saqlash, huquqiy talabnoma tayyorlash va ish holatini kuzatishga yordam beradi.",
  alternates: { canonical: "/" },
};

const WORKFLOW = [
  {
    icon: ShieldCheck,
    step: "01",
    title: "Tasvirni ro‘yxatdan o‘tkazing",
    text: "Suratingizni xavfsiz reyestrga yuklang — unga vaqt tamg‘asi va raqamli barmoq izi (SHA-256) biriktiriladi.",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "Huquqbuzarlikni hujjatlashtiring",
    text: "Ruxsatsiz foydalanish holatini aniqlaganingizda havola, skrinshot va tafsilotlarni tuzilmali hisobotga kiriting.",
  },
  {
    icon: FolderLock,
    step: "03",
    title: "Dalillarni saqlang",
    text: "Har bir dalil o‘zgarmaslik nazorati (checksum) va yuklangan vaqti bilan alohida omborda saqlanadi.",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Dastlabki tahlil oling",
    text: "AI yordamchi faktlarni tartiblaydi, yetishmayotgan ma’lumotlarni ko‘rsatadi va advokat uchun savollar tayyorlaydi.",
  },
  {
    icon: FileText,
    step: "05",
    title: "Talabnoma yarating",
    text: "Platformaga shikoyat, olib tashlash talabi yoki rasmiy ogohlantirish xatini tayyor shablonlar asosida shakllantiring.",
  },
  {
    icon: Gavel,
    step: "06",
    title: "Ish holatini kuzating",
    text: "Zarurat bo‘lsa ishingizga tasdiqlangan advokat biriktiriladi — jarayonning har bir bosqichi kabinetda ko‘rinadi.",
  },
];

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "Suratlar ruxsatsiz tarqalmoqda",
    text: "Shaxsiy suratlar reklama, ijtimoiy tarmoqlar va saytlarda egasining roziligisiz ishlatilmoqda.",
  },
  {
    icon: Scale,
    title: "Isbotlash murakkab",
    text: "Skrinshot yig‘ish, sanani qayd etish va egalikni ko‘rsatish tartibsiz bajarilsa, dalil kuchini yo‘qotadi.",
  },
  {
    icon: LockKeyhole,
    title: "Qayerga murojaat qilishni bilish qiyin",
    text: "Platformaga shikoyat, rasmiy talabnoma yoki advokatga murojaat — to‘g‘ri tartibni topish vaqt talab qiladi.",
  },
];

const AUDIENCES = [
  "Oddiy fuqarolar",
  "Blogerlar va influencerlar",
  "Sportchilar",
  "San’atkorlar",
  "Jurnalistlar",
  "Kompaniyalar va brendlar",
  "Reklama agentliklari",
  "Advokatlar",
];

const FAQS = [
  {
    q: "ImageRights.uz qanday ishlaydi?",
    a: "Siz tasviringizni reyestrga kiritasiz, huquqbuzarlik aniqlansa — tuzilmali hisobot yaratib, dalillarni yuklaysiz. Platforma talabnoma qoralamasini tayyorlashga yordam beradi va ishingiz holatini kuzatib borasiz. Zarur bo‘lsa, ishga tasdiqlangan advokat biriktiriladi.",
  },
  {
    q: "Ichki reyestr rasmiy davlat ro‘yxatidan o‘tkazishmi?",
    a: "Yo‘q. Reyestr yozuvi vaqt tamg‘asi va fayl nazorat yig‘indisini qayd etuvchi ichki hujjat bo‘lib, egalikni dalillashda yordamchi material sifatida xizmat qiladi. U davlat intellektual mulk ro‘yxatidan o‘tkazish o‘rnini bosmaydi.",
  },
  {
    q: "AI tahlili yuridik maslahatmi?",
    a: "Yo‘q. AI tahlili axborot xarakteriga ega va professional yuridik maslahat o‘rnini bosmaydi. U faktlarni tartiblash, yetishmayotgan ma’lumotlarni aniqlash va advokat bilan suhbatga tayyorlanishga yordam beradi.",
  },
  {
    q: "Hujjatlar avtomatik yuboriladimi?",
    a: "Yo‘q. Har bir hujjat avval qoralama sifatida yaratiladi — siz uni ko‘rib chiqasiz, tahrirlaysiz va faqat o‘zingiz tasdiqlagach yuklab olasiz. Platforma sizning nomingizdan hech narsa yubormaydi.",
  },
  {
    q: "Ma’lumotlarim kimga ko‘rinadi?",
    a: "Tasvirlaringiz va dalillaringiz sukut bo‘yicha faqat sizga ko‘rinadi. Ishingizga advokat biriktirilsa, u faqat shu ishga tegishli materiallarni ko‘ra oladi. Har bir kirish server tomonida tekshiriladi va muhim amallar audit jurnalida qayd etiladi.",
  },
  {
    q: "Xizmat pullikmi?",
    a: "Platforma hozirda ishga tushirish bosqichida bo‘lib, asosiy funksiyalar ro‘yxatdan o‘tgan foydalanuvchilar uchun ochiq. Tariflar joriy etilganda alohida e’lon qilinadi.",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-ink-950 text-white">
          <div className="aurora absolute inset-0" aria-hidden />
          <div className="container-px relative py-24 lg:py-32">
            <div className="max-w-3xl">
              <p className="eyebrow border-white/15 bg-white/5 text-ink-200">
                <ShieldCheck className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                LegalTech platformasi · O‘zbekiston
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Raqamli dunyoda tasvir huquqlaringiz{" "}
                <span className="text-brand-400">kafolati</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
                ImageRights.uz suratingiz yoki videongizdan ruxsatsiz
                foydalanilganda huquqbuzarlikni hujjatlashtirish, dalillarni
                huquqiy ahamiyatga ega tarzda saqlash va rasmiy javob
                choralarini ko‘rishga yordam beradi.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/register" className="btn-primary px-7 py-3.5 text-base">
                  Tasvirimni himoya qilish
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/how-it-works"
                  className="btn border border-white/20 bg-white/5 px-7 py-3.5 text-base text-white hover:bg-white/10"
                >
                  Qanday ishlaydi?
                </Link>
              </div>
              <p className="mt-8 text-sm text-ink-400">
                DETECT → DOCUMENT → ANALYZE → PROTECT → RESOLVE
              </p>
            </div>
          </div>
        </section>

        {/* MUAMMO */}
        <section className="container-px py-20" aria-labelledby="problem-title">
          <div className="max-w-2xl">
            <p className="eyebrow">Muammo</p>
            <h2 id="problem-title" className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
              Tasviringiz — sizning huquqingiz. Lekin uni himoya qilish oson emas.
            </h2>
            <p className="mt-3 text-ink-600">
              O‘zbekiston qonunchiligiga ko‘ra fuqaroning tasviridan foydalanish
              uchun, qoida tariqasida, uning roziligi talab etiladi. Amalda esa
              huquqbuzarlikni aniqlash, isbotlash va to‘xtatish ko‘pchilik uchun
              murakkab jarayon.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* JARAYON */}
        <section className="border-y border-ink-100 bg-ink-50/60 py-20" aria-labelledby="workflow-title">
          <div className="container-px">
            <div className="max-w-2xl">
              <p className="eyebrow">Himoya jarayoni</p>
              <h2 id="workflow-title" className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
                Aniqlashdan hal qilishgacha — olti bosqich
              </h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WORKFLOW.map((w) => (
                <div key={w.step} className="card relative">
                  <span className="absolute right-5 top-5 text-3xl font-bold text-ink-100" aria-hidden>
                    {w.step}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <w.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink-900">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{w.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
                Jarayon haqida batafsil <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* KIMLAR UCHUN */}
        <section className="container-px py-20" aria-labelledby="audience-title">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Kimlar uchun</p>
              <h2 id="audience-title" className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
                Tasviri ommaviy ishlatilishi mumkin bo‘lgan har bir kishi uchun
              </h2>
              <p className="mt-3 text-ink-600">
                Shaxsiy surati ruxsatsiz reklama bannerida paydo bo‘lgan
                fuqarodan tortib, kontenti muntazam o‘g‘irlanadigan blogergacha —
                platforma huquqbuzarlikka tartibli va hujjatlashtirilgan javob
                berishga yordam beradi.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
                {AUDIENCES.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-ink-700">
                    <UserCheck className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card bg-ink-950 p-8 text-white">
              <FileCheck2 className="h-8 w-8 text-gold-300" aria-hidden />
              <h3 className="mt-4 text-xl font-semibold">Ishonch va maxfiylik</h3>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-ink-300">
                <li>
                  <strong className="text-white">Ma’lumotlar sizniki.</strong>{" "}
                  Tasvir va dalillar sukut bo‘yicha faqat egasiga ko‘rinadi;
                  advokat faqat unga biriktirilgan ish materiallarini ko‘radi.
                </li>
                <li>
                  <strong className="text-white">Har bir amal qayd etiladi.</strong>{" "}
                  Ro‘yxatga olish, dalil yuklash va holat o‘zgarishlari audit
                  jurnalida saqlanadi.
                </li>
                <li>
                  <strong className="text-white">Hech narsa avtomatik yuborilmaydi.</strong>{" "}
                  Huquqiy hujjatlar faqat siz ko‘rib chiqib tasdiqlaganingizdan
                  so‘ng yakunlanadi.
                </li>
                <li>
                  <strong className="text-white">Akkauntni istalgan vaqtda o‘chirish mumkin.</strong>{" "}
                  Ma’lumotlaringiz eksporti va o‘chirish so‘rovi kabinetda mavjud.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* HUQUQIY JARAYON */}
        <section className="border-y border-ink-100 bg-ink-50/60 py-20" aria-labelledby="legal-title">
          <div className="container-px grid gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Huquqiy jarayon</p>
              <h2 id="legal-title" className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
                Platforma huquqiy jarayonning qaysi qismida yordam beradi?
              </h2>
              <p className="mt-3 text-ink-600">
                ImageRights.uz — huquqbuzarlikka tayyorgarlik bosqichini
                tartibga soluvchi vosita. Sud yoki davlat organlariga murojaat
                zarur bo‘lganda, sizda tartiblangan faktlar, sanalar bilan
                qayd etilgan dalillar va tayyor hujjat qoralamalari bo‘ladi.
              </p>
              <div className="mt-6 space-y-3 text-sm text-ink-700">
                {[
                  "Faktlar va dalillarni yig‘ish hamda tizimlashtirish",
                  "Platformalarga shikoyat va olib tashlash talablari",
                  "Rasmiy ogohlantirish xatlarining qoralamalari",
                  "Advokat uchun tayyor ish xulosasi (brief)",
                ].map((t) => (
                  <p key={t} className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                    {t}
                  </p>
                ))}
              </div>
            </div>
            <div className="card self-start border-gold-300/60 bg-gold-50/50">
              <Scale className="h-7 w-7 text-gold-600" aria-hidden />
              <h3 className="mt-3 font-semibold text-ink-900">Muhim eslatma</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Platformadagi barcha materiallar, jumladan AI tahlillari va
                hujjat shablonlari, axborot xarakteriga ega. Ular professional
                yuridik maslahat o‘rnini bosmaydi. Murakkab holatlarda malakali
                advokatga murojaat qilishni tavsiya etamiz — platforma ichida
                ishingizga tasdiqlangan advokat biriktirilishi mumkin.
              </p>
              <Link href="/image-rights" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:underline">
                Tasvir huquqlari haqida bilib oling <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container-px py-20" aria-labelledby="faq-title">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Savol-javob</p>
            <h2 id="faq-title" className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
              Ko‘p beriladigan savollar
            </h2>
            <div className="mt-8 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="card group p-0">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-sm font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-ink-400 transition-transform group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="border-t border-ink-100 px-6 py-4 text-sm leading-relaxed text-ink-600">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* YAKUNIY CTA */}
        <section className="container-px pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-8 py-14 text-center text-white sm:px-14">
            <div className="aurora absolute inset-0" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tasviringizni bugun himoya ostiga oling
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-300">
                Ro‘yxatdan o‘tish bir daqiqa vaqt oladi. Huquqbuzarlik yuz
                berganda esa har bir hujjatlashtirilgan daqiqa muhim.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/auth/register" className="btn-primary px-7 py-3.5 text-base">
                  Tasvirimni himoya qilish
                </Link>
                <Link
                  href="/report"
                  className="btn border border-white/20 bg-white/5 px-7 py-3.5 text-base text-white hover:bg-white/10"
                >
                  Huquqbuzarlik haqida xabar berish
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
