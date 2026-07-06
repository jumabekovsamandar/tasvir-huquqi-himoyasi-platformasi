import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

const PLATFORMS = [
  'INSTAGRAM',
  'FACEBOOK',
  'TELEGRAM',
  'YOUTUBE',
  'TIKTOK',
  'WEBSITE',
  'PRESS',
  'ADVERTISING',
  'OTHER',
] as const;

export class CreateViolationDto {
  @IsOptional()
  @IsUUID()
  protectedImageId?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'URL noto‘g‘ri formatda' })
  @MaxLength(2000)
  infringingUrl?: string;

  @IsIn(PLATFORMS)
  platform: (typeof PLATFORMS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(160)
  platformOther?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsDateString()
  discoveredAt: string;

  @IsString()
  @MinLength(20, {
    message: 'Tavsif kamida 20 belgidan iborat bo‘lishi kerak',
  })
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsBoolean()
  hadConsent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  consentDetails?: string;

  @IsOptional()
  @IsBoolean()
  commercialUse?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  damageDescription?: string;
}

export class UpdateViolationDto {
  @IsOptional()
  @IsUUID()
  protectedImageId?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'URL noto‘g‘ri formatda' })
  @MaxLength(2000)
  infringingUrl?: string;

  @IsOptional()
  @IsIn(PLATFORMS)
  platform?: (typeof PLATFORMS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(160)
  platformOther?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  discoveredAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  hadConsent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  consentDetails?: string;

  @IsOptional()
  @IsBoolean()
  commercialUse?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  damageDescription?: string;
}
