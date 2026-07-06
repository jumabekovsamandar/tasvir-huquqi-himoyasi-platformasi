import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, ViolationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../core/audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { generateCaseNumber } from '../../common/codes';
import type { AuthUser } from '../../common/current-user.decorator';
import type { RequestMeta } from '../../common/request-meta';
import { CreateViolationDto, UpdateViolationDto } from './dto';

@Injectable()
export class ViolationsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  async create(user: AuthUser, dto: CreateViolationDto, meta: RequestMeta) {
    if (dto.protectedImageId) {
      await this.requireOwnImage(user.id, dto.protectedImageId);
    }
    const report = await this.prisma.violationReport.create({
      data: {
        reporterId: user.id,
        protectedImageId: dto.protectedImageId,
        infringingUrl: dto.infringingUrl,
        platform: dto.platform,
        platformOther: dto.platformOther,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        discoveredAt: new Date(dto.discoveredAt),
        description: dto.description.trim(),
        hadConsent: dto.hadConsent ?? false,
        consentDetails: dto.consentDetails,
        commercialUse: dto.commercialUse ?? false,
        damageDescription: dto.damageDescription,
        status: ViolationStatus.DRAFT,
      },
    });
    await this.audit.log({
      userId: user.id,
      action: 'VIOLATION_DRAFT_CREATED',
      entityType: 'ViolationReport',
      entityId: report.id,
      ...meta,
    });
    return report;
  }

  async update(user: AuthUser, id: string, dto: UpdateViolationDto) {
    const report = await this.requireOwnReport(user, id);
    if (report.status !== ViolationStatus.DRAFT) {
      throw new BadRequestException(
        'Yuborilgan hisobotni tahrirlash mumkin emas',
      );
    }
    if (dto.protectedImageId) {
      await this.requireOwnImage(user.id, dto.protectedImageId);
    }
    return this.prisma.violationReport.update({
      where: { id },
      data: {
        ...(dto.protectedImageId !== undefined
          ? { protectedImageId: dto.protectedImageId }
          : {}),
        infringingUrl: dto.infringingUrl,
        ...(dto.platform !== undefined ? { platform: dto.platform } : {}),
        platformOther: dto.platformOther,
        ...(dto.publishedAt !== undefined
          ? { publishedAt: new Date(dto.publishedAt) }
          : {}),
        ...(dto.discoveredAt !== undefined
          ? { discoveredAt: new Date(dto.discoveredAt) }
          : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.hadConsent !== undefined ? { hadConsent: dto.hadConsent } : {}),
        consentDetails: dto.consentDetails,
        ...(dto.commercialUse !== undefined
          ? { commercialUse: dto.commercialUse }
          : {}),
        damageDescription: dto.damageDescription,
      },
    });
  }

  /** Hisobotni yuborish: DRAFT → SUBMITTED va yuridik ish (Case) ochiladi. */
  async submit(user: AuthUser, id: string, meta: RequestMeta) {
    const report = await this.requireOwnReport(user, id);
    if (report.status !== ViolationStatus.DRAFT) {
      throw new BadRequestException('Hisobot allaqachon yuborilgan');
    }
    if (!report.infringingUrl && report.evidenceCount === 0) {
      throw new BadRequestException(
        'Yuborishdan oldin kamida bitta havola yoki dalil qo‘shing',
      );
    }

    const caseNumber = generateCaseNumber();
    const [updated] = await this.prisma.$transaction([
      this.prisma.violationReport.update({
        where: { id },
        data: {
          status: ViolationStatus.SUBMITTED,
          case: {
            create: {
              caseNumber,
              statusHistory: {
                create: {
                  fromStatus: ViolationStatus.DRAFT,
                  toStatus: ViolationStatus.SUBMITTED,
                  changedById: user.id,
                  note: 'Hisobot yuborildi',
                },
              },
            },
          },
        },
        include: { case: true },
      }),
    ]);

    await this.audit.log({
      userId: user.id,
      action: 'VIOLATION_SUBMITTED',
      entityType: 'ViolationReport',
      entityId: id,
      metadata: { caseNumber },
      ...meta,
    });
    await this.notifications.notify(
      user.id,
      'CASE_SUBMITTED',
      `Ish ochildi: ${caseNumber}`,
      'Hisobotingiz qabul qilindi va ko‘rib chiqish navbatiga qo‘yildi.',
      `/dashboard/cases/${updated.case!.id}`,
    );
    return updated;
  }

  async list(user: AuthUser, status?: string) {
    const statusFilter = Object.values(ViolationStatus).includes(
      status as ViolationStatus,
    )
      ? (status as ViolationStatus)
      : undefined;
    return this.prisma.violationReport.findMany({
      where: { reporterId: user.id, status: statusFilter },
      orderBy: { updatedAt: 'desc' },
      include: {
        protectedImage: {
          select: { id: true, title: true, registryCode: true },
        },
        case: { select: { id: true, caseNumber: true } },
        _count: { select: { evidence: true } },
      },
    });
  }

  async getOne(user: AuthUser, id: string) {
    const report = await this.prisma.violationReport.findUnique({
      where: { id },
      include: {
        protectedImage: {
          select: { id: true, title: true, registryCode: true },
        },
        case: {
          select: { id: true, caseNumber: true, assignedLawyerId: true },
        },
        evidence: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            kind: true,
            type: true,
            description: true,
            originalFilename: true,
            mimeType: true,
            sizeBytes: true,
            sha256: true,
            url: true,
            createdAt: true,
          },
        },
      },
    });
    if (!report || !this.canAccess(user, report)) {
      throw new NotFoundException('Hisobot topilmadi');
    }
    return report;
  }

  /** DRAFT hisobotni o‘chirish (yuborilganini o‘chirish mumkin emas). */
  async remove(user: AuthUser, id: string, meta: RequestMeta) {
    const report = await this.requireOwnReport(user, id);
    if (report.status !== ViolationStatus.DRAFT) {
      throw new BadRequestException(
        'Yuborilgan hisobotni o‘chirish mumkin emas — administratsiyaga murojaat qiling',
      );
    }
    await this.prisma.violationReport.delete({ where: { id } });
    await this.audit.log({
      userId: user.id,
      action: 'VIOLATION_DRAFT_DELETED',
      entityType: 'ViolationReport',
      entityId: id,
      ...meta,
    });
    return { message: 'Qoralama o‘chirildi' };
  }

  private canAccess(
    user: AuthUser,
    report: { reporterId: string; case?: { assignedLawyerId: string | null } | null },
  ): boolean {
    if (report.reporterId === user.id) return true;
    if (user.role === UserRole.ADMIN) return true;
    if (
      user.role === UserRole.LAWYER &&
      report.case?.assignedLawyerId === user.id
    ) {
      return true;
    }
    return false;
  }

  private async requireOwnReport(user: AuthUser, id: string) {
    const report = await this.prisma.violationReport.findUnique({
      where: { id },
      include: { _count: { select: { evidence: true } } },
    });
    if (!report || report.reporterId !== user.id) {
      throw new NotFoundException('Hisobot topilmadi');
    }
    return { ...report, evidenceCount: report._count.evidence };
  }

  private async requireOwnImage(userId: string, imageId: string) {
    const image = await this.prisma.protectedImage.findUnique({
      where: { id: imageId },
      select: { ownerId: true },
    });
    if (!image || image.ownerId !== userId) {
      throw new ForbiddenException(
        'Tanlangan tasvir sizning reyestringizda topilmadi',
      );
    }
  }
}
