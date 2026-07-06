import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AIAnalysisKind, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../core/audit/audit.service';
import type { AuthUser } from '../../common/current-user.decorator';
import type { RequestMeta } from '../../common/request-meta';

export const AI_DISCLAIMER =
  'Ushbu tahlil axborot xarakteriga ega va professional yuridik maslahat o‘rnini bosmaydi.';

/**
 * AI yordamchisi uchun qat'iy chegaralar: natija kafolatlamaydi,
 * qonun yoki sud ishlarini to‘qib chiqarmaydi, advokat emas.
 */
const SYSTEM_PROMPT = `Sen ImageRights.uz platformasining yordamchi tahlilchisisan. Vazifang — foydalanuvchining tasvir huquqlari buzilishi haqidagi hisobotini tartibga solishga yordam berish.

QAT'IY QOIDALAR:
- Sen advokat emassan va yuridik maslahat bermaysan; faqat axborot xarakteridagi tahlil berasan.
- Hech qachon natija yoki sud qarorini kafolatlama.
- Mavjud bo‘lmagan qonun, modda raqami yoki sud ishini hech qachon to‘qib chiqarma. Agar aniq norma bilmasang, umumiy tarzda "O‘zbekiston Respublikasi qonunchiligi" deb yoz va foydalanuvchiga advokat bilan aniqlashtirishni tavsiya qil.
- Faqat foydalanuvchi taqdim etgan faktlarga tayanib ishla; yetishmayotgan ma'lumotni fakt sifatida taxmin qilma.
- Javobni o‘zbek tilida (lotin yozuvida), aniq va tushunarli tuzilmada yoz.
- Javob oxirida hech qanday imzo yoki disclaimer qo‘shma — u tizim tomonidan avtomatik qo‘shiladi.`;

