# Arxitektura — ImageRights.uz

ImageRights.uz millionlab foydalanuvchini qo‘llab-quvvatlash uchun mo‘ljallangan
gorizontal kengayuvchi (horizontally scalable) **SaaS** arxitekturasiga ega.

## Yuqori darajadagi ko‘rinish

```
┌──────────────┐      ┌─────────────────────┐      ┌──────────────────┐
│   Brauzer /  │ HTTPS│   Next.js (Vercel)  │ REST │   NestJS API     │
│  Mobil PWA   │─────▶│  SSR + App Router   │─────▶│  (Node.js)       │
└──────────────┘      └─────────────────────┘      └────────┬─────────┘
                                                             │
        ┌────────────────────────────────────────────────────┼───────────────┐
        │                          │                          │               │
   ┌────▼─────┐            ┌───────▼────────┐         ┌───────▼──────┐  ┌─────▼──────┐
   │PostgreSQL│            │   AWS S3        │         │  AI servis   │  │  Redis     │
   │(Prisma)  │            │ (xavfsiz fayl)  │         │  qatlami     │  │ (cache/queue)│
   └──────────┘            └─────────────────┘         └──────────────┘  └────────────┘
```

## Qatlamlar

### 1. Frontend (Next.js 14, App Router)
- Server Components bilan tez yuklash va SEO.
- Marketing sahifalari statik generatsiya (SSG) qilinadi.
- Dashboard — autentifikatsiyalangan, mijoz tomonidagi interaktiv qatlam.
- Tailwind CSS dizayn tizimi (premium to‘q ko‘k palitra, Inter shrifti).

### 2. Backend (NestJS)
- Modulli monolit — har bir domen alohida modul (`auth`, `images`, `consent`,
  `deepfake`, `monitoring`, `evidence`, `legal`, `rtbf`, `marketplace`).
- Kerak bo‘lganda modullar mustaqil mikroservislarga ajratiladi.
- Prisma ORM orqali PostgreSQL bilan ishlaydi.
- JWT autentifikatsiya + Passport; RBAC guard orqali rollarni nazorat qiladi.
- OpenAPI/Swagger hujjati `/api/docs` da.

### 3. AI servis qatlami
| Servis | Vazifa |
|--------|--------|
| Face Recognition | Tasvirdagi yuzlarni aniqlash va taqqoslash |
| Reverse Image Search | Internetdan nusxalarni topish (pHash + embeddinglar) |
| Deepfake Detection | Yuz almashtirish, montaj va AI-kontentni baholash |
| AI Legal Assistant | Huquqiy hujjatlarni generativ model bilan yaratish |
| Risk Assessment | Huquqbuzarlik xavfini ballash va ustuvorlashtirish |

AI servislari REST/gRPC orqali chaqiriladi va og‘ir vazifalar navbat (queue)
orqali asinxron bajariladi.

### 4. Saqlash
- **PostgreSQL** — tranzaksion ma'lumotlar (foydalanuvchi, reyestr, rozilik, dalil).
- **AWS S3** — shifrlangan tasvirlar, screenshotlar, shartnomalar.
- **Redis** — keshlash, sessiyalar va fon vazifalari navbati.

## Kengayuvchanlik (Scalability)
- Stateless API instancelari yuk balanslagich (load balancer) orqasida.
- Bazada o‘qish replikalari (read replicas) va indekslangan so‘rovlar.
- S3 + CDN orqali statik media tarqatish.
- Fon vazifalari (monitoring, deepfake) gorizontal worker’lar bilan kengayadi.

## Kuzatuv (Observability)
- Audit log barcha muhim amallarni yozadi (`AuditLog` modeli).
- Strukturali loglar, metrikalar va xatolik kuzatuvi (Sentry/Prometheus uchun tayyor).
