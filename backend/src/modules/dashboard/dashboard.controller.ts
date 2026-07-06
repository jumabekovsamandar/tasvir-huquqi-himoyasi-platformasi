import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/** Rolga mos, real bazadan olinadigan boshqaruv paneli statistikasi. */
@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('overview')
  async overview(@CurrentUser() user: AuthUser) {
    if (user.role === UserRole.LAWYER) {
      return this.lawyerOverview(user.id);
    }
    return this.userOverview(user.id);
  }

  private async userOverview(userId: string) {
    const [images, drafts, openReports, activeCases, resolvedCases, recentActivity] =
      await Promise.all([
        this.prisma.protectedImage.count({
          where: { ownerId: userId, state: 'ACTIVE' },
        }),
        this.prisma.violationReport.count({
          where: { reporterId: userId, status: 'DRAFT' },
        }),
        this.prisma.violationReport.count({
          where: {
            reporterId: userId,
            status: { notIn: ['DRAFT', 'RESOLVED', 'CLOSED'] },
          },
        }),
        this.prisma.case.count({
          where: {
            report: {
              reporterId: userId,
              status: { notIn: ['RESOLVED', 'CLOSED'] },
            },
          },
        }),
        this.prisma.case.count({
          where: {
            report: { reporterId: userId, status: { in: ['RESOLVED', 'CLOSED'] } },
          },
        }),
        this.prisma.auditLog.findMany({
          where: {
            userId,
            action: {
              in: [
                'IMAGE_REGISTERED',
                'VIOLATION_SUBMITTED',
                'DOCUMENT_GENERATED',
                'DOCUMENT_FINALIZED',
                'EVIDENCE_UPLOADED',
                'AI_ANALYSIS_CREATED',
              ],
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: { action: true, entityType: true, entityId: true, createdAt: true },
        }),
      ]);
    return { role: 'USER', images, drafts, openReports, activeCases, resolvedCases, recentActivity };
  }

  private async lawyerOverview(lawyerId: string) {
    const [assigned, needReview, resolved, unreadMessages] = await Promise.all([
      this.prisma.case.count({
        where: {
          assignedLawyerId: lawyerId,
          report: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
        },
      }),
      this.prisma.case.count({
        where: {
          assignedLawyerId: lawyerId,
          report: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'LAWYER_REVIEW'] } },
        },
      }),
      this.prisma.case.count({
        where: {
          assignedLawyerId: lawyerId,
          report: { status: { in: ['RESOLVED', 'CLOSED'] } },
        },
      }),
      this.prisma.notification.count({
        where: { userId: lawyerId, readAt: null },
      }),
    ]);
    return { role: 'LAWYER', assigned, needReview, resolved, unreadMessages };
  }
}
