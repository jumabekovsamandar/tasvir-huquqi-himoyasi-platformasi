import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const toBool = ({ value }: { value: unknown }) =>
  value === true || value === 'true';

const toTags = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) return value.map(String).slice(0, 15);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 15);
  }
  return [];
};

export class RegisterImageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  ownershipNote?: string;

  @IsOptional()
  @IsDateString()
  capturedAt?: string;

  @IsOptional()
  @IsDateString()
  firstPublishedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  publicationSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  consentRestrictions?: string;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  commercialUseAllowed?: boolean;

  @IsOptional()
  @Transform(toTags)
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsIn(['PRIVATE', 'RESTRICTED'])
  privacyLevel?: 'PRIVATE' | 'RESTRICTED';
}

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  ownershipNote?: string;

  @IsOptional()
  @IsDateString()
  capturedAt?: string;

  @IsOptional()
  @IsDateString()
  firstPublishedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  publicationSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  consentRestrictions?: string;

  @IsOptional()
  @IsBoolean()
  commercialUseAllowed?: boolean;

  @IsOptional()
  @Transform(toTags)
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsIn(['PRIVATE', 'RESTRICTED'])
  privacyLevel?: 'PRIVATE' | 'RESTRICTED';
}
