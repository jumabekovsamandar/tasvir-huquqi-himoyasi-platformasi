import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContactStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../core/audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthUser } from '../../common/current-user.decorator';
import type { RequestMeta } from '../../common/request-meta';

const PAGE_SIZE = 20;

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  async overview() {
    const [users, lawyers, pendingLawyers, images, reports, openCases, contacts] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { role: 'LAWYER', deletedAt: null } }),
        this.prisma.lawyerProfile.count({ where: { verified: false } }),
        this.prisma.protectedImage.count(),
        this.prisma.violationReport.count({ where: { status: { not: 'DRAFT' } } }),
        this.prisma.violationReport.count({
          where: { status: { notIn: ['DRAFT', 'RESOLVED', 'CLOSED'] } },
        }),
        this.prisma.contactSubmission.count({ where: { status: 'NEW' } }),
      ]);
    return { users, lawyers, pendingLawyers, images, reports, openCases, contacts };
  }

  // ─── Foydalanuvchilar ──────────────────────────────────────

  async listUsers(page = 1, role?: string, search?: string) {
    const where: Prisma.UserWhereInput = {
      ...(Object.values(UserRole).includes(role as UserRole)
        ? { role: role as UserRole }
        : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              {
                profile: {
                  fullName: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          email: true,
          role: true,
          emailVerified: true,
          isActive: true,
          deletedAt: true,
          createdAt: true,
          profile: { select: { fullName: true, phone: true } },
          lawyerProfile: {
            select: { licenseNumber: true, specialization: true, verified: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async setUserActive(
    admin: AuthUser,
    userId: string,
    isActive: boolean,
    meta: RequestMeta,
  ) {
    if (userId === admin.id) {
      throw new BadRequestException('O‘z akkauntingizni bloklab bo‘lmaydi');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('Foydalanuvchi topilmadi');
    await this.prisma.user.update({ where: { id: userId }, data: { isActive } });
    await this.audit.log({
      userId: admin.id,
      action: isActive ? 'USER_UNBLOCKED' : 'USER_BLOCKED',
      entityType: 'User',
      entityId: userId,
      ...meta,
    });
    return { message: isActive ? 'Foydalanuvchi faollashtirildi' : 'Foydalanuvchi bloklandi' };
  }

  // ─── Advokatlar ────────────────────────────────────────────

  async listLawyers(verified?: string) {
    return this.prisma.lawyerProfile.findMany({
      where:
        verified === 'true'
          ? { verified: true }
          : verified === 'false'
            ? { verified: false }
            : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            profile: { select: { fullName: true, phone: true } },
            _count: { select: { assignedCases: true } },
          },
        },
      },
    });
  }

  async verifyLawyer(admin: AuthUser, userId: string, verified: boolean, meta: RequestMeta) {
    const profile = await this.prisma.lawyerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Advokat profili topilmadi');
    await this.prisma.lawyerProfile.update({
      where: { userId },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
        verifiedById: verified ? admin.id : null,
      },
    });
    await this.audit.log({
      userId: admin.id,
      action: verified ? 'LAWYER_VERIFIED' : 'LAWYER_UNVERIFIED',
      entityType: 'LawyerProfile',
      entityId: profile.id,
      metadata: { lawyerUserId: userId },
      ...meta,
    });
    await this.notifications.notify(
      userId,
      'ADMIN_MESSAGE',
      verified
        ? 'Advokat profilingiz tasdiqlandi'
        : 'Advokat profilingiz tasdig‘i bekor qilindi',
      verified
        ? 'Endi sizga ishlar biriktirilishi mumkin.'
        : undefined,
      '/lawyer',
    );
    return { message: verified ? 'Advokat tasdiqlandi' : 'Tasdiq bekor qilindi' };
  }

  // ─── Ishlar ────────────────────────────────────────────────

  async assignLawyer(
    admin: AuthUser,
    caseId: string,
    lawyerId: string | null,
    meta: RequestMeta,
  ) {
    const found = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: { report: { select: { reporterId: true } } },
    });
    if (!found) throw new NotFoundException('Ish topilmadi');

    if (lawyerId) {
      const lawyer = await this.prisma.user.findUnique({
        where: { id: lawyerId },
        include: { lawyerProfile: true },
      });
      if (!lawyer || lawyer.role !== 'LAWYER' || !lawyer.isActive) {
        throw new BadRequestException('Advokat topilmadi yoki faol emas');
      }
      // Tasdiqlashsiz advokatga ish biriktirib bo‘lmaydi
      if (!lawyer.lawyerProfile?.verified) {
        throw new BadRequestException(
          'Faqat tasdiqlangan advokatga ish biriktirish mumkin',
        );
      }
    }

    await this.prisma.case.update({
      where: { id: caseId },
      data: { assignedLawyerId: lawyerId },
    });
    await this.audit.log({
      userId: admin.id,
      action: lawyerId ? 'CASE_LAWYER_ASSIGNED' : 'CASE_LAWYER_UNASSIGNED',
      entityType: 'Case',
      entityId: caseId,
      metadata: { lawyerId },
      ...meta,
    });
    if (lawyerId) {
      await this.notifications.notify(
        lawyerId,
        'ADMIN_MESSAGE',
        `Sizga yangi ish biriktirildi: ${found.caseNumber}`,
        undefined,
        `/lawyer/cases/${caseId}`,
      );
      await this.notifications.notify(
        found.report.reporterId,
        'STATUS_CHANGED',
        `${found.caseNumber}: ishingizga advokat biriktirildi`,
        undefined,
        `/dashboard/cases/${caseId}`,
      );
    }
    return { message: lawyerId ? 'Advokat biriktirildi' : 'Advokat biriktiruvi bekor qilindi' };
  }

  // ─── Murojaatlar ───────────────────────────────────────────

  async listContacts(status?: string) {
    return this.prisma.contactSubmission.findMany({
      where: Object.values(ContactStatus).includes(status as ContactStatus)
        ? { status: status as ContactStatus }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async setContactStatus(id: string, status: ContactStatus) {
    const found = await this.prisma.contactSubmission.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Murojaat topilmadi');
    return this.prisma.contactSubmission.update({ where: { id }, data: { status } });
  }

  // ─── Audit log ─────────────────────────────────────────────

  async listAuditLogs(page = 1, action?: string, userId?: string) {
    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action: { contains: action, mode: 'insensitive' } } : {}),
      ...(userId ? { userId } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 50,
        take: 50,
        include: {
          user: {
            select: { email: true, profile: { select: { fullName: true } } },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total, page, pageSize: 50 };
  }
}
