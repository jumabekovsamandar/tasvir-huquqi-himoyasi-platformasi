import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, Scale, ShieldCheck, Target } from "lucide-react";
import { PublicPage } from "@/components/layout/PublicPage";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "ImageRights.uz — O‘zbekiston va Markaziy Osiyoda fuqarolarning tasvir huquqlarini himoya qilishga qaratilgan LegalTech platformasi. Asoschisi: Jumabekov Samandar.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Inson qadr-qimmati",
    text: "Tasvir — shaxsning bir qismi. Uni himoya qilish shunchaki huquqiy masala emas, insonning o‘ziga bo‘lgan hurmat masalasi.",
  },
  {
    icon: Scale,
    title: "Halol huquqiy yondashuv",
    text: "Biz natija va’da qilmaymiz, statistika to‘qimaymiz. Platformaning har bir bo‘limi nima qila olishi va nima qila olmasligini ochiq aytamiz.",
  },
  {
    icon: Target,
    title: "Amaliy foyda",
    text: "Har bir funksiya bitta savolga javob beradi: bu foydalanuvchiga huquqini himoya qilishda real yordam beradimi?",
  },
  {
    icon: Globe2,
    title: "Mintaqaviy istiqbol",
    text: "Bugun O‘zbekiston, ertaga Markaziy Osiyo. Arxitektura boshidanoq ko‘p tillilik va mintaqaviy kengayishga tayyorlab qurilgan.",
  },
];

export default function AboutPage() {
  return (
    <PublicPage
      eyebrow="Biz haqimizda"
      title="Raqamli makonda inson tasviri himoyasiz qolmasligi kerak"
      intro="ImageRights.uz — O‘zbekistonda fuqarolarning tasvirga bo‘lgan huquqlarini himoya qilishga ixtisoslashgan LegalTech platformasi."
    >
      <div className="mx-auto max-w-4xl space-y-12">
        <section aria-labelledby="mission">
          <h2 id="mission" className="text-xl font-bold text-ink-900">
            Missiyamiz
          </h2>
          <p className="mt-3 leading-relaxed text-ink-700">
            Internet va sun’iy intellekt davri insonning tasviri bilan bog‘liq
            xatarlarni keskin oshirdi: suratlar roziliksiz reklamalarda
            ishlatiladi, ijtimoiy tarmoqlarda tarqatiladi, kontekstdan yulib
            olinadi. Ko‘pchilik esa bunday holatda nima qilishni bilmaydi —
            dalillar yo‘qoladi, murojaat kechikadi, huquqbuzarlik jazosiz qoladi.
          </p>
          <p className="mt-3 leading-relaxed text-ink-700">
            Bizning missiyamiz — tasvir huquqlarini himoya qilishni oddiy,
            tartibli va hamma uchun tushunarli jarayonga aylantirish.
            Huquqbuzarlikni hujjatlashtirishdan advokat bilan ishlashgacha —
            butun yo‘l bitta platformada, aniq bosqichlarda o‘tadi.
          </p>
        </section>

        <section aria-labelledby="founder">
          <h2 id="founder" className="text-xl font-bold text-ink-900">
            Asoschi
          </h2>
          <div className="card mt-4 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ink-950 text-xl font-bold text-white" aria-hidden>
              JS
            </span>
            <div>
              <h3 className="text-lg font-semibold text-ink-900">Jumabekov Samandar</h3>
              <p className="text-sm text-ink-500">Asoschi va loyiha rahbari</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Loyiha O‘zbekistonda raqamli huquqlar madaniyatini
                rivojlantirish, fuqarolarga o‘z tasviri ustidan real nazoratni
                qaytarish va huquqiy yordamni texnologiya orqali
                yaqinlashtirish maqsadida tashkil etilgan.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="values">
          <h2 id="values" className="text-xl font-bold text-ink-900">
            Qadriyatlarimiz
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="card">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <v.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold text-ink-900">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card bg-ink-950 text-center text-white sm:p-10">
          <h2 className="text-2xl font-bold">Savolingiz bormi?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-300">
            Hamkorlik, taklif yoki platformadan foydalanish bo‘yicha
            murojaatlaringizni kutamiz.
          </p>
          <Link href="/contact" className="btn-primary mx-auto mt-6 w-fit">
            Biz bilan bog‘lanish
          </Link>
        </section>
      </div>
    </PublicPage>
  );
}
