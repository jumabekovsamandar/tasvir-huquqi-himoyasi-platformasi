import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

const DOC_TYPES = [
  'PLATFORM_COMPLAINT',
  'TAKEDOWN_REQUEST',
  'FORMAL_NOTICE',
  'EVIDENCE_SUMMARY',
  'LAWYER_BRIEF',
] as const;

export class GenerateDocumentDto {
  @IsUUID()
  caseId: string;

  @IsIn(DOC_TYPES)
  type: (typeof DOC_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  recipientContact?: string;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(30000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  recipientContact?: string;
}
