import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Advokat/admin o‘tkaza oladigan holatlar (DRAFT va SUBMITTED tizim tomonidan boshqariladi). */
export const MANAGED_STATUSES = [
  'UNDER_REVIEW',
  'ACTION_REQUIRED',
  'NOTICE_PREPARED',
  'LAWYER_REVIEW',
  'RESOLVED',
  'CLOSED',
] as const;

export class ChangeStatusDto {
  @IsIn(MANAGED_STATUSES)
  status: (typeof MANAGED_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class AddNoteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  body: string;
}

export class AddMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body: string;
}

export class RequestInfoDto {
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}
