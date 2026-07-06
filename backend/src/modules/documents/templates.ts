import { DocumentType } from '@prisma/client';

export type TemplateContext = {
  caseNumber: string;
  senderName: string;
  senderEmail: string;
  recipientName?: string;
  platform: string;
  infringingUrl?: string;
  registryCode?: string;
  imageTitle?: string;
  discoveredAt: string;
  publishedAt?: string;
  description: string;
  hadConsent: boolean;
  consentDetails?: string;
  commercialUse: boolean;
  damageDescription?: string;
  evidenceLines: string[];
  today: string;
};

export const DOCUMENT_TITLES: Record<DocumentType, string> = {
  PLATFORM_COMPLAINT: 'Platformaga shikoyat',
  TAKEDOWN_REQUEST: 'Kontentni olib tashlash talabi',
  FORMAL_NOTICE: 'Rasmiy ogohlantirish xati',
  EVIDENCE_SUMMARY: 'Dalillar xulosasi',
  LAWYER_BRIEF: 'Advokat uchun ish xulosasi',
};

export const LEGAL_DISCLAIMER =
  'Ushbu hujjat ImageRights.uz platformasi yordamida foydalanuvchi taqdim etgan ' +
  'ma’lumotlar asosida avtomatik shakllantirilgan qoralama bo‘lib, yuborishdan oldin ' +
  'mazmunini tekshirish va zarur hollarda malakali yurist bilan maslahatlashish tavsiya etiladi.';

function consentBlock(ctx: TemplateContext): string {
  if (ctx.hadConsent) {
    return (
      `Tasvirdan foydalanishga dastlab rozilik berilgan, biroq joriy foydalanish ` +
      `kelishuv doirasidan chetga chiqqan. Tafsilotlar: ${ctx.consentDetails ?? 'ko‘rsatilmagan'}.`
    );
  }
  return (
    `Tasvir egasi mazkur foydalanishga rozilik bermagan. O‘zbekiston Respublikasi ` +
    `Fuqarolik kodeksining fuqaro tasviridan foydalanish uchun uning roziligi talab ` +
    `etilishi to‘g‘risidagi qoidalariga ko‘ra, bunday foydalanish huquqbuzarlik ` +
    `alomatlariga ega bo‘lishi mumkin.`
  );
}

function commercialBlock(ctx: TemplateContext): string {
  return ctx.commercialUse
    ? 'Tasvirdan tijorat maqsadida (reklama, marketing yoki daromad olish bilan bog‘liq faoliyatda) foydalanilgan.'
    : 'Foydalanish notijorat xarakterga ega deb baholanmoqda.';
}

function evidenceBlock(ctx: TemplateContext): string {
  if (!ctx.evidenceLines.length) return 'Dalillar hisobotga biriktirilgan.';
  return ctx.evidenceLines.map((l, i) => `${i + 1}. ${l}`).join('\n');
}

function factsBlock(ctx: TemplateContext): string {
  const lines = [
    `— Ish raqami: ${ctx.caseNumber}`,
    ctx.registryCode
      ? `— Himoyalangan tasvir: "${ctx.imageTitle}" (ichki reyestr kodi: ${ctx.registryCode})`
      : null,
    ctx.infringingUrl ? `— Huquqbuzar manba: ${ctx.infringingUrl}` : null,
    `— Platforma: ${ctx.platform}`,
    ctx.publishedAt ? `— E’lon qilingan sana: ${ctx.publishedAt}` : null,
    `— Aniqlangan sana: ${ctx.discoveredAt}`,
  ].filter(Boolean);
  return lines.join('\n');
}

