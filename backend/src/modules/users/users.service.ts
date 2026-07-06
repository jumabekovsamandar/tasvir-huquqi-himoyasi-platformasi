import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../core/audit/audit.service';
import type { RequestMeta } from '../../common/request-meta';
import { DeleteAccountDto, UpdateLawyerProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.organization !== undefined
          ? { organization: dto.organization }
          : {}),
      },
      select: { fullName: true, phone: true, organization: true, locale: true },
    });
  }

  async updateLawyerProfile(userId: string, dto: UpdateLawyerProfileDto) {
    const existing = await this.prisma.lawyerProfile.findUnique({
      where: { userId },
    });
    if (!existing) {
      throw new ForbiddenException('Advokat profili mavjud emas');
    }
    // Diqqat: verified maydonini faqat admin o‘zgartira oladi
    return this.prisma.lawyerProfile.update({
      where: { userId },
      data: {
        specialization: dto.specialization,
        experienceYears: dto.experienceYears,
        bio: dto.bio,
      },
      select: {
        licenseNumber: true,
        specialization: true,
        experienceYears: true,
        bio: true,
        verified: true,
      },
    });
  }

  /** Foydalanuvchining barcha shaxsiy ma'lumotlarini JSON ko‘rinishida qaytaradi. */
  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        profile: true,
        lawyerProfile: true,
        images: true,
        reports: { include: { evidence: true, case: true } },
        documents: true,
        notifications: true,
        aiAnalyses: true,
      },
    });
    if (!user) throw new NotFoundException();
    return { exportedAt: new Date().toISOString(), data: user };
  }

  /**
   * Akkauntni o‘chirish: soft delete + shaxsiy ma'lumotlarni
   * anonimlashtirish. Ishlar (cases) huquqiy arxiv sifatida saqlanadi,
   * lekin foydalanuvchiga bog‘lanmaydi.
   */
  async deleteAccount(userId: string, dto: DeleteAccountDto, meta: RequestMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (user.passwordHash) {
      const ok =
        dto.password && (await bcrypt.compare(dto.password, user.passwordHash));
      if (!ok) {
        throw new UnauthorizedException('Parol noto‘g‘ri');
      }
    }

    const anonymizedEmail = `deleted-${userId}@removed.imagerights.uz`;
    await this.prisma.$transaction([
      this.prisma.profile.updateMany({
        where: { userId },
        data: {
          fullName: 'O‘chirilgan foydalanuvchi',
          phone: null,
          organization: null,
          avatarUrl: null,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          email: anonymizedEmail,
          passwordHash: null,
          oneIdPinfl: null,
          isActive: false,
          deletedAt: new Date(),
        },
      }),
    ]);

    await this.audit.log({
      userId,
      action: 'ACCOUNT_DELETED',
      entityType: 'User',
      entityId: userId,
      ...meta,
    });
    return { message: 'Akkauntingiz o‘chirildi.' };
  }
}
