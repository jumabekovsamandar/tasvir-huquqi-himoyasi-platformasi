# API spetsifikatsiyasi — ImageRights.uz

Barcha endpointlar `/api` prefiksi bilan. Interaktiv hujjat: `/api/docs` (Swagger).
Himoyalangan endpointlar `Authorization: Bearer <token>` talab qiladi.

## Auth
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/auth/register` | Email/parol orqali ro‘yxatdan o‘tish |
| POST | `/api/auth/login` | Kirish, JWT token olish |
| GET | `/api/auth/google` | Google OAuth oqimini boshlash (redirect) |
| GET | `/api/auth/google/callback` | Google callback — token bilan frontendga qaytaradi |
| GET | `/api/auth/oneid` | OneID OAuth oqimini boshlash (redirect) |
| GET | `/api/auth/oneid/callback` | OneID callback — token bilan frontendga qaytaradi |
| GET | `/api/users/me` | Joriy profil va obuna |

> OAuth callback `${CORS_ORIGIN}/auth/callback?token=<JWT>` manziliga qaytaradi;
> frontend tokenni saqlab, dashboardga yo‘naltiradi.

## Xavfsiz fayl saqlash (`/api/storage`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/storage/upload-url` | AWS S3 ga yuklash uchun presigned PUT URL |
| GET | `/api/storage/download-url?key=` | Faylni ko‘rish uchun presigned GET URL |

> Fayllar brauzerdan to‘g‘ridan-to‘g‘ri S3 ga shifrlangan holda yuklanadi
> (`ServerSideEncryption: AES256`); maxfiy kalitlar mijozga oshkor qilinmaydi.

## Tasvir reyestri (`/api/images`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/images` | Tasvirni reyestrga kiritish (vaqt tamg‘asi) |
| GET | `/api/images` | Mening tasvirlarim |
| GET | `/api/images/:id` | Bitta tasvir |

## Rozilik (`/api/consent`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/consent` | Rozilik/litsenziya berish |
| GET | `/api/consent` | Roziliklar ro‘yxati |
| PATCH | `/api/consent/:id/deny` | Taqiqlash |
| PATCH | `/api/consent/:id/revoke` | Bekor qilish |

## Deepfake (`/api/deepfake`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/deepfake/scan` | Tahlilni ishga tushirish (+dalil saqlash) |
| GET | `/api/deepfake` | Tahlillar tarixi |

## Monitoring (`/api/monitoring`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/monitoring/jobs` | Monitoring vazifasini yoqish |
| GET | `/api/monitoring/jobs` | Vazifalar va nusxalar |
| GET | `/api/monitoring/matches` | Topilgan barcha nusxalar |
| PATCH | `/api/monitoring/matches/:id` | Nusxa holatini yangilash |

## Dalillar (`/api/evidence`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| GET | `/api/evidence` | Elektron dalillar |
| GET | `/api/evidence/:id` | Dalil tafsiloti |

## AI yuridik yordamchi (`/api/legal`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/legal/generate` | Huquqiy hujjat yaratish |
| GET | `/api/legal` | Mening hujjatlarim |
| PATCH | `/api/legal/:id/send` | Hujjatni yuborilgan deb belgilash |

> `ANTHROPIC_API_KEY` sozlanganda hujjatlar Claude (`claude-opus-4-8`) modeli
> bilan yaratiladi; aks holda shablon zaxirasi ishlatiladi. Deepfake tahlili
> `AI_DEEPFAKE_ENDPOINT` ga ulanadi, sozlanmaganda evristik zaxiraga o‘tadi.

## Unutilish huquqi (`/api/rtbf`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/rtbf` | Havola yuborish (talabnoma tayyorlash) |
| GET | `/api/rtbf` | So‘rovlar holati |

## Litsenziya bozori (`/api/marketplace`)
| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | `/api/marketplace/listings` | E'lon joylash |
| GET | `/api/marketplace/listings` | Faol e'lonlar |
| POST | `/api/marketplace/deals` | Litsenziya sotib olish |
| GET | `/api/marketplace/deals` | Mening bitimlarim |
| POST | `/api/marketplace/deals/:id/sign` | Elektron shartnomani imzolash |

## Xatolik formati
```json
{ "statusCode": 401, "message": "Login yoki parol noto‘g‘ri", "error": "Unauthorized" }
```