export function renderTemplate(type: DocumentType, ctx: TemplateContext): string {
  switch (type) {
    case 'PLATFORM_COMPLAINT':
      return `${ctx.recipientName ?? '[Platforma nomi]'} ma’muriyatiga

SHIKOYAT
tasvirdan ruxsatsiz foydalanish to‘g‘risida

Sana: ${ctx.today}
Yuboruvchi: ${ctx.senderName} (${ctx.senderEmail})

Hurmatli platforma ma’muriyati,

Men, ${ctx.senderName}, sizning platformangizda mening tasvirimdan (fotosuratimdan) ruxsatsiz foydalanilganligi haqida xabar beraman.

HOLAT TAFSILOTLARI:
${factsBlock(ctx)}

VOQEA TAVSIFI:
${ctx.description}

ROZILIK HOLATI:
${consentBlock(ctx)}

${commercialBlock(ctx)}

DALILLAR:
${evidenceBlock(ctx)}

TALAB:
Yuqoridagilarni inobatga olib, ko‘rsatilgan kontentni platformangiz qoidalari va amaldagi qonunchilikka muvofiq ko‘rib chiqishingizni hamda uni olib tashlashingizni so‘rayman.

Javobingizni ${ctx.senderEmail} manziliga yuborishingizni so‘rayman.

Hurmat bilan,
${ctx.senderName}

---
${LEGAL_DISCLAIMER}`;

    case 'TAKEDOWN_REQUEST':
      return `${ctx.recipientName ?? '[Qabul qiluvchi]'}ga

KONTENTNI OLIB TASHLASH TALABI

Sana: ${ctx.today}
Talab yuboruvchi: ${ctx.senderName} (${ctx.senderEmail})

Ushbu xat orqali quyidagi manzilda joylashtirilgan kontent mening tasvirga bo‘lgan huquqlarimni buzayotganligini ma’lum qilaman va uni zudlik bilan olib tashlashni talab qilaman.

HOLAT TAFSILOTLARI:
${factsBlock(ctx)}

ASOSLANTIRISH:
${ctx.description}

${consentBlock(ctx)}

${commercialBlock(ctx)}

DALILLAR:
${evidenceBlock(ctx)}

TALAB:
1. Ko‘rsatilgan kontentni 7 (yetti) ish kuni ichida olib tashlash;
2. Kontent olib tashlangani haqida ${ctx.senderEmail} manziliga xabar berish.

Talab bajarilmagan taqdirda, huquqlarimni himoya qilish uchun qonunchilikda nazarda tutilgan boshqa vositalarga, shu jumladan sudga murojaat qilish huquqimni o‘zimda saqlab qolaman.

Hurmat bilan,
${ctx.senderName}

---
${LEGAL_DISCLAIMER}`;

    case 'FORMAL_NOTICE':
      return `${ctx.recipientName ?? '[Qabul qiluvchi]'}ga

RASMIY OGOHLANTIRISH XATI
tasvir huquqlari buzilishi to‘g‘risida

Sana: ${ctx.today}
Yuboruvchi: ${ctx.senderName} (${ctx.senderEmail})

Ushbu xat bilan sizni quyidagi holat yuzasidan rasman ogohlantiraman.

HOLAT TAFSILOTLARI:
${factsBlock(ctx)}

VOQEA TAVSIFI:
${ctx.description}

HUQUQIY ASOS:
${consentBlock(ctx)}

${commercialBlock(ctx)}

${ctx.damageDescription ? `YETKAZILGAN ZARAR:\n${ctx.damageDescription}\n` : ''}
DALILLAR:
${evidenceBlock(ctx)}

TALAB:
1. Tasvirdan foydalanishni zudlik bilan to‘xtatish;
2. Joylashtirilgan kontentni olib tashlash;
3. Ushbu xatga 10 (o‘n) kun ichida yozma javob berish.

Ushbu talablar bajarilmagan taqdirda, masalani sudgacha hal qilish tartibida yoki sud orqali hal qilish choralarini ko‘rishga majbur bo‘laman.

Hurmat bilan,
${ctx.senderName}

---
${LEGAL_DISCLAIMER}`;

    case 'EVIDENCE_SUMMARY':
      return `DALILLAR XULOSASI

Ish raqami: ${ctx.caseNumber}
Tuzilgan sana: ${ctx.today}
Tuzuvchi: ${ctx.senderName}

ISH HAQIDA QISQACHA:
${factsBlock(ctx)}

VOQEA TAVSIFI:
${ctx.description}

ROZILIK HOLATI:
${consentBlock(ctx)}

${commercialBlock(ctx)}

${ctx.damageDescription ? `ZARAR TAVSIFI:\n${ctx.damageDescription}\n` : ''}
TO‘PLANGAN DALILLAR RO‘YXATI:
${evidenceBlock(ctx)}

Ushbu xulosa ImageRights.uz dalillar omboridagi yozuvlar asosida tuzildi. Har bir fayl dalil sifatida SHA-256 nazorat yig‘indisi va vaqt tamg‘asi bilan saqlanadi.

---
${LEGAL_DISCLAIMER}`;

    case 'LAWYER_BRIEF':
      return `ADVOKAT UCHUN ISH XULOSASI

Ish raqami: ${ctx.caseNumber}
Tayyorlangan sana: ${ctx.today}
Mijoz: ${ctx.senderName} (${ctx.senderEmail})

1. ISH MOHIYATI:
${ctx.description}

2. ASOSIY FAKTLAR:
${factsBlock(ctx)}

3. ROZILIK HOLATI:
${consentBlock(ctx)}

4. TIJORAT FOYDALANISH:
${commercialBlock(ctx)}

5. YETKAZILGAN ZARAR:
${ctx.damageDescription ?? 'Mijoz tomonidan ko‘rsatilmagan.'}

6. DALILLAR:
${evidenceBlock(ctx)}

7. KEYINGI QADAMLAR UCHUN SAVOLLAR:
— Rozilik holatini tasdiqlovchi qo‘shimcha hujjatlar mavjudmi?
— Huquqbuzar taraf bilan oldin muloqot bo‘lganmi?
— Sudgacha tartibda hal qilish istagi bormi?

---
${LEGAL_DISCLAIMER}`;
  }
}
