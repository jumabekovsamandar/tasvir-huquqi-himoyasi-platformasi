import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/layout/PublicPage";
import { Alert } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Tasvir huquqlari haqida",
  description:
    "Tasvirga bo‘lgan huquq nima? Rozilik, tijorat maqsadida foydalanish, ijtimoiy tarmoqlar, OAV va istisnolar haqida tushunarli huquqiy ma’lumot markazi.",
  alternates: { canonical: "/image-rights" },
};

const TOPICS = [
  {
    id: "nima",
    title: "Tasvirga bo‘lgan huquq nima?",
    body: [
      "Tasvirga bo‘lgan huquq — bu insonning o‘z surati, videosi va boshqa vizual aksidan foydalanishni nazorat qilish huquqi. U shaxsiy nomulkiy huquqlar qatoriga kiradi va inson qadr-qimmati hamda shaxsiy hayot daxlsizligi bilan bevosita bog‘liq.",
      "O‘zbekiston Respublikasi Fuqarolik kodeksi fuqaroning tasviri (surati, videoyozuvi) undan faqat shu fuqaroning roziligi bilan foydalanish mumkinligini nazarda tutadi. Fuqaro vafotidan keyin bunday rozilikni uning yaqinlari beradi.",
    ],
  },
  {
    id: "rozilik",
    title: "Rozilik qanday bo‘lishi kerak?",
    body: [
      "Rozilik — tasviringizdan foydalanishga bergan ruxsatingiz. U og‘zaki, yozma yoki harakat orqali (masalan, professional fotosessiyada qatnashish) ifodalanishi mumkin, ammo isbot nuqtai nazaridan yozma rozilik eng ishonchli hisoblanadi.",
      "Muhim: bir maqsad uchun berilgan rozilik boshqa maqsadga avtomatik o‘tmaydi. Do‘stona suratga tushishga rozilik — o‘sha suratni reklamada ishlatishga rozilik degani emas. Rozilikni keyinchalik bekor qilish masalasi esa foydalanish sharoitiga bog‘liq bo‘lib, har bir holatda alohida baholanadi.",
    ],
  },
  {
    id: "tijorat",
    title: "Tijorat maqsadida foydalanish",
    body: [
      "Suratingiz mahsulot yoki xizmat reklamasida, banner va biznes-akkauntlarda, pullik kontentda ishlatilsa — bu tijorat maqsadidagi foydalanish hisoblanadi. Bunday foydalanish uchun odatda aniq (ko‘pincha yozma) rozilik talab etiladi.",
      "Tijorat maqsadida ruxsatsiz foydalanish huquqbuzarlikning eng jiddiy ko‘rinishlaridan biri bo‘lib, zarar (shu jumladan ma’naviy zarar) qoplashni talab qilish uchun asos bo‘lishi mumkin.",
    ],
  },
  {
    id: "ijtimoiy",
    title: "Ijtimoiy tarmoqlarda e’lon qilish",
    body: [
      "Suratni ijtimoiy tarmoqqa o‘zingiz joylaganingiz — undan boshqalar istalgancha foydalanishi mumkin degani emas. Platformaga yuklash platforma qoidalari doirasidagi ruxsat bo‘lib, uchinchi shaxslarning suratni ko‘chirib olishi, qayta e’lon qilishi yoki o‘zgartirishi alohida baholanadi.",
      "Boshqa birov sizning suratingizni o‘z akkauntida roziliksiz e’lon qilsa — ayniqsa haqoratli kontekstda yoki daromad olish maqsadida — bu tasvir huquqining buzilishi bo‘lishi mumkin. Bunday holatda platformaning o‘ziga shikoyat yuborish eng tez birinchi qadam hisoblanadi.",
    ],
  },
  {
    id: "oav",
    title: "OAV va jamoat manfaati istisnolari",
    body: [
      "Qonunchilik ayrim holatlarda tasvirdan roziliksiz foydalanishga yo‘l qo‘yadi: davlat yoki jamiyat manfaatlari yuzasidan foydalanish, shuningdek fuqaro ommaviy tadbirlarda (yig‘ilish, konsert, sport musobaqasi kabi) suratga tushib qolgan holatlar shular jumlasidan.",
      "Jurnalistika faoliyatida jamoat ahamiyatiga ega voqealarni yoritish ham alohida rejimga ega. Biroq bu istisnolar cheksiz emas: xabar berish niqobi ostida tijorat reklamasi qilish yoki insonni kamsituvchi kontekstda ko‘rsatish istisno doirasidan chiqib ketishi mumkin.",
    ],
  },
  {
    id: "himoya",
    title: "Qanday himoya vositalari mavjud?",
    body: [
      "Amaldagi asosiy vositalar: platformaning o‘ziga shikoyat (ko‘pincha eng tezkori), kontent joylashtirgan shaxsga rasmiy talab yuborish, sudgacha tartibda talabnoma, vakolatli davlat organlariga murojaat va nihoyat sudga da’vo arizasi (foydalanishni taqiqlash, olib tashlash, zarar va ma’naviy ziyonni qoplash).",
      "Qaysi yo‘l samarali bo‘lishi holatga bog‘liq. Har qanday yo‘lda ham hal qiluvchi omil — sifatli hujjatlashtirilgan dalillar: aniq sanalar, saqlangan skrinshotlar, havolalar va egalikni ko‘rsatuvchi materiallar. ImageRights.uz aynan shu bosqichni tartibga soladi.",
    ],
  },
];

export default function ImageRightsPage() {
  return (
    <PublicPage
      eyebrow="Bilim markazi"
      title="Tasvir huquqlari: bilishingiz kerak bo‘lgan asoslar"
      intro="Ruxsatsiz suratdan foydalanish bilan duch kelganingizda to‘g‘ri qaror qabul qilishingiz uchun tushunarli tilda tayyorlangan ma’lumotlar."
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="top-24 hidden self-start lg:sticky lg:block" aria-label="Sahifa bo‘limlari">
          <ul className="space-y-1 border-l border-ink-100 text-sm">
            {TOPICS.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  className="block border-l-2 border-transparent px-4 py-1.5 text-ink-500 hover:border-brand-400 hover:text-ink-900"
                >
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-10">
          <Alert tone="warning">
            <strong>Muhim:</strong> Ushbu sahifadagi ma’lumotlar umumiy axborot
            xarakteriga ega bo‘lib, yuridik maslahat hisoblanmaydi. Aniq holatingiz
            bo‘yicha qaror qabul qilishdan oldin malakali yuristga murojaat qiling.
          </Alert>
          {TOPICS.map((t) => (
            <section key={t.id} id={t.id} aria-labelledby={`${t.id}-h`}>
              <h2 id={`${t.id}-h`} className="text-xl font-bold text-ink-900">
                {t.title}
              </h2>
              {t.body.map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-ink-700">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <div className="card bg-ink-950 text-white">
            <h2 className="text-lg font-semibold">Huquqingiz buzilgan deb o‘ylaysizmi?</h2>
            <p className="mt-2 text-sm text-ink-300">
              Dalillarni hoziroq hujjatlashtirishni boshlang — vaqt o‘tgani sari
              kontent o‘chirilishi yoki o‘zgartirilishi mumkin.
            </p>
            <Link href="/report" className="btn-primary mt-5 w-fit">
              Huquqbuzarlik haqida xabar berish
            </Link>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
