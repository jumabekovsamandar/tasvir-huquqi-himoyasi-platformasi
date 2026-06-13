# Xavfsizlik — ImageRights.uz

Platforma sezgir shaxsiy ma'lumotlar va huquqiy dalillar bilan ishlagani uchun
xavfsizlik birinchi o‘rinda turadi.

## Autentifikatsiya va avtorizatsiya
- **JWT** asosidagi stateless autentifikatsiya (Passport).
- **OneID**, **Google** va **Email/parol** kirish usullari.
- Parollar `bcrypt` bilan xeshlanadi (hech qachon ochiq saqlanmaydi).
- Ikki bosqichli autentifikatsiya (2FA) qo‘llab-quvvatlanadi.

## Role-Based Access Control (RBAC)
- Rollar: `USER`, `CREATOR`, `LAWYER`, `AGENCY`, `GOV`, `ADMIN`, `SUPERADMIN`.
- `RolesGuard` + `@Roles()` dekoratori orqali endpoint darajasida nazorat.

## Shifrlash
- **Transport:** barcha trafik HTTPS/TLS orqali.
- **At rest:** S3 obyektlari va bazadagi sezgir maydonlar shifrlanadi.
- **End-to-end:** kreator yuklagan tasvirlar uchun maydon darajasidagi shifrlash
  kaliti (`ENCRYPTION_KEY`) qo‘llaniladi.

## Xavfsiz fayl saqlash
- Fayllar to‘g‘ridan-to‘g‘ri S3 ga **presigned URL** orqali yuklanadi.
- Yuklash MIME-turi va hajmi serverda tekshiriladi.
- Har bir fayl uchun `SHA-256` yaxlitlik isboti saqlanadi.

## Audit log
- `AuditLog` modeli barcha muhim amallarni yozadi: kim, nima, qachon, qaysi IP.
- Dalillar bilan bog‘liq amallar maxsus kuzatiladi (huquqiy zanjir uchun).

## Ma'lumotlar yaxlitligi va huquqiy kuch
- Tasvir va dalillar uchun ishonchli **vaqt tamg‘asi** (timestamp).
- Dalillar append-only — o‘zgartirilmaydi, faqat qo‘shiladi.

## Eng yaxshi amaliyotlar
- Kirish validatsiyasi: `class-validator` + global `ValidationPipe` (whitelist).
- Rate limiting va brute-force himoyasi (produksiyada).
- Sirlarni `.env` orqali boshqarish; repozitoriyaga hech qachon qo‘shilmaydi.
- Eng kam imtiyoz (least privilege) tamoyili IAM va DB rollarida.
