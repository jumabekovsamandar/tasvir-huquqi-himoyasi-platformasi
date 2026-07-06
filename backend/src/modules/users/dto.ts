import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @Matches(/^\+?[0-9\s-]{7,20}$/, { message: 'Telefon raqami noto‘g‘ri formatda' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;
}

export class UpdateLawyerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  specialization?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(70)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;
}

export class DeleteAccountDto {
  /** Tasdiqlash uchun foydalanuvchi paroli (OAuth akkauntlarda ixtiyoriy). */
  @IsOptional()
  @IsString()
  password?: string;
}
