import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: "ImageRights.uz maxfiylik siyosati (qoralama).",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Maxfiylik siyosati" updated="2026-yil iyul">
      <h2>1. Umumiy qoidalar</h2>
      <p>
        Ushbu Maxfiylik siyosati ImageRights.uz platformasi (keyingi o‘rinlarda
        — «Platforma») foydalanuvchilarning shaxsiy ma’lumotlarini qanday
        to‘plashi, saqlashi va himoya qilishini belgilaydi. Platformadan
        foydalanish orqali siz ushbu siyosat shartlariga rozilik bildirasiz.
      </p>

      <h2>2. Qanday ma’lumotlar to‘planadi</h2>
      <ul>
        <li>Akkaunt ma’lumotlari: ism, email, telefon (ixtiyoriy), parol xeshi;</li>
        <li>Advokatlar uchun: litsenziya raqami va mutaxassislik;</li>
        <li>Siz yuklagan tasvirlar, dalillar va hisobot mazmuni;</li>
        <li>Xavfsizlik jurnallari: kirish vaqti, IP-manzil, brauzer ma’lumoti;</li>
        <li>Aloqa formasidagi murojaat mazmuni.</li>
      </ul>

      <h2>3. Ma’lumotlardan foydalanish maqsadlari</h2>
      <p>
        Ma’lumotlar faqat xizmatni ko‘rsatish uchun ishlatiladi: akkauntni
        yuritish, hisobot va ishlarni qayta ishlash, hujjat qoralamalarini
        tayyorlash, xavfsizlikni ta’minlash hamda qonuniy majburiyatlarni
        bajarish. Ma’lumotlar reklama maqsadida uchinchi shaxslarga
        sotilmaydi.
      </p>

      <h2>4. Kim ko‘ra oladi</h2>
      <p>
        Tasvirlar va dalillar sukut bo‘yicha faqat egasiga ko‘rinadi. Ishga
        advokat biriktirilganda, u faqat shu ishga tegishli materiallarni ko‘ra
        oladi. Administratorlar tizim ishlashini ta’minlash doirasida
        ma’lumotlarga kirishi mumkin — bunday kirishlar audit jurnalida qayd
        etiladi.
      </p>

      <h2>5. Saqlash muddati va o‘chirish</h2>
      <p>
        Ma’lumotlar akkaunt faol bo‘lgan davrda saqlanadi. Siz istalgan vaqtda
        kabinetdagi sozlamalar orqali ma’lumotlaringiz nusxasini (eksport)
        olishingiz yoki akkauntni o‘chirishni so‘rashingiz mumkin. Akkaunt
        o‘chirilganda shaxsiy ma’lumotlar anonimlashtiriladi; ishlar bo‘yicha
        yozuvlar qonunchilik talab qilgan hollarda saqlanib qolishi mumkin.
      </p>

      <h2>6. Xavfsizlik choralari</h2>
      <p>
        Parollar qaytarilmas xesh ko‘rinishida saqlanadi, fayllarga kirish
        avtorizatsiya tekshiruvidan o‘tadi, muhim amallar audit jurnalida qayd
        etiladi. Internet orqali uzatishda shifrlangan (HTTPS) aloqadan
        foydalaniladi.
      </p>

      <h2>7. Cookie fayllari</h2>
      <p>
        Platforma faqat ishlash uchun zarur bo‘lgan texnik saqlash
        vositalaridan (sessiya ma’lumotlari) foydalanadi. Reklama yoki kuzatuv
        cookie’lari ishlatilmaydi.
      </p>

      <h2>8. Murojaat</h2>
      <p>
        Maxfiylik bo‘yicha savollar uchun «Aloqa» sahifasi orqali murojaat
        qilishingiz mumkin.
      </p>
    </LegalPage>
  );
}
