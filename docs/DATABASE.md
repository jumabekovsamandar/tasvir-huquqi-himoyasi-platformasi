# Ma'lumotlar bazasi sxemasi — ImageRights.uz

To‘liq sxema: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).
Ma'lumotlar bazasi — **PostgreSQL**, ORM — **Prisma**.

## Asosiy entitilar

| Model | Tavsif |
|-------|--------|
| `User` | Foydalanuvchi (fuqaro, kreator, advokat, agentlik, davlat organi, admin) |
| `Subscription` | Obuna rejasi (FREE/PROFESSIONAL/BUSINESS/ENTERPRISE) va tekshiruv limiti |
| `Image` | Reyestrga kiritilgan tasvir, vaqt tamg‘asi, SHA-256, pHash, EXIF |
| `Consent` | Foydalanish roziligi/taqiqi, tijorat litsenziyasi, muddat |
| `DeepfakeScan` | Deepfake tahlili natijasi (verdict + ishonchlilik foizi) |
| `MonitoringJob` / `MonitoringMatch` | Internet monitoring vazifasi va topilgan nusxalar |
| `Evidence` | Elektron dalil (screenshot, metadata, hisobot) — buzilmas |
| `LegalDocument` | AI yaratgan huquqiy hujjat (xat, talab, talabnoma, da'vo) |
| `RtbfRequest` | Unutilish huquqi so‘rovi va jarayon holati |
| `LicenseListing` / `LicenseDeal` | Litsenziyalash bozori e'loni va bitimi |
| `AuditLog` | Xavfsizlik audit jurnali |

## Munosabatlar (ER)

```
User 1───* Image           Image 1───* Consent
User 1───1 Subscription    Image 1───* MonitoringJob ───* MonitoringMatch
User 1───* DeepfakeScan    Image 1───* LicenseListing ──* LicenseDeal
User 1───* Evidence        DeepfakeScan 1───* Evidence
User 1───* LegalDocument   MonitoringMatch 1───* Evidence
User 1───* RtbfRequest     Evidence *───* LegalDocument
User 1───* AuditLog
```

## Muhim indekslar
- `Image.perceptualHash` — reverse image search uchun tez moslik.
- `MonitoringMatch.status`, `LicenseListing.status` — holat bo‘yicha filtr.
- `AuditLog.action`, `AuditLog.createdAt` — xavfsizlik tahlili.
- Barcha `userId`/`ownerId` ustunlari indekslangan.

## Yaxlitlik va huquqiy kuch
- Har bir `Image` va `Evidence` `sha256` va `timestampedAt` ga ega — fayl
  buzilmaganligini va sana-vaqtni isbotlaydi.
- `Evidence` yozuvlari faqat qo‘shiladi (append-only siyosati tavsiya etiladi).

## Migratsiyalar
```bash
npx prisma migrate dev --name init   # lokal ishlab chiqish
npx prisma migrate deploy            # produksiya
npx prisma generate                  # klient generatsiyasi
npm run prisma:seed                  # demo ma'lumotlar
```
