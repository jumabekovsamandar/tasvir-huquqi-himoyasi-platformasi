import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';

export const FILE_EVIDENCE_TYPES = [
  'SCREENSHOT',
  'ORIGINAL_IMAGE',
  'PDF_DOCUMENT',
  'CORRESPONDENCE',
  'OTHER',
] as const;

export class UploadEvidenceDto {
  @IsUUID()
  reportId: string;

  @IsIn(FILE_EVIDENCE_TYPES)
  type: (typeof FILE_EVIDENCE_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class AddUrlEvidenceDto {
  @IsUUID()
  reportId: string;

  @IsUrl({ require_protocol: true }, { message: 'URL noto‘g‘ri formatda' })
  @MaxLength(2000)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
