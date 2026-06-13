import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConsentType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

class CreateConsentDto {
  @IsString() imageId: string;
  @IsString() partyName: string;
  @IsEnum(ConsentType) type: ConsentType;
  @IsOptional() @IsBoolean() commercial?: boolean;
  @IsOptional() @IsISO8601() expiresAt?: string;
  @IsOptional() @IsString() terms?: string;
}

@ApiTags('consent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consent')
class ConsentController {
  constructor(private prisma: PrismaService) {}

  /** Foydalanishga rozilik berish (yoki tijorat litsenziyasi). */
  @Post()
  grant(@CurrentUser() user: AuthUser, @Body() dto: CreateConsentDto) {
    return this.prisma.consent.create({
      data: {
        userId: user.id,
        imageId: dto.imageId,
        partyName: dto.partyName,
        type: dto.type,
        commercial: dto.commercial ?? false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        terms: dto.terms,
        status: 'ACTIVE',
      },
    });
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.consent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Rozilikni taqiqlash. */
  @Patch(':id/deny')
  deny(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.consent.updateMany({
      where: { id, userId: user.id },
      data: { status: 'DENIED' },
    });
  }

  /** Rozilikni bekor qilish. */
  @Patch(':id/revoke')
  revoke(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.consent.updateMany({
      where: { id, userId: user.id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });
  }
}

@Module({ controllers: [ConsentController] })
export class ConsentModule {}
