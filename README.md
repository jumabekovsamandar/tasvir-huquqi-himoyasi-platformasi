# ImageRights.uz — Tasvir huquqlari himoyasi platformasi

> **Raqamli dunyoda tasvir huquqlaringiz kafolati.**
> Fuqarolarning tasviridan ruxsatsiz foydalanish holatlarini hujjatlashtirish,
> dalillarni saqlash, huquqiy hujjatlar tayyorlash va ish jarayonini kuzatish
> uchun LegalTech platformasi.

Asoschi: **Jumabekov Samandar**

Asosiy oqim: **DETECT → DOCUMENT → ANALYZE → PROTECT → RESOLVE**

---

## Nima qila oladi

| Modul | Tavsif |
|---|---|
| **Tasvirlar reyestri** | Suratni yuklash: vaqt tamg‘asi, SHA-256 nazorat yig‘indisi, unikal reyestr kodi (`IMG-YYYY-XXXXXX`). Ichki reyestr — davlat ro‘yxati emas, dalillashga yordamchi hujjat |
| **Huquqbuzarlik hisobotlari** | 6 bosqichli intake: voqea → platforma → dalillar → rozilik → zarar → yuborish. Yuborilgach ish (`IR-YYYY-XXXXXX`) ochiladi |
| **Dalillar ombori** | Skrinshot/rasm/PDF/URL; magic-byte tekshiruvi, xavfsiz server nomlari, checksum, egalik nazorati |
| **Ish jarayoni** | Holatlar: `SUBMITTED → UNDER_REVIEW → ACTION_REQUIRED / NOTICE_PREPARED / LAWYER_REVIEW → RESOLVED → CLOSED`; vaqt chizig‘i (CaseStatusHistory), mijoz–advokat yozishmalari |
| **Hujjat generatori** | Platformaga shikoyat, olib tashlash talabi, ogohlantirish xati, dalillar xulosasi, advokat brief — o‘zbekcha shablonlar, tahrir, tasdiqlash, PDF eksport. Hech narsa avtomatik yuborilmaydi |
| **AI yordamchi** | Anthropic API orqali server tomonida: ish xulosasi, baholash, yetishmayotgan ma’lumotlar, advokat savollari, talabnoma qoralamasi. Har bir natijada majburiy disclaimer |
| **Advokat portali** | Biriktirilgan ishlar, holat boshqaruvi, mijozdan ma’lumot so‘rash, mijozga ko‘rinmaydigan ichki eslatmalar |
| **Admin panel** | Foydalanuvchi/advokat boshqaruvi, advokat verifikatsiyasi, ish biriktirish, murojaatlar, audit log |
| **Bildirishnomalar** | Ilova ichida; arxitektura email/SMS/Telegram kanallariga tayyor |

## Texnologiyalar

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React Hook Form + Zod
- **Backend:** NestJS 10, Prisma ORM, PostgreSQL
- **Xavfsizlik:** bcrypt (12 rounds), JWT (DB-tekshiruvli), helmet, rate limiting, magic-byte fayl validatsiyasi, IDOR-himoya (begona resurs → 404), audit log
- **Fayl saqlash:** lokal disk (dev) yoki istalgan S3-mos ombor (`STORAGE_DRIVER=s3`)
- **AI:** `@anthropic-ai/sdk` (faqat server tomonida; kalit sozlanmasa modul o‘zini o‘chiradi)

## Repozitoriya tuzilishi

```
.
├── frontend/   # Next.js — ochiq sayt + foydalanuvchi/advokat/admin kabinetlari
└── backend/    # NestJS — REST API, Prisma sxema, e2e testlar
```

## Lokal ishga tushirish

Talablar: Node.js 20+, PostgreSQL 14+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# .env ichida kamida DATABASE_URL va JWT_SECRET to'ldiring, masalan:
#   DATABASE_URL="postgresql://user:pass@localhost:5432/imagerights"
#   JWT_SECRET="uzun-tasodifiy-qator"
#   STORAGE_DRIVER=local
#   LOCAL_STORAGE_DIR=./storage
npx prisma migrate dev
npm run start:dev        # http://localhost:4000 (Swagger: /api/docs)
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                  # http://localhost:3000
```

### 3. Birinchi admin

Admin roli xavfsizlik nuqtai nazaridan API orqali berilmaydi — bazada bitta
buyruq bilan tayinlanadi:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'siz@example.com';
```

## Testlar va tekshiruvlar

