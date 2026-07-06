import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { requestMeta } from '../../common/request-meta';
import { EvidenceService } from './evidence.service';
import { AddUrlEvidenceDto, UploadEvidenceDto } from './dto';

@ApiTags('evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidence: EvidenceService) {}

  @Post('upload')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 22 * 1024 * 1024 } }))
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadEvidenceDto,
    @Req() req: Request,
  ) {
    return this.evidence.uploadFile(user, file, dto, requestMeta(req));
  }

  @Post('url')
  addUrl(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddUrlEvidenceDto,
    @Req() req: Request,
  ) {
    return this.evidence.addUrl(user, dto, requestMeta(req));
  }

  @Get('mine')
  listMine(@CurrentUser() user: AuthUser) {
    return this.evidence.listMine(user);
  }

  @Get(':id/download')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { evidence, download } = await this.evidence.download(user, id);
    if (download.redirectUrl) return res.redirect(download.redirectUrl);
    res.setHeader('Content-Type', evidence.mimeType ?? 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="evidence-${evidence.id}.${(evidence.mimeType ?? '').includes('pdf') ? 'pdf' : 'img'}"`,
    );
    res.setHeader('Cache-Control', 'private, no-store');
    return download.stream!.pipe(res);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    return this.evidence.remove(user, id, requestMeta(req));
  }
}
