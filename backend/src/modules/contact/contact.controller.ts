import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

class ContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @Matches(/^\+?[0-9\s-]{7,20}$/, { message: 'Telefon raqami noto‘g‘ri formatda' })
  phone?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  /** Maxfiylik siyosatiga rozilik majburiy */
  @IsBoolean()
  @Equals(true, { message: 'Maxfiylik siyosatiga rozilik berilishi shart' })
  privacyConsent: boolean;
}

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private prisma: PrismaService) {}

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post()
  async submit(@Body() dto: ContactDto) {
    await this.prisma.contactSubmission.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        subject: dto.subject.trim(),
        message: dto.message.trim(),
      },
    });
    return {
      message: 'Murojaatingiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.',
    };
  }
}
