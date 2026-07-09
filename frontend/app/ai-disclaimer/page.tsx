import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "AI haqida ogohlantirish",
  description:
    "ImageRights.uz sun'iy intellekt yordamchisi imkoniyatlari va cheklovlari haqida ochiq ma'lumot.",
  alternates: { canonical: "/ai-disclaimer" },
};

export default function AiDisclaimerPage() {
  return (
    <LegalPage title="Sun’iy intellekt (AI) haqida ogohlantirish" updated="2026-yil iyul">
      <h2>1. AI yordamchi nima qiladi</h2>
      <p>
        Platformadagi AI yordamchi siz kiritgan hisobot ma’lumotlari asosida
        faktlarni tartiblaydi, yetishmayotgan ma’lumotlarni ko‘rsatadi,
        dastlabki baholash tayyorlaydi, advokat uchun savollar tuzadi va hujjat
        qoralamalarini shakllantirishga yordam beradi.
      </p>

      <h2>2. AI yordamchi nima qilmaydi</h2>
      <ul>
        <li>Yuridik maslahat bermaydi va advokat o‘rnini bosmaydi;</li>
        <li>Ish natijasi yoki sud qarorini kafolatlamaydi;</li>
        <li>Sizning nomingizdan hech qanday hujjat yubormaydi;</li>
        <li>Qonun normalari yoki sud amaliyotini mustaqil «yaratmaydi».</li>
      </ul>

      <h2>3. Cheklovlar haqida halol ogohlantirish</h2>
      <p>
        AI modellari xato qilishi mumkin: faktni noto‘g‘ri talqin qilishi,
        umumlashtirishda adashishi yoki mavjud bo‘lmagan ma’lumotni ishonchli
        ohangda taqdim etishi ehtimoli bor. Shu sababli har bir AI natijasida
        quyidagi ogohlantirish ko‘rsatiladi:
      </p>
      <p>
        <em>
          «Ushbu tahlil axborot xarakteriga ega va professional yuridik
          maslahat o‘rnini bosmaydi.»
        </em>
      </p>
      <p>
        Muhim qarorlar qabul qilishdan oldin AI tahlilini mustaqil tekshiring
        va malakali yurist bilan maslahatlashing.
      </p>

      <h2>4. Ma’lumotlaringiz va AI</h2>
      <p>
        AI tahlili faqat sizning so‘rovingiz bo‘yicha, siz taqdim etgan ish
        ma’lumotlari asosida bajariladi. So‘rovlar server orqali yuboriladi —
        AI kalitlari hech qachon brauzerga uzatilmaydi. Har bir tahlil
        natijasi ishingiz tarixida saqlanadi.
      </p>
    </LegalPage>
  );
}
