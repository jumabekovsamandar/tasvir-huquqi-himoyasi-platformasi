# ImageRights.uz — Tasvir Huquqlari Himoyasi Platformasi

> Markaziy Osiyodagi birinchi professional **LegalTech + AI** platformasi — fuqarolarning
> tasvirga bo‘lgan huquqlarini himoya qilish, monitoring, tijoratlashtirish va huquqiy yordam ekotizimi.

**ImageRights.uz** sun'iy intellekt yordamida suratlarni himoya qiladi, deepfake holatlarini
aniqlaydi, internetda ruxsatsiz tarqalgan nusxalarni topadi, elektron dalillar ombori yuritadi
va huquqbuzarlik holatlarida avtomatik huquqiy hujjatlar tayyorlaydi.

---

## ✨ Asosiy imkoniyatlar

| Modul | Tavsif |
|-------|--------|
| 🗂️ **Tasvir Huquqi Reyestri** | Suratni yuklash, egalikni tasdiqlash va huquqni ro‘yxatdan o‘tkazish |
| ✅ **Rozilik Boshqaruvi** | Foydalanishga ruxsat / taqiq, tijorat litsenziyasi, muddat, bekor qilish |
| 🤖 **Deepfake Aniqlash** | Yuz almashtirish, video montaj va AI-kontentni ishonchlilik foizi bilan aniqlash |
| 🔎 **Internet Monitoring** | Reverse image search, nusxalarni topish, havola va screenshot saqlash |
| 📑 **Elektron Dalillar Ombori** | Screenshot, metadata, vaqt tamg‘asi va hisobotlarni huquqiy kuchga ega saqlash |
| ⚖️ **AI Yuridik Yordamchi** | Ogohlantirish xati, olib tashlash talabi, sudgacha talabnoma, da'vo arizasi |
| 🧹 **Unutilish Huquqi** | O‘chirish talabnomasini tayyorlash va jarayonni kuzatish |
| 💼 **Litsenziyalash Bozori** | Tasvir foydalanish huquqini sotish va elektron shartnoma tuzish |

## 🧱 Texnologiyalar

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend:** NestJS, Prisma ORM
- **Database:** PostgreSQL
- **Storage:** AWS S3
- **Auth:** OneID, Google Login, Email/Parol (JWT)
- **AI:** Face Recognition, Reverse Image Search, Deepfake Detection, AI Legal Assistant, Risk Assessment

## 📁 Repozitoriya tuzilishi

```
.
├── frontend/        # Next.js — landing sahifa + professional dashboard
├── backend/         # NestJS — REST API, modullar, AI servislar
├── docs/            # Arxitektura, API spetsifikatsiyasi, ma'lumotlar bazasi sxemasi
└── README.md
```

## 🚀 Ishga tushirish

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env # ma'lumotlar bazasi va kalitlarni to‘ldiring
npx prisma generate
npx prisma migrate dev
npm run start:dev    # http://localhost:4000
```

## 🔐 Xavfsizlik

End-to-end shifrlash, audit log, Role-Based Access Control (RBAC) va xavfsiz fayl saqlash tizimi.
Batafsil: [`docs/SECURITY.md`](docs/SECURITY.md).

## 📚 Hujjatlar

- [Arxitektura](docs/ARCHITECTURE.md)
- [Ma'lumotlar bazasi sxemasi](docs/DATABASE.md)
- [API spetsifikatsiyasi](docs/API.md)
- [Yo‘l xaritasi (Roadmap)](docs/ROADMAP.md)

---

© 2026 ImageRights.uz — Tasviringiz. Huquqingiz. Himoyangiz.
