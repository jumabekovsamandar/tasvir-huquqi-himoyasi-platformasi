import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, ViolationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { AuditService } from '../../core/audit/audit.service';
import type { AuthUser } from '../../common/current-user.decorator';
import type { RequestMeta } from '../../common/request-meta';
import { AddUrlEvidenceDto, UploadEvidenceDto } from './dto';

const EVIDENCE_SELECT = {
  id: true,
  reportId: true,
  kind: true,
  type: true,
  description: true,
  originalFilename: true,
  mimeType: true,
  sizeBytes: true,
  sha256: true,
  url: true,
  createdAt: true,
} as const;

@Injectable()
export class EvidenceService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private audit: AuditService,
  ) {}

  async uploadFile(
    user: AuthUser,
    file: Express.Multer.File,
    dto: UploadEvidenceDto,
    meta: RequestMeta,
  ) {
    const report = await this.requireReportForUpload(user, dto.reportId);
    const stored = await this.storage.store(
      file,
      'evidence',
      `evidence/${report.id}`,
    );
    const evidence = await this.prisma.evidence.create({
      data: {
        uploaderId: user.id,
        reportId: report.id,
        kind: 'FILE',
        type: dto.type,
        description: dto.description,
        // Asl fayl nomi faqat ma'lumot sifatida saqlanadi — diskdagi nom
        // serverda yaratilgan xavfsiz nom
        originalFilename: file.originalname?.slice(0, 255),
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        sha256: stored.sha256,
      },
      select: EVIDENCE_SELECT,
    });
    await this.audit.log({
      userId: user.id,
      action: 'EVIDENCE_UPLOADED',
      entityType: 'Evidence',
      entityId: evidence.id,
      metadata: { reportId: report.id, sha256: stored.sha256 },
      ...meta,
    });
    return evidence;
  }

  async addUrl(user: AuthUser, dto: AddUrlEvidenceDto, meta: RequestMeta) {
    const report = await this.requireReportForUpload(user, dto.reportId);
    const evidence = await this.prisma.evidence.create({
      data: {
        uploaderId: user.id,
        reportId: report.id,
        kind: 'URL',
        type: 'URL',
        url: dto.url,
        description: dto.description,
      },
      select: EVIDENCE_SELECT,
    });
    await this.audit.log({
      userId: user.id,
      action: 'EVIDENCE_URL_ADDED',
      entityType: 'Evidence',
      entityId: evidence.id,
      metadata: { reportId: report.id },
      ...meta,
    });
    return evidence;
  }

  /** Foydalanuvchining barcha dalillari (dalillar ombori ko‘rinishi). */
  async listMine(user: AuthUser) {
    return this.prisma.evidence.findMany({
      where: { uploaderId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        ...EVIDENCE_SELECT,
        report: {
          select: {
            id: true,
            description: true,
            status: true,
            case: { select: { id: true, caseNumber: true } },
          },
        },
      },
    });
  }

  async download(user: AuthUser, id: string) {
    const evidence = await this.requireAccessible(user, id);
    if (evidence.kind !== 'FILE' || !evidence.storageKey) {
      throw new BadRequestException('Bu dalil fayl emas');
    }
    const download = await this.storage.getDownload(
      evidence.storageKey,
      evidence.mimeType ?? 'application/octet-stream',
    );
    await this.audit.log({
      userId: user.id,
      action: 'EVIDENCE_DOWNLOADED',
      entityType: 'Evidence',
      entityId: id,
    });
    return { evidence, download };
  }

  /** Dalil faqat DRAFT hisobotdan o‘chirilishi mumkin (yaxlitlikni saqlash). */
  async remove(user: AuthUser, id: string, meta: RequestMeta) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id },
      include: { report: { select: { reporterId: true, status: true } } },
    });
    if (!evidence || evidence.uploaderId !== user.id) {
      throw new NotFoundException('Dalil topilmadi');
    }
    if (evidence.report.status !== ViolationStatus.DRAFT) {
      throw new BadRequestException(
        'Yuborilgan hisobot dalillarini o‘chirish mumkin emas',
      );
    }
    if (evidence.storageKey) {
      await this.storage.delete(evidence.storageKey);
    }
    await this.prisma.evidence.delete({ where: { id } });
    await this.audit.log({
      userId: user.id,
      action: 'EVIDENCE_DELETED',
      entityType: 'Evidence',
      entityId: id,
      ...meta,
    });
    return { message: 'Dalil o‘chirildi' };
  }

  /** Yuklash huquqi: hisobot egasi (DRAFT/ACTION_REQUIRED holatlarda) yoki biriktirilgan advokat/admin. */
  private async requireReportForUpload(user: AuthUser, reportId: string) {
    const report = await this.prisma.violationReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        reporterId: true,
        status: true,
        case: { select: { assignedLawyerId: true } },
      },
    });
    if (!report) throw new NotFoundException('Hisobot topilmadi');

    const isOwner = report.reporterId === user.id;
    const isManager =
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.LAWYER &&
        report.case?.assignedLawyerId === user.id);
    if (!isOwner && !isManager) {
      throw new NotFoundException('Hisobot topilmadi');
    }
    if (report.status === ViolationStatus.CLOSED) {
      throw new BadRequestException('Yopilgan ishga dalil qo‘shib bo‘lmaydi');
    }
    return report;
  }

  private async requireAccessible(user: AuthUser, id: string) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id },
      include: {
        report: {
          select: {
            reporterId: true,
            case: { select: { assignedLawyerId: true } },
          },
        },
      },
    });
    if (!evidence) throw new NotFoundException('Dalil topilmadi');
    const ok =
      evidence.report.reporterId === user.id ||
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.LAWYER &&
        evidence.report.case?.assignedLawyerId === user.id);
    if (!ok) throw new NotFoundException('Dalil topilmadi');
    return evidence;
  }
}
