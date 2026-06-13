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

/**
 * AI yuridik yordamchi — elektron dalillar asosida huquqiy hujjatlarni
 * shakllantiradi. Ishlab chiqarishda AI_LEGAL_ASSISTANT_API_KEY orqali
 * generativ modelga ulanadi; bu yerda shablon asosida matn yaratiladi.
 */
@Injectable()
class LegalAiService {
  generate(dto: GenerateDto): string {
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
    const content = this.ai.generate(dto);
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
