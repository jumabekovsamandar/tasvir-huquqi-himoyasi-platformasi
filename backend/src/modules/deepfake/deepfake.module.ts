import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeepfakeVerdict } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { randomBytes } from 'crypto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

class ScanDto {
  @IsString() sourceKey: string;
  @IsString() mediaType: string; // image | video
  @IsOptional() @IsString() imageId?: string;
}

/**
 * Deepfake aniqlash AI servisi.
 * Ishlab chiqarishda AI_DEEPFAKE_ENDPOINT ga so‘rov yuboriladi;
 * bu yerda integratsiya uchun deterministik mock baholash beriladi.
 */
@Injectable()
class DeepfakeAiService {
  async analyze(sourceKey: string, mediaType: string) {
    // TODO: real model inference (AI_DEEPFAKE_ENDPOINT)
    const faceSwapScore = this.pseudoScore(sourceKey + 'face');
    const montageScore = this.pseudoScore(sourceKey + 'montage');
    const aiGeneratedScore = this.pseudoScore(sourceKey + 'ai');
    const metadataScore = this.pseudoScore(sourceKey + 'meta');
    const confidence = Math.round(
      Math.max(faceSwapScore, aiGeneratedScore) * 0.6 +
        montageScore * 0.25 +
        metadataScore * 0.15,
    );
    let verdict: DeepfakeVerdict = 'AUTHENTIC';
    if (confidence >= 75) verdict = 'FAKE';
    else if (confidence >= 45) verdict = 'SUSPICIOUS';

    return {
      verdict,
      confidence,
      faceSwapScore,
      montageScore,
      aiGeneratedScore,
      metadataScore,
      mediaType,
    };
  }

  private pseudoScore(seed: string): number {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 1000;
    return Math.round((h / 1000) * 100);
  }
}

@ApiTags('deepfake')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deepfake')
class DeepfakeController {
  constructor(
    private prisma: PrismaService,
    private ai: DeepfakeAiService,
  ) {}

  /** Yangi deepfake tahlilini ishga tushirish va natijani dalil sifatida saqlash. */
  @Post('scan')
  async scan(@CurrentUser() user: AuthUser, @Body() dto: ScanDto) {
    const result = await this.ai.analyze(dto.sourceKey, dto.mediaType);

    const scan = await this.prisma.deepfakeScan.create({
      data: {
        userId: user.id,
        imageId: dto.imageId,
        sourceKey: dto.sourceKey,
        ...result,
      },
    });

    // Tahlil natijasi avtomatik elektron dalil sifatida saqlanadi.
    await this.prisma.evidence.create({
      data: {
        userId: user.id,
        code: `EV-${new Date().getFullYear()}-${randomBytes(2).toString('hex')}`,
        type: 'DEEPFAKE_REPORT',
        scanId: scan.id,
        imageId: dto.imageId,
        sha256: randomBytes(16).toString('hex'),
        metadata: result as object,
      },
    });

    return scan;
  }

  @Get()
  history(@CurrentUser() user: AuthUser) {
    return this.prisma.deepfakeScan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}

@Module({
  controllers: [DeepfakeController],
  providers: [DeepfakeAiService],
})
export class DeepfakeModule {}
