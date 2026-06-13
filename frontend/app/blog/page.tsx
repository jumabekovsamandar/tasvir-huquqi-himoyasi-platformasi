import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Blog — Tasvir huquqi, Deepfake va Raqamli huquqlar",
  description:
    "Tasvir huquqi, deepfake, sun'iy intellekt huquqi, shaxsiy ma'lumotlar himoyasi va LegalTech bo‘yicha maqolalar.",
};

const CATEGORIES = [
  "Tasvir huquqi",
  "Deepfake",
  "Sun'iy intellekt huquqi",
  "Shaxsiy ma'lumotlar",
  "LegalTech",
  "Raqamli huquqlar",
];

const POSTS = [
  {
    category: "Deepfake",
    title: "Deepfake nima va undan qanday himoyalanish mumkin?",
    excerpt:
      "Soxta videolar texnologiyasi qanday ishlaydi, ularni qanday aniqlash va huquqiy javobgarlikka tortish yo‘llari.",
    date: "10-iyun, 2026",
    read: "6 daq",
  },
  {
    category: "Tasvir huquqi",
    title: "O‘zbekistonda tasvir huquqi: fuqaro nimalarni bilishi kerak",
    excerpt:
      "Tasvirga bo‘lgan huquqning qonuniy asoslari, buzilish holatlari va himoya mexanizmlari haqida to‘liq qo‘llanma.",
    date: "05-iyun, 2026",
    read: "8 daq",
  },
  {
    category: "Sun'iy intellekt huquqi",
    title: "AI yaratgan kontent va mualliflik huquqi",
    excerpt:
      "Generativ sun'iy intellekt davrida kim huquq egasi hisoblanadi va qonunchilik qanday rivojlanmoqda.",
    date: "01-iyun, 2026",
    read: "5 daq",
  },
  {
    category: "Shaxsiy ma'lumotlar",
    title: "Unutilish huquqi: havolalarni qanday o‘chirtirish mumkin",
    excerpt:
      "Internetda shaxsiy ma'lumotlaringizni o‘chirtirish bo‘yicha amaliy qadamlar va qonuniy asoslar.",
    date: "28-may, 2026",
    read: "7 daq",
  },
  {
    category: "LegalTech",
    title: "LegalTech qanday qilib huquqiy yordamni demokratlashtirmoqda",
    excerpt:
      "Texnologiya advokat xizmatlarini hamma uchun arzon va tezkor qilmoqda. Kelajak qanday ko‘rinadi?",
    date: "22-may, 2026",
    read: "6 daq",
  },
  {
    category: "Raqamli huquqlar",
    title: "Raqamli identifikatsiya va onlayn huquqlaringiz",
    excerpt:
      "OneID, raqamli imzo va onlayn dunyoda o‘z huquqlaringizni himoya qilishning zamonaviy vositalari.",
    date: "18-may, 2026",
    read: "4 daq",
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        <section className="container-px py-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Blog</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink-900">
              Tasvir huquqi va raqamli dunyo
            </h1>
            <p className="mt-4 text-lg text-ink-600">
              Deepfake, sun'iy intellekt huquqi, shaxsiy ma'lumotlar himoyasi va
              LegalTech bo‘yicha ekspert maqolalar.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c, i) => (
              <button
                key={c}
                className={
                  i === 0
                    ? "rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 hover:border-ink-300"
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post) => (
              <Link
                key={post.title}
                href="/blog"
                className="group flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-premium"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-brand-100 via-ink-100 to-brand-50" />
                <div className="flex flex-1 flex-col p-6">
                  <span className="inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {post.category}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold leading-snug text-ink-900 group-hover:text-brand-700">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4 text-xs text-ink-400">
                    <span>{post.date} · {post.read} o‘qish</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
