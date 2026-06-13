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
import { ConsentType } from '@prisma/client';
import { IsEnum, IsNumberString, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

class CreateListingDto {
  @IsString() imageId: string;
  @IsString() title: string;
  @IsEnum(ConsentType) licenseType: ConsentType;
  @IsNumberString() priceUzs: string;
}

class BuyDto {
  @IsString() listingId: string;
}

@ApiTags('marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketplace')
class MarketplaceController {
  constructor(private prisma: PrismaService) {}

  /** Tasvir foydalanish huquqini sotuvga qo‘yish. */
  @Post('listings')
  createListing(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    return this.prisma.licenseListing.create({
      data: {
        sellerId: user.id,
        imageId: dto.imageId,
        title: dto.title,
        licenseType: dto.licenseType,
        priceUzs: BigInt(dto.priceUzs),
        status: 'ACTIVE',
      },
    });
  }

  /** Faol e'lonlar (ochiq bozor). */
  @Get('listings')
  listings() {
    return this.prisma.licenseListing.findMany({
      where: { status: 'ACTIVE' },
      include: { seller: { select: { fullName: true } }, image: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Litsenziya sotib olish va elektron shartnoma yaratish. */
  @Post('deals')
  async buy(@CurrentUser() user: AuthUser, @Body() dto: BuyDto) {
    const listing = await this.prisma.licenseListing.findUniqueOrThrow({
      where: { id: dto.listingId },
    });
    return this.prisma.licenseDeal.create({
      data: {
        listingId: listing.id,
        buyerId: user.id,
        amountUzs: listing.priceUzs,
        status: 'PENDING_PAYMENT',
      },
    });
  }

  @Get('deals')
  myDeals(@CurrentUser() user: AuthUser) {
    return this.prisma.licenseDeal.findMany({
      where: { buyerId: user.id },
      include: { listing: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('deals/:id/sign')
  sign(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.licenseDeal.updateMany({
      where: { id, buyerId: user.id },
      data: { status: 'CONTRACT_SIGNED', signedAt: new Date() },
    });
  }
}

@Module({ controllers: [MarketplaceController] })
export class MarketplaceModule {}
