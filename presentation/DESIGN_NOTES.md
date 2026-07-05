# DESIGN_NOTES — ImageRights.uz BMI himoyasi taqdimoti

12 slaydlik bitiruv malakaviy ishi himoyasi taqdimoti:
**“Tasvirga bo‘lgan huquqni fuqarolik-huquqiy tartibga solish va himoya qilish masalalari”**
Muallif: Jumabekov Samandar · TDYU, Fuqarolik huquqi sho‘basi · 2026

---

## 1. Dizayn tizimi

**Konsepsiya.** Premium LegalTech / Image Rights vizual tili: raqamli identifikatsiya,
yuzni tanish (facial recognition mesh), rozilik va huquqiy himoya motivlari.
An’anaviy yuridik klishelar (tarozi, bolg‘acha, ustunlar) ataylab ishlatilmagan.

**Format.** 16:9 (13.333 × 7.5 dyuym), 1920×1080 sifat, katta auditoriya ekrani uchun
masofadan o‘qiladigan ierarxiya.

**Yagona imzo-motiv.** Delaunay triangulyatsiyasi asosida generativ tarzda chizilgan
**yuz landmark-mesh** grafikasi (ko‘z, qosh, burun, lab, yuz oval nuqtalari):

- Slayd 1 — skanerlash ramkasi + scan-line bilan (identifikatsiya);
- Slayd 6 — o‘ng yarmi “buzilgan” (qizil kanal siljishi, tasodifiy displacement) —
  autentik → manipulyatsiya qilingan tasvir (deepfake) o‘tishi;
- Slayd 2 — kichik aksent sifatida.

Stok fotosuratlar ishlatilmadi: barcha vizuallar deck uchun maxsus generatsiya qilingan
(hech qanday begona shaxs tasviri ishlatilmagan — bu tasvir huquqlari mavzusidagi ish
uchun mazmunan ham to‘g‘ri qaror).

## 2. Ranglar

Platformaning o‘z Tailwind palitrasidan olingan (frontend/tailwind.config.ts):

| Rol | Rang |
|---|---|
| Deep navy fon | `#0B1220` → `#0F172A` gradient |
| Karta (dark) | `#162240` / chegara `#2B3A63` |
| Elektrik ko‘k aksent | `#3366FF` (brand-500), `#598DFF` (brand-400) |
| Ochiq fon | `#F9FBFE` → `#EDF1F9`, karta `#FFFFFF` |
| Semantik aksentlar | yashil `#34D399` (rozilik/natija), qizil `#FF6B81` (xavf/deepfake), amber (ogohlantirish) — faqat ma’no talab qilganda |

Qorong‘i (cover, muammo, deepfake, tezkor himoya, yechim, yakun) va yoruq (tahliliy,
huquqiy-doktrinal slaydlar) fonlar dramaturgiyaga mos almashinadi.

## 3. Tipografika

Barchasi O‘zbek lotin belgilari (oʻ/gʻ uchun U+2018 ‘) to‘liq qo‘llab-quvvatlaydi:

- **Montserrat ExtraBold / Black** — slayd sarlavhalari va katta bayonotlar;
- **Montserrat (Bold) / SemiBold** — karta sarlavhalari;
- **Inter / Inter Medium / Inter SemiBold** — matn, izohlar;
- **Space Grotesk** — raqamlar, HUD-yorliqlar, kicker-teglar (texnologik ohang).

Ierarxiya: 1 asosiy xabar + 3–6 qisqa tayanch punkt; uzun paragraf yo‘q.

## 4. Vizual mantiq (bayon qurilishi)

HUQUQIY MUAMMO → ILMIY TAHLIL → QONUNCHILIK BO‘SHLIG‘I → TAKLIFLAR → IMAGERIGHTS.UZ

| # | Slayd | Layout turi | Tezisdagi manba |
|---|---|---|---|
| 1 | Muqova | full-bleed hero + mesh | Titul varaq |
| 2 | Markaziy muammo | split: savol + 2×2 muammo kartalari | Kirish, 1.1–1.3 |
| 3 | Huquqiy bo‘shliq | qarama-qarshi ikki karta + “LEKIN” | 1.2, 2.1 (FK 99-modda, “qonunchilik lakunasi”) |
| 4 | Huquqiy tabiat | 3 tugunli konsept-diagramma | 1.1–1.2 (nomoddiy ne’mat, dualistik model, droit à l’image) |
| 5 | Qiyosiy tajriba | 5 karta + xulosa lentasi | 1.3, 2.1 (Fransiya, Germaniya/KUG, Polsha, Rossiya FK 152¹, GDPR) |
| 6 | AI / deepfake | glitch-mesh + savollar | 1.3 (Sensity AI 96%, +550%, GAN, platforma javobgarligi) |
| 7 | Asosiy taklif | 6 komponentli norma-karkas | Xulosa (yangi modda: ta’rif, rozilik, istisnolar, tijorat, videokuzatuv, himoya) |
| 8 | Rozilik modeli | qoida/istisno + formulalar | Xulosa (4-6-qismlar), 2.2 (Koryog‘diyev: rozilik doirasi) |
| 9 | Tezkor himoya | 5 bosqichli jarayon + virallik | 2.2, Xulosa (référé, FPKga shoshilinch tartib) |
| 10 | O‘tish / yechim | formula + katta reveal + mockup | Amaliy natija |
| 11 | Platforma ishlashi | oqim + taklif→modul mapping + skrinshotlar | Platforma modullari (repo) + tezis takliflari |
| 12 | Uch natija | 3 ustun + yakuniy formula | Xulosa |

## 5. Platforma skrinshotlari

`frontend/` (Next.js) ilova lokal ishga tushirilib, real sahifalar Playwright bilan
2× retina sifatida suratga olindi va brauzer-mockup ramkalariga joylandi:
Boshqaruv paneli (slayd 10), Rozilik boshqaruvi va Deepfake aniqlash (slayd 11).

**Pozitsiyalash:** platforma hamma joyda *prototip* deb ataladi; foydalanuvchi soni,
aniqlik foizi kabi tekshirilmagan da’volar deckka kiritilmadi; “sud/advokat o‘rnini
bosmaydi” disklameri slayd 11da berilgan.

## 6. Qayta yig‘ish (reproducibility)

`presentation/src/` ichida:

- `gen_assets.py` — yuz-mesh grafikalari (numpy + scipy Delaunay + Pillow);
- `gen_backgrounds.py` — fon gradientlari va to‘rlar;
- `gen_mockups.py` — skrinshot → brauzer mockup;
- `deck.py` — 12 slaydni python-pptx bilan quradi.

Barcha diagramma, karta, sarlavhalar PPTXda tahrirlanadigan obyektlar sifatida qolgan
(faqat mesh-grafika, fon va skrinshotlar rastr).
