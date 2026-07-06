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
import type { AuthUser } from '../../common/current-user.decorator';
import type { RequestMeta } from '../../common/request-meta';
import { AddMessageDto, AddNoteDto, ChangeStatusDto, RequestInfoDto } from './dto';

/** Ruxsat etilgan holat o‘tishlari — tasodifiy sakrashlarning oldini oladi. */
const TRANSITIONS: Record<ViolationStatus, ViolationStatus[]> = {
  DRAFT: [],
  SUBMITTED: ['UNDER_REVIEW', 'CLOSED'],
  UNDER_REVIEW: [
    'ACTION_REQUIRED',
    'NOTICE_PREPARED',
    'LAWYER_REVIEW',
    'RESOLVED',
    'CLOSED',
  ],
  ACTION_REQUIRED: ['UNDER_REVIEW', 'LAWYER_REVIEW', 'CLOSED'],
  NOTICE_PREPARED: ['LAWYER_REVIEW', 'RESOLVED', 'CLOSED'],
  LAWYER_REVIEW: ['NOTICE_PREPARED', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

const STATUS_LABELS: Record<ViolationStatus, string> = {
  DRAFT: 'Qoralama',
  SUBMITTED: 'Yuborildi',
  UNDER_REVIEW: 'Ko‘rib chiqilmoqda',
  ACTION_REQUIRED: 'Ma’lumot talab qilinadi',
  NOTICE_PREPARED: 'Talabnoma tayyorlandi',
  LAWYER_REVIEW: 'Advokat ko‘rigida',
  RESOLVED: 'Hal qilindi',
  CLOSED: 'Yopildi',
};

type CaseWithAccess = {
  id: string;
  caseNumber: string;
  assignedLawyerId: string | null;
  report: { id: string; reporterId: string; status: ViolationStatus };
};

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  /** Rolga qarab: USER → o‘z ishlari, LAWYER → biriktirilganlar, ADMIN → hammasi. */
  async list(user: AuthUser, status?: string) {
    const statusFilter = Object.values(ViolationStatus).includes(
      status as ViolationStatus,
    )
      ? (status as ViolationStatus)
      : undefined;

    const reportFilter: { reporterId?: string; status?: ViolationStatus } = {};
    if (user.role === UserRole.USER) reportFilter.reporterId = user.id;
    if (statusFilter) reportFilter.status = statusFilter;

    return this.prisma.case.findMany({
      where: {
        ...(user.role === UserRole.LAWYER ? { assignedLawyerId: user.id } : {}),
        ...(Object.keys(reportFilter).length ? { report: reportFilter } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        report: {
          select: {
            id: true,
            status: true,
            platform: true,
            infringingUrl: true,
            description: true,
            reporterId: true,
            reporter: {
              select: { profile: { select: { fullName: true } } },
            },
            protectedImage: { select: { title: true, registryCode: true } },
            _count: { select: { evidence: true } },
          },
        },
        assignedLawyer: {
          select: { id: true, profile: { select: { fullName: true } } },
        },
        _count: { select: { documents: true, messages: true } },
      },
    });
  }

  async getOne(user: AuthUser, id: string) {
    const found = await this.prisma.case.findUnique({
      where: { id },
      include: {
        report: {
          include: {
            reporter: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, phone: true } },
              },
            },
            protectedImage: {
              select: { id: true, title: true, registryCode: true, sha256: true },
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
        },
        assignedLawyer: {
          select: {
            id: true,
            profile: { select: { fullName: true } },
            lawyerProfile: { select: { specialization: true, verified: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: { select: { profile: { select: { fullName: true } }, role: true } },
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        aiAnalyses: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, kind: true, output: true, model: true, createdAt: true },
        },
      },
    });
    if (!found) throw new NotFoundException('Ish topilmadi');
    this.requireParticipant(user, {
      id: found.id,
      caseNumber: found.caseNumber,
      assignedLawyerId: found.assignedLawyerId,
      report: {
        id: found.report.id,
        reporterId: found.report.reporterId,
        status: found.report.status,
      },
    });
    return { ...found, statusLabel: STATUS_LABELS[found.report.status] };
  }

  /** Holatni o‘zgartirish — faqat biriktirilgan advokat yoki admin. */
  async changeStatus(
    user: AuthUser,
    id: string,
    dto: ChangeStatusDto,
    meta: RequestMeta,
  ) {
    const found = await this.requireCase(id);
    this.requireManager(user, found);

    const from = found.report.status;
    const to = dto.status as ViolationStatus;
    if (!TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(
        `"${STATUS_LABELS[from]}" holatidan "${STATUS_LABELS[to]}" holatiga o‘tish mumkin emas`,
      );
    }

    await this.applyStatus(found, to, user.id, dto.note);
    await this.audit.log({
      userId: user.id,
      action: 'CASE_STATUS_CHANGED',
      entityType: 'Case',
      entityId: id,
      metadata: { from, to },
      ...meta,
    });
    return this.getOne(user, id);
  }

  /** Advokat mijozdan qo‘shimcha ma'lumot so‘raydi. */
  async requestInfo(
    user: AuthUser,
    id: string,
    dto: RequestInfoDto,
    meta: RequestMeta,
  ) {
    const found = await this.requireCase(id);
    this.requireManager(user, found);
    const from = found.report.status;
    if (!TRANSITIONS[from].includes('ACTION_REQUIRED')) {
      throw new BadRequestException(
        `Joriy holatda (${STATUS_LABELS[from]}) ma'lumot so‘rab bo‘lmaydi`,
      );
    }

    await this.prisma.caseMessage.create({
      data: { caseId: id, authorId: user.id, body: dto.message },
    });
    await this.applyStatus(found, 'ACTION_REQUIRED', user.id, 'Qo‘shimcha ma’lumot so‘raldi');
    await this.notifications.notify(
      found.report.reporterId,
      'INFO_REQUESTED',
      `${found.caseNumber}: qo‘shimcha ma’lumot so‘raldi`,
      dto.message.slice(0, 200),
      `/dashboard/cases/${id}`,
    );
    await this.audit.log({
      userId: user.id,
      action: 'CASE_INFO_REQUESTED',
      entityType: 'Case',
      entityId: id,
      ...meta,
    });
    return this.getOne(user, id);
  }

  /** Mijoz so‘ralgan ma'lumotni taqdim etganini bildiradi. */
  async provideInfo(user: AuthUser, id: string, dto: AddMessageDto) {
    const found = await this.requireCase(id);
    if (found.report.reporterId !== user.id) {
      throw new NotFoundException('Ish topilmadi');
    }
    if (found.report.status !== 'ACTION_REQUIRED') {
      throw new BadRequestException('Hozir ma’lumot taqdim etish talab qilinmagan');
    }
    await this.prisma.caseMessage.create({
      data: { caseId: id, authorId: user.id, body: dto.body },
    });
    await this.applyStatus(found, 'UNDER_REVIEW', user.id, 'Mijoz ma’lumot taqdim etdi');
    if (found.assignedLawyerId) {
      await this.notifications.notify(
        found.assignedLawyerId,
        'STATUS_CHANGED',
        `${found.caseNumber}: mijoz ma’lumot taqdim etdi`,
        undefined,
        `/lawyer/cases/${id}`,
      );
    }
    return this.getOne(user, id);
  }

  // ─── Ichki eslatmalar (mijozga ko‘rinmaydi) ────────────────

  async listNotes(user: AuthUser, id: string) {
    const found = await this.requireCase(id);
    this.requireManager(user, found);
    return this.prisma.caseNote.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { profile: { select: { fullName: true } }, role: true } },
      },
    });
  }

  async addNote(user: AuthUser, id: string, dto: AddNoteDto) {
    const found = await this.requireCase(id);
    this.requireManager(user, found);
    return this.prisma.caseNote.create({
      data: { caseId: id, authorId: user.id, body: dto.body },
      include: {
        author: { select: { profile: { select: { fullName: true } }, role: true } },
      },
    });
  }

  // ─── Mijoz ↔ advokat yozishmalari ──────────────────────────

  async listMessages(user: AuthUser, id: string) {
    const found = await this.requireCase(id);
    this.requireParticipant(user, found);
    return this.prisma.caseMessage.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, role: true, profile: { select: { fullName: true } } },
        },
      },
    });
  }

  async addMessage(user: AuthUser, id: string, dto: AddMessageDto) {
    const found = await this.requireCase(id);
    this.requireParticipant(user, found);
    if (['CLOSED'].includes(found.report.status)) {
      throw new BadRequestException('Yopilgan ishga xabar yozib bo‘lmaydi');
    }
    const message = await this.prisma.caseMessage.create({
      data: { caseId: id, authorId: user.id, body: dto.body },
      include: {
        author: {
          select: { id: true, role: true, profile: { select: { fullName: true } } },
        },
      },
    });
    // Qarama-qarshi tomonga bildirishnoma
    const recipientId =
      user.id === found.report.reporterId
        ? found.assignedLawyerId
        : found.report.reporterId;
    if (recipientId) {
      await this.notifications.notify(
        recipientId,
        'STATUS_CHANGED',
        `${found.caseNumber}: yangi xabar`,
        dto.body.slice(0, 200),
        recipientId === found.report.reporterId
          ? `/dashboard/cases/${id}`
          : `/lawyer/cases/${id}`,
      );
    }
    return message;
  }

  // ─── Yordamchilar ──────────────────────────────────────────

  private async applyStatus(
    found: CaseWithAccess,
    to: ViolationStatus,
    changedById: string,
    note?: string,
  ) {
    await this.prisma.$transaction([
      this.prisma.violationReport.update({
        where: { id: found.report.id },
        data: { status: to },
      }),
      this.prisma.caseStatusHistory.create({
        data: {
          caseId: found.id,
          fromStatus: found.report.status,
          toStatus: to,
          changedById,
          note,
        },
      }),
      this.prisma.case.update({
        where: { id: found.id },
        data: { updatedAt: new Date() },
      }),
    ]);
    if (changedById !== found.report.reporterId) {
      await this.notifications.notify(
        found.report.reporterId,
        'STATUS_CHANGED',
        `${found.caseNumber}: holat yangilandi — ${STATUS_LABELS[to]}`,
        note,
        `/dashboard/cases/${found.id}`,
      );
    }
  }

  private async requireCase(id: string): Promise<CaseWithAccess> {
    const found = await this.prisma.case.findUnique({
      where: { id },
      select: {
        id: true,
        caseNumber: true,
        assignedLawyerId: true,
        report: { select: { id: true, reporterId: true, status: true } },
      },
    });
    if (!found) throw new NotFoundException('Ish topilmadi');
    return found;
  }

  /** Ishtirokchi: hisobot egasi, biriktirilgan advokat yoki admin. */
  private requireParticipant(user: AuthUser, found: CaseWithAccess) {
    const ok =
      found.report.reporterId === user.id ||
      found.assignedLawyerId === user.id ||
      user.role === UserRole.ADMIN;
    if (!ok) throw new NotFoundException('Ish topilmadi');
  }

  /** Boshqaruvchi: biriktirilgan advokat yoki admin. */
  private requireManager(user: AuthUser, found: CaseWithAccess) {
    const ok =
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.LAWYER && found.assignedLawyerId === user.id);
    if (!ok) {
      throw new ForbiddenException('Bu amal uchun ruxsatingiz yo‘q');
    }
  }
}
