import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Foydalanish shartlari",
  description: "ImageRights.uz foydalanish shartlari (qoralama).",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Foydalanish shartlari" updated="2026-yil iyul">
      <h2>1. Xizmat tavsifi</h2>
      <p>
        ImageRights.uz — foydalanuvchilarga tasvir huquqlari buzilishini
        hujjatlashtirish, dalillarni saqlash, huquqiy hujjat qoralamalarini
        tayyorlash va ish jarayonini kuzatishga yordam beruvchi platforma.
        Platforma advokatlik faoliyatini amalga oshirmaydi va yuridik xizmat
        ko‘rsatuvchi tashkilot hisoblanmaydi.
      </p>

      <h2>2. Muhim cheklovlar</h2>
      <ul>
        <li>
          Platformadagi barcha tahlillar, shablonlar va ma’lumotlar axborot
          xarakteriga ega bo‘lib, yuridik maslahat o‘rnini bosmaydi;
        </li>
        <li>
          Ichki reyestrga yozish davlat ro‘yxatidan o‘tkazish hisoblanmaydi va
          avtomatik ravishda davlat tomonidan tan olinadigan intellektual mulk
          huquqini yaratmaydi;
        </li>
        <li>Platforma ish natijasi yoki sud qarorini kafolatlamaydi;</li>
        <li>Hujjatlar foydalanuvchi tasdig‘isiz hech qayerga yuborilmaydi.</li>
      </ul>

      <h2>3. Foydalanuvchi majburiyatlari</h2>
      <ul>
        <li>To‘g‘ri va haqqoniy ma’lumot taqdim etish;</li>
        <li>Faqat o‘ziga tegishli yoki himoya qilishga vakolatli tasvirlarni yuklash;</li>
        <li>Platformadan boshqalarning huquqlarini buzish, tuhmat yoki soxta hisobotlar uchun foydalanmaslik;</li>
        <li>Akkaunt ma’lumotlarini maxfiy saqlash.</li>
      </ul>

      <h2>4. Advokatlar ishtiroki</h2>
      <p>
        Advokatlar platformada mustaqil mutaxassis sifatida ishtirok etadi.
        «Tasdiqlangan» maqomi administrator tomonidan litsenziya ma’lumotlari
        tekshirilganini bildiradi, biroq platforma advokat ko‘rsatadigan
        xizmatlar sifati uchun javobgar emas. Advokat bilan alohida kelishuv
        munosabatlari platforma ishtirokisiz yuzaga keladi.
      </p>

      <h2>5. Javobgarlikni cheklash</h2>
      <p>
        Platforma texnik nosozliklar, uchinchi shaxslar harakatlari yoki
        foydalanuvchi taqdim etgan noto‘g‘ri ma’lumotlar natijasida yuzaga
        kelgan zarar uchun qonunchilikda yo‘l qo‘yilgan darajada javobgar
        bo‘lmaydi.
      </p>

      <h2>6. Akkauntni to‘xtatish</h2>
      <p>
        Ushbu shartlarni buzgan, soxta ma’lumot taqdim etgan yoki platformadan
        suiiste’mol maqsadida foydalangan akkauntlar administrator tomonidan
        bloklanishi mumkin.
      </p>

      <h2>7. O‘zgartirishlar</h2>
      <p>
        Shartlar yangilanishi mumkin. Muhim o‘zgarishlar haqida foydalanuvchilar
        platforma orqali xabardor qilinadi.
      </p>
    </LegalPage>
  );
}