const KIND_PROMPTS: Record<AIAnalysisKind, string> = {
  CASE_SUMMARY:
    'Quyidagi hisobot faktlarini tartibga sol va qisqacha xulosalab ber: nima sodir bo‘lgan, qachon, qayerda, kim ishtirok etgan. Tuzilma: 1) Qisqacha xulosa, 2) Asosiy faktlar xronologiyasi, 3) E\'tibor talab qiladigan jihatlar.',
  RISK_ASSESSMENT:
    'Quyidagi hisobot asosida dastlabki baholash tayyorla: qaysi omillar foydalanuvchi pozitsiyasini kuchaytiradi, qaysilari zaiflashtiradi, dalillar qanchalik to‘liq. Har bir xulosani foydalanuvchi taqdim etgan faktga bog‘la. Tuzilma: 1) Kuchli tomonlar, 2) Zaif tomonlar, 3) Dalillar holati, 4) Tavsiya etiladigan keyingi qadamlar.',
  MISSING_INFO:
    'Quyidagi hisobotda qanday muhim ma\'lumot yoki dalil yetishmayotganini aniqla. Har bir band uchun nima uchun kerakligini va uni qanday olish mumkinligini tushuntir.',
  LAWYER_QUESTIONS:
    'Foydalanuvchi advokat bilan uchrashuvga tayyorlanmoqda. Quyidagi hisobot asosida advokatga berish uchun eng muhim savollar ro‘yxatini tuz va uchrashuvga qanday hujjatlar olib borish kerakligini ayt.',
  DOCUMENT_DRAFT:
    'Quyidagi hisobot asosida huquqbuzarlikni to‘xtatish talabining qoralama matnini tayyorla (rasmiy uslub, yumshoq lekin qat\'iy ohang). Qoralama foydalanuvchi tomonidan tahrirlanadi va tasdiqlashsiz hech qayerga yuborilmaydi.',
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: Anthropic | null = null;
  private readonly model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {
    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  status() {
    return { configured: this.client !== null, disclaimer: AI_DISCLAIMER };
  }

  async listAnalyses(user: AuthUser, caseId?: string) {
    if (caseId) {
      await this.requireCaseAccess(user, caseId);
      return this.prisma.aIAnalysis.findMany({
        where: { caseId },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.aIAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async analyze(
    user: AuthUser,
    caseId: string,
    kind: AIAnalysisKind,
    extraContext: string | undefined,
    meta: RequestMeta,
  ) {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'AI yordamchisi hozircha sozlanmagan. Administratsiya ANTHROPIC_API_KEY kalitini o‘rnatishi kerak.',
      );
    }
    const found = await this.requireCaseAccess(user, caseId);
    const input = this.buildCaseContext(found, extraContext);

    let outputText: string;
    try {
      const response = await this.client.messages.create({
        model: this.model,
        // Qisqa tuzilmali tahlillar uchun yetarli chegara
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `${KIND_PROMPTS[kind]}\n\n=== HISOBOT MA'LUMOTLARI ===\n${input}`,
          },
        ],
      });
      const block = response.content.find((b) => b.type === 'text');
      if (!block || block.type !== 'text' || !block.text.trim()) {
        throw new Error('AI javobida matn topilmadi');
      }
      outputText = block.text.trim();
    } catch (err) {
      this.logger.error('AI tahlili muvaffaqiyatsiz tugadi', err as Error);
      throw new ServiceUnavailableException(
        'AI tahlilini hozir bajarib bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.',
      );
    }

    const output = `${outputText}\n\n---\n${AI_DISCLAIMER}`;
    const analysis = await this.prisma.aIAnalysis.create({
      data: {
        userId: user.id,
        caseId,
        kind,
        output,
        model: this.model,
      },
    });
    await this.audit.log({
      userId: user.id,
      action: 'AI_ANALYSIS_CREATED',
      entityType: 'AIAnalysis',
      entityId: analysis.id,
      metadata: { kind, caseId },
      ...meta,
    });
    return analysis;
  }

  private buildCaseContext(
    found: Awaited<ReturnType<AiService['requireCaseAccess']>>,
    extraContext?: string,
  ): string {
    const r = found.report;
    const lines = [
      `Ish raqami: ${found.caseNumber}`,
      `Holat: ${r.status}`,
      `Platforma: ${r.platform}${r.platformOther ? ` (${r.platformOther})` : ''}`,
      r.infringingUrl ? `Huquqbuzar URL: ${r.infringingUrl}` : null,
      r.protectedImage
        ? `Himoyalangan tasvir: "${r.protectedImage.title}" (reyestr: ${r.protectedImage.registryCode})`
        : 'Himoyalangan tasvir reyestrda ro‘yxatdan o‘tkazilmagan',
      `Aniqlangan sana: ${r.discoveredAt.toISOString().slice(0, 10)}`,
      r.publishedAt
        ? `E'lon qilingan sana: ${r.publishedAt.toISOString().slice(0, 10)}`
        : null,
      `Rozilik berilganmi: ${r.hadConsent ? 'Ha' : 'Yo‘q'}`,
      r.consentDetails ? `Rozilik tafsilotlari: ${r.consentDetails}` : null,
      `Tijorat maqsadida foydalanish: ${r.commercialUse ? 'Ha' : 'Yo‘q'}`,
      `Tavsif: ${r.description}`,
      r.damageDescription ? `Zarar tavsifi: ${r.damageDescription}` : null,
      `Dalillar soni: ${r.evidence.length}`,
      ...r.evidence.map(
        (e, i) =>
          `Dalil ${i + 1}: ${e.kind === 'URL' ? `URL — ${e.url}` : `Fayl — ${e.originalFilename ?? e.type}`}${e.description ? ` (${e.description})` : ''}`,
      ),
      extraContext ? `Qo‘shimcha kontekst: ${extraContext}` : null,
    ];
    return lines.filter(Boolean).join('\n');
  }

  private async requireCaseAccess(user: AuthUser, caseId: string) {
    const found = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        report: {
          include: {
            protectedImage: { select: { title: true, registryCode: true } },
            evidence: {
              select: {
                kind: true,
                type: true,
                url: true,
                originalFilename: true,
                description: true,
              },
            },
          },
        },
      },
    });
    if (!found) throw new NotFoundException('Ish topilmadi');
    const ok =
      found.report.reporterId === user.id ||
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.LAWYER && found.assignedLawyerId === user.id);
    if (!ok) throw new NotFoundException('Ish topilmadi');
    return found;
  }
}
