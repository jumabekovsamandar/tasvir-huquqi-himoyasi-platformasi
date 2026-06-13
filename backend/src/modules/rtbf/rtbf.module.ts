import {
  Body,
  Controller,
  Get,
  Module,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

class CreateRtbfDto {
  @IsString()
  @IsUrl()
  targetUrl: string;
}

@ApiTags('rtbf')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rtbf')
class RtbfController {
  constructor(private prisma: PrismaService) {}

  /** Unutilish huquqi: havola yuborish — tizim talabnomani tayyorlaydi. */
  @Post()
  submit(@CurrentUser() user: AuthUser, @Body() dto: CreateRtbfDto) {
    const provider = this.detectProvider(dto.targetUrl);
    return this.prisma.rtbfRequest.create({
      data: {
        userId: user.id,
        targetUrl: dto.targetUrl,
        provider,
        status: 'DRAFTED',
        progress: 30,
      },
    });
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.rtbfRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  private detectProvider(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }
}

@Module({ controllers: [RtbfController] })
export class RtbfModule {}
