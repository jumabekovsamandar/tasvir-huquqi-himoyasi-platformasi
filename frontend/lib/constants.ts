import {
  ShieldCheck,
  FileCheck2,
  ScanFace,
  Globe2,
  FolderLock,
  Gavel,
  Eraser,
  Store,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

export const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Tasvir Huquqi Reyestri",
    description:
      "Suratingizni yuklang, egalikni tasdiqlang va tasvir huquqingizni rasman ro‘yxatdan o‘tkazing — vaqt tamg‘asi bilan.",
    href: "/dashboard/registry",
  },
  {
    icon: FileCheck2,
    title: "Elektron Rozilik Tizimi",
    description:
      "Foydalanishga ruxsat bering yoki taqiqlang, tijorat litsenziyasi va muddat belgilang, istalgan vaqtda bekor qiling.",
    href: "/dashboard/consent",
  },
  {
    icon: ScanFace,
    title: "Deepfake Aniqlash",
    description:
      "Yuz almashtirish, video montaj va AI yordamida yaratilgan kontentni ishonchlilik foizi bilan aniqlang.",
    href: "/dashboard/deepfake",
  },
  {
    icon: Globe2,
    title: "Internet Monitoring",
    description:
      "Reverse image search yordamida tasviringiz nusxalarini internetdan toping — havola, sana va screenshot bilan.",
    href: "/dashboard/monitoring",
  },
  {
    icon: FolderLock,
    title: "Elektron Dalillar Bazasi",
    description:
      "Screenshot, metadata, vaqt tamg‘asi va hisobotlar huquqiy kuchga ega elektron dalil sifatida saqlanadi.",
    href: "/dashboard/evidence",
  },
  {
    icon: Gavel,
    title: "AI Da'vo Generatori",
    description:
      "Ogohlantirish xati, olib tashlash talabi, sudgacha talabnoma va da'vo arizasini avtomatik shakllantiring.",
    href: "/dashboard/legal-assistant",
  },
  {
    icon: Eraser,
    title: "Unutilish Huquqi",
    description:
      "Havolani yuboring — tizim o‘chirish talabnomasini tayyorlaydi va jarayonni boshidan oxirigacha kuzatadi.",
    href: "/dashboard/right-to-be-forgotten",
  },
  {
    icon: Store,
    title: "Tasvir Litsenziyalash Bozori",
    description:
      "Tasvirlaringizdan foydalanish huquqini soting, kompaniyalar litsenziya sotib olib elektron shartnoma tuzadi.",
    href: "/dashboard/marketplace",
  },
];

export type Plan = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  highlighted?: boolean;
  cta: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: "0",
    period: "so‘m / oy",
    tagline: "Shaxsiy himoyani sinab ko‘rish uchun",
    cta: "Bepul boshlash",
    features: [
      "Oyiga 5 ta tekshiruv",
      "1 ta tasvirni ro‘yxatdan o‘tkazish",
      "Asosiy deepfake skaneri",
      "Email orqali qo‘llab-quvvatlash",
    ],
  },
  {
    name: "Professional",
    price: "149 000",
    period: "so‘m / oy",
    tagline: "Bloger, influencer va san'atkorlar uchun",
    highlighted: true,
    cta: "Professional sotib olish",
    features: [
      "Cheksiz tekshiruv",
      "To‘liq deepfake hisobotlari",
      "24/7 internet monitoring",
      "Elektron dalillar ombori",
      "AI da'vo generatori",
      "Ustuvor qo‘llab-quvvatlash",
    ],
  },
  {
    name: "Business",
    price: "990 000",
    period: "so‘m / oy",
    tagline: "Agentliklar va OAV tashkilotlari uchun",
    cta: "Jamoa uchun ulanish",
    features: [
      "Professional rejaning barchasi",
      "Jamoaviy foydalanish (10 a'zo)",
      "Brend monitoringi",
      "Litsenziyalash bozori",
      "API kirish huquqi",
      "Shaxsiy menejer",
    ],
  },
  {
    name: "Enterprise",
    price: "Kelishuv",
    period: "asosida",
    tagline: "Davlat organlari va yirik kompaniyalar",
    cta: "Savdo bo‘limi bilan bog‘lanish",
    features: [
      "Individual yechimlar",
      "Maxsus integratsiyalar (OneID, ERP)",
      "Cheksiz a'zolar",
      "SLA kafolati",
      "On-premise variant",
      "Maxsus AI modellari",
    ],
  },
];

export type Problem = {
  title: string;
  description: string;
};

export const PROBLEMS: Problem[] = [
  {
    title: "Deepfake xavfi",
    description:
      "Sun'iy intellekt yordamida yaratilgan soxta videolar obro‘ingizni va xavfsizligingizni tahdid ostiga qo‘yadi.",
  },
  {
    title: "Ruxsatsiz surat tarqatilishi",
    description:
      "Suratlaringiz sizning roziligingizsiz reklama, sayt va ijtimoiy tarmoqlarda ishlatilmoqda.",
  },
  {
    title: "Shaxsiy hayot daxlsizligi buzilishi",
    description:
      "Shaxsiy fotosuratlaringiz nazoratsiz tarqalib, daxlsizlik huquqingiz buzilmoqda.",
  },
  {
    title: "Tasvir huquqining buzilishi",
    description:
      "Huquqbuzarlikni isbotlash va dalil to‘plash murakkab, sekin va qimmatga tushadi.",
  },
];

