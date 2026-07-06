import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { requestMeta } from '../../common/request-meta';
import { AiService } from './ai.service';

const KINDS = [
  'CASE_SUMMARY',
  'RISK_ASSESSMENT',
  'MISSING_INFO',
  'LAWYER_QUESTIONS',
  'DOCUMENT_DRAFT',
] as const;

class AnalyzeDto {
  @IsUUID()
  caseId: string;

  @IsIn(KINDS)
  kind: (typeof KINDS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  extraContext?: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('status')
  status() {
    return this.ai.status();
  }

  @Get('analyses')
  list(@CurrentUser() user: AuthUser, @Query('caseId') caseId?: string) {
    return this.ai.listAnalyses(user, caseId);
  }

  // AI chaqiruvlari qimmat — qattiq rate limit
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('analyze')
  analyze(
    @CurrentUser() user: AuthUser,
    @Body() dto: AnalyzeDto,
    @Req() req: Request,
  ) {
    return this.ai.analyze(
      user,
      dto.caseId,
      dto.kind,
      dto.extraContext,
      requestMeta(req),
    );
  }
}
