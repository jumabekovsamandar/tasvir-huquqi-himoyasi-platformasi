import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LegalDocType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import Anthropic from '@anthropic-ai/sdk';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

class GenerateDto {
  @IsEnum(LegalDocType) type: LegalDocType;
  @IsOptional() @IsString() recipient?: string;
  @IsOptional() @IsString() infringementUrl?: string;
  @IsOptional() @IsString() evidenceCode?: string;
}

const TITLES: Record<LegalDocType, string> = {
  WARNING_LETTER: 'Ogohlantirish xati',
  TAKEDOWN_REQUEST: 'Tasvirni olib tashlash talabi',
  PRETRIAL_CLAIM: 'Sudgacha talabnoma',
  LAWSUIT: 'Da’vo arizasi',
};

const DOC_LABEL: Record<LegalDocType, string> = {
  WARNING_LETTER: 'ogohlantirish xati',
  TAKEDOWN_REQUEST: 'tasvirni olib tashlash talabi',
  PRETRIAL_CLAIM: 'sudgacha talabnoma',
  LAWSUIT: 'da’vo arizasi',
};

/**
 * AI yuridik yordamchi — elektron dalillar asosida huquqiy hujjatlarni
 * shakllantiradi. ANTHROPIC_API_KEY sozlanganda Claude modeliga ulanadi;
 * aks holda shablon asosida matn yaratiladi.
 */
@Injectable()
class LegalAiService {
  private readonly anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic()
    : null;

  async generate(dto: GenerateDto): Promise<string> {
    if (this.anthropic) {
      try {
        return await this.generateWithClaude(dto);
      } catch {
        // API xatosi — quyidagi shablon zaxirasiga o‘tamiz.
      }
    }
    return this.template(dto);
  }

  private async generateWithClaude(dto: GenerateDto): Promise<string> {
    const url = dto.infringementUrl ?? '[huquqbuzarlik havolasi]';
    const ev = dto.evidenceCode ?? '[dalil kodi]';
    const to = dto.recipient ?? '[manzil egasi]';

    const system =
      'Siz O‘zbekiston Respublikasi qonunchiligiga ixtisoslashgan yuridik yordamchisiz. ' +
      'Tasvir huquqlari va shaxsiy ma\'lumotlar himoyasi bo‘yicha rasmiy, professional va ' +
      'huquqiy kuchga ega hujjatlarni o‘zbek tilida tayyorlaysiz. Faqat hujjat matnini ' +
      'qaytaring, qo‘shimcha izohsiz.';

    const message = await this.anthropic!.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      system,
      messages: [
        {
          role: 'user',
          content:
            `Quyidagi turdagi huquqiy hujjatni tayyorlang: ${DOC_LABEL[dto.type]}.\n` +
            `Manzil egasi: ${to}\n` +
            `Huquqbuzarlik havolasi: ${url}\n` +
            `Elektron dalil kodi: ${ev}\n` +
            `Holat: foydalanuvchining tasviri uning roziligisiz ushbu manzilda joylashtirilgan. ` +
            `Hujjat rasmiy uslubda, tegishli qonun normalariga havola bilan tuzilsin.`,
        },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return text || this.template(dto);
  }

  private template(dto: GenerateDto): string {
    const today = new Date().toLocaleDateString('uz-UZ');
    const url = dto.infringementUrl ?? '[huquqbuzarlik havolasi]';
    const ev = dto.evidenceCode ?? '[dalil kodi]';
    const to = dto.recipient ?? '[manzil egasi]';

    const intro = `Hurmatli ${to},\n\nUshbu hujjat ImageRights.uz platformasi orqali ${today} sanasida shakllantirildi.`;
    const facts = `Bizning ma'lumotlarimizga ko‘ra, ${url} manzilida sizning roziligingizsiz himoyalangan tasvir joylashtirilgan. Huquqbuzarlik ${ev} kodli elektron dalil bilan tasdiqlangan.`;

    const bodies: Record<LegalDocType, string> = {
      WARNING_LETTER: `${intro}\n\n${facts}\n\nSizdan ushbu tasvirni 3 (uch) ish kuni ichida olib tashlashingizni so‘raymiz. Aks holda qonun hujjatlariga muvofiq huquqiy choralar ko‘riladi.`,
      TAKEDOWN_REQUEST: `${intro}\n\n${facts}\n\nO‘zbekiston Respublikasi qonunchiligi va platforma qoidalariga asosan, mazkur kontentni zudlik bilan o‘chirishingizni rasman talab qilamiz.`,
      PRETRIAL_CLAIM: `${intro}\n\n${facts}\n\nSudgacha tartibda yetkazilgan zararni ixtiyoriy qoplashingizni hamda huquqbuzarlikni to‘xtatishingizni talab qilamiz. Talab 10 kun ichida bajarilmasa, sudga murojaat qilinadi.`,
      LAWSUIT: `${intro}\n\n${facts}\n\nYuqoridagilarga asoslanib, sudga da'vo arizasi taqdim etiladi va tasvir huquqlarining buzilishi yuzasidan moddiy hamda ma'naviy zararni qoplash undirilishi so‘raladi.`,
    };
    return bodies[dto.type];
  }
}

@ApiTags('legal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('legal')
class LegalController {
  constructor(
    private prisma: PrismaService,
    private ai: LegalAiService,
  ) {}

  /** Tanlangan turdagi huquqiy hujjatni AI yordamida yaratish. */
  @Post('generate')
  async generate(@CurrentUser() user: AuthUser, @Body() dto: GenerateDto) {
    const content = await this.ai.generate(dto);
    return this.prisma.legalDocument.create({
      data: {
        userId: user.id,
        type: dto.type,
        title: TITLES[dto.type],
        recipient: dto.recipient,
        content,
        status: 'DRAFT',
      },
    });
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.legalDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id/send')
  send(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.legalDocument.updateMany({
      where: { id, userId: user.id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }
}

@Module({
  controllers: [LegalController],
  providers: [LegalAiService],
})
export class LegalModule {}