export const SOLUTIONS = [
  {
    title: "Bir platformada to‘liq nazorat",
    description:
      "Ro‘yxatga olishdan tortib sudgacha — tasvir huquqlaringizning butun hayot sikli yagona tizimda.",
  },
  {
    title: "Sun'iy intellekt kuchi",
    description:
      "Deepfake aniqlash, yuzni tanish va reverse image search modellari xavflarni soniyalarda aniqlaydi.",
  },
  {
    title: "Huquqiy kuchga ega dalillar",
    description:
      "Har bir screenshot va metadata vaqt tamg‘asi bilan saqlanib, sudda dalil sifatida foydalaniladi.",
  },
  {
    title: "Avtomatik huquqiy yordam",
    description:
      "AI yuridik yordamchi bir necha daqiqada professional huquqiy hujjatlarni tayyorlaydi.",
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  initials: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Dilnoza Karimova",
    role: "Influencer · 1.2M obunachi",
    quote:
      "Suratlarim ruxsatsiz reklama uchun ishlatilgan edi. ImageRights bir kunda dalil to‘plab, olib tashlash talabini tayyorladi. Endi xotirjamman.",
    initials: "DK",
  },
  {
    name: "Jasur Aliyev",
    role: "Sport jurnalisti",
    quote:
      "Deepfake aniqlash funksiyasi haqiqatan ham professional. Soxta video tarqatilganini boshqalardan oldin bildik.",
    initials: "JA",
  },
  {
    name: "Madina Yusupova",
    role: "Advokat · Huquq firmasi",
    quote:
      "Mijozlarim uchun elektron dalillar bazasi vaqtimni tejaydi. Hujjatlar sud talablariga to‘liq mos keladi.",
    initials: "MY",
  },
  {
    name: "Sardor Rashidov",
    role: "Reklama agentligi rahbari",
    quote:
      "Litsenziyalash bozori orqali modellardan qonuniy ravishda tasvir huquqini sotib olamiz. Hammasi shaffof va elektron.",
    initials: "SR",
  },
];

export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: "ImageRights.uz qanday ishlaydi?",
    answer:
      "Suratingizni yuklaysiz va egaligingizni tasdiqlaysiz. Tizim uni reyestrga vaqt tamg‘asi bilan kiritadi, internetni monitoring qiladi, deepfake holatlarini aniqlaydi va huquqbuzarlik aniqlansa, avtomatik huquqiy hujjatlar tayyorlaydi.",
  },
  {
    question: "Deepfake aniqlash qanchalik aniq?",
    answer:
      "AI modellarimiz yuz almashtirish, video montaj va generativ kontentni tahlil qilib, har bir natija uchun ishonchlilik foizini ko‘rsatadi. Tahlil natijalari elektron dalil sifatida saqlanadi.",
  },
  {
    question: "Tayyorlangan hujjatlar huquqiy kuchga egami?",
    answer:
      "Ha. Barcha screenshot va metadata vaqt tamg‘asi bilan saqlanadi va O‘zbekiston qonunchiligiga muvofiq sudgacha hamda sud jarayonlarida dalil sifatida foydalanish uchun shakllantiriladi.",
  },
  {
    question: "Ma'lumotlarim xavfsizmi?",
    answer:
      "End-to-end shifrlash, RBAC kirish nazorati, audit log va xavfsiz fayl saqlash tizimidan foydalanamiz. Tasvirlaringiz faqat sizning ruxsatingiz bilan ishlatiladi.",
  },
  {
    question: "Qanday kirishim mumkin?",
    answer:
      "OneID, Google yoki email/parol orqali ro‘yxatdan o‘tishingiz mumkin. OneID integratsiyasi O‘zbekiston fuqarolari uchun rasmiy identifikatsiyani ta'minlaydi.",
  },
  {
    question: "Bepul rejada nimalar bor?",
    answer:
      "Free rejada oyiga 5 ta tekshiruv, 1 ta tasvirni ro‘yxatdan o‘tkazish va asosiy deepfake skaneri mavjud. Cheksiz imkoniyatlar uchun Professional rejaga o‘ting.",
  },
];

export const STATS = [
  { value: "1M+", label: "Himoyalangan tasvir" },
  { value: "99.2%", label: "Deepfake aniqlash aniqligi" },
  { value: "24/7", label: "Internet monitoring" },
  { value: "<3 daq", label: "Hujjat tayyorlash vaqti" },
];

export const NAV_LINKS = [
  { label: "Imkoniyatlar", href: "#features" },
  { label: "Yechim", href: "#solution" },
  { label: "Tariflar", href: "#pricing" },
  { label: "Mijozlar", href: "#testimonials" },
  { label: "Savollar", href: "#faq" },
];
