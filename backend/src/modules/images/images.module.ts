import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { randomBytes } from 'crypto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

class RegisterImageDto {
  @IsString() title: string;
  @IsString() storageKey: string;
  @IsString() mimeType: string;
  @IsInt() sizeBytes: number;
  @IsString() sha256: string;
  @IsOptional() @IsString() perceptualHash?: string;
}

@ApiTags('images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('images')
class ImagesController {
  constructor(private prisma: PrismaService) {}

  /** Tasvir huquqi reyestriga yangi tasvirni vaqt tamg‘asi bilan kiritish. */
  @Post()
  async register(@CurrentUser() user: AuthUser, @Body() dto: RegisterImageDto) {
    const registryCode = `IR-${randomBytes(3).toString('hex').toUpperCase()}`;
    return this.prisma.image.create({
      data: {
        ownerId: user.id,
        title: dto.title,
        storageKey: dto.storageKey,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        sha256: dto.sha256,
        perceptualHash: dto.perceptualHash,
        registryCode,
        status: 'PENDING',
      },
    });
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.image.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.image.findFirst({ where: { id, ownerId: user.id } });
  }
}

@Module({ controllers: [ImagesController] })
export class ImagesModule {}