```bash
cd backend
npm run typecheck   # tsc --noEmit
npm run build       # nest build
npm test            # 20 ta e2e test (lokal PostgreSQL talab qilinadi)

cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

E2e testlar qamrovi: ro‘yxatdan o‘tish/kirish, himoyalangan yo‘llar, IDOR
himoyasi, fayl yuklash validatsiyasi (exe-niqob rad etiladi), hisobot→ish
oqimi, advokat verifikatsiyasi va biriktirish, ichki eslatmalar maxfiyligi,
hujjat + PDF, admin cheklovlari.

## Muhit o‘zgaruvchilari

### Backend (`backend/.env.example`)

| O‘zgaruvchi | Majburiy | Tavsif |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL ulanish qatori |
| `JWT_SECRET` | ✅ | JWT imzo kaliti (uzun tasodifiy qiymat) |
| `JWT_EXPIRES_IN` | — | Token muddati (default `7d`) |
| `PORT`, `NODE_ENV` | — | Server porti / muhit |
| `CORS_ORIGIN` | ✅ (prod) | Frontend domeni (vergul bilan bir nechta) |
| `APP_BASE_URL` | ✅ (prod) | Frontend bazaviy URL (email havolalari uchun) |
| `API_BASE_URL` | ✅ (prod) | Backend bazaviy URL (OAuth callback uchun) |
| `STORAGE_DRIVER` | — | `local` (default) yoki `s3` |
| `LOCAL_STORAGE_DIR` | — | Lokal driver katalogi |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | s3 uchun | Istalgan S3-mos ombor (AWS S3, R2, MinIO) |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | — | AI yordamchi (bo‘lmasa modul o‘chiq, sayt ishlashda davom etadi) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | — | Parol tiklash/email tasdiqlash xatlari (bo‘lmasa xat server logiga yoziladi) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | — | Google OAuth (ikkalasi bo‘lsagina tugma ko‘rinadi) |
| `ONEID_CLIENT_ID`, `ONEID_CLIENT_SECRET`, `ONEID_REDIRECT_URI` | — | OneID (sso.egov.uz) OAuth |

Google OAuth sozlash: Google Cloud Console'da OAuth client yarating,
redirect URI sifatida `{API_BASE_URL}/api/auth/google/callback` kiriting,
so‘ng ikkala env qiymatini o‘rnating — frontend tugmani avtomatik ko‘rsatadi.

### Frontend (`frontend/.env.example`)

| O‘zgaruvchi | Tavsif |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend manzili (default `http://localhost:4000`) |

## Deploy

- **Frontend (Vercel):** repo'ni ulang, root `frontend/`, `NEXT_PUBLIC_API_URL` ni o‘rnating.
- **Backend (Render/Railway/VPS):** root `backend/`; build: `npm install && npx prisma migrate deploy && npm run build`; start: `npm run start:prod`. Managed PostgreSQL ulang, `CORS_ORIGIN` ga frontend domenini yozing.
- **Fayllar:** productionda `STORAGE_DRIVER=s3` tavsiya etiladi (lokal disk ephemeral hostingda yo‘qoladi).

## Ma’lumotlar modeli (asosiy jadvallar)

`User` (USER/LAWYER/ADMIN, soft delete) → `Profile`, `LawyerProfile` (admin
verifikatsiyasi) · `ProtectedImage` → `ViolationReport` → `Case` (1:1) →
`CaseStatusHistory`, `CaseNote` (ichki), `CaseMessage`, `Document`,
`AIAnalysis` · `Evidence` (hisobotga bog‘liq) · `Notification` ·
`ContactSubmission` · `AuditLog` · `PasswordResetToken`, `EmailVerifyToken`.

## Ma’lum cheklovlar

- **Huquqiy sahifalar qoralama** — privacy/terms/AI-disclaimer matnlari ishga tushirishdan oldin malakali yurist ko‘rigidan o‘tishi shart (sahifalarda shunday belgi bor).
- **Email yuborish** SMTP sozlanmagan bo‘lsa xatlar faqat server logiga yoziladi (parol tiklash havolasi foydalanuvchiga yetib bormaydi).
- **JWT bearer token** localStorage'da saqlanadi (SPA+API uchun standart, CSRF talab qilmaydi); refresh-token rotatsiyasi hali yo‘q.
- **i18n**: barcha matnlar o‘zbek (lotin) tilida markazlashgan; ru/en tarjimalari uchun arxitektura tayyor, lekin tarjimalar kiritilmagan.
- **OneID/Google OAuth** kod darajasida tayyor, real client-ma’lumotlar bilan sinovdan o‘tkazish deploy bosqichida qilinadi.

## Keyingi qadamlar (tavsiya)

1. Yurist ko‘rigi (huquqiy sahifalar + hujjat shablonlari).
2. SMTP provayder ulash va email-verifikatsiyani majburiy qilish.
3. S3 + CDN, so‘ng dalillar uchun kuchliroq timestamping (masalan, RFC 3161).
4. Refresh-token rotatsiyasi va sessiyalarni boshqarish sahifasi.
5. Rus va ingliz tillari.
6. To‘lov/tarif modullari (hozircha ataylab yo‘q — soxta narxlar ko‘rsatilmaydi).

---

© 2026 ImageRights.uz. Platformadagi ma’lumotlar axborot xarakteriga ega
bo‘lib, professional yuridik maslahat o‘rnini bosmaydi.
