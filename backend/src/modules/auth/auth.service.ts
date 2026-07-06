import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../core/audit/audit.service';
import { MailService } from '../../core/mail/mail.service';
import type { RequestMeta } from '../../common/request-meta';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto';

type OAuthProfile = {
  email: string;
  fullName: string;
  provider: AuthProvider;
  oneIdPinfl?: string;
};

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 soat
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 soat

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
    private mail: MailService,
  ) {}

  /** Frontend faqat haqiqatan sozlangan OAuth provayderlarni ko‘rsatadi. */
  providers() {
    return {
      google: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
      ),
      oneid: Boolean(
        process.env.ONEID_CLIENT_ID && process.env.ONEID_CLIENT_SECRET,
      ),
    };
  }

  async register(dto: RegisterDto, meta: RequestMeta) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Bu email allaqachon ro‘yxatdan o‘tgan');
    }

    const asLawyer = dto.role === 'LAWYER';
    if (asLawyer && !dto.licenseNumber?.trim()) {
      throw new BadRequestException(
        'Advokat sifatida ro‘yxatdan o‘tish uchun litsenziya raqami majburiy',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: asLawyer ? UserRole.LAWYER : UserRole.USER,
        profile: {
          create: { fullName: dto.fullName.trim(), phone: dto.phone },
        },
        ...(asLawyer
          ? {
              lawyerProfile: {
                create: {
                  licenseNumber: dto.licenseNumber!.trim(),
                  specialization: dto.specialization?.trim(),
                  verified: false,
                },
              },
            }
          : {}),
      },
      include: { profile: true, lawyerProfile: true },
    });

    await this.audit.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: user.role },
      ...meta,
    });
    await this.sendVerificationEmail(user.id, user.email);

    return this.buildSession(user.id);
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || user.deletedAt) {
      throw new UnauthorizedException('Email yoki parol noto‘g‘ri');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      await this.audit.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        ...meta,
      });
      throw new UnauthorizedException('Email yoki parol noto‘g‘ri');
    }
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Akkauntingiz bloklangan. Administratsiya bilan bog‘laning.',
      );
    }

    await this.audit.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      ...meta,
    });
    return this.buildSession(user.id);
  }

  /** Joriy sessiya foydalanuvchisi (frontend "me" chaqiruvi). */
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phone: true,
            organization: true,
            avatarUrl: true,
            locale: true,
          },
        },
        lawyerProfile: {
          select: {
            licenseNumber: true,
            specialization: true,
            experienceYears: true,
            bio: true,
            verified: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  // ─── Parolni tiklash ───────────────────────────────────────

  async forgotPassword(email: string, meta: RequestMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    // Email bazada bor-yo‘qligini oshkor qilmaymiz — javob doim bir xil
    if (user && user.isActive && !user.deletedAt) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: this.hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });
      const resetUrl = `${this.appBase()}/auth/reset-password?token=${token}`;
      await this.mail.sendPasswordReset(user.email, resetUrl);
      await this.audit.log({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'User',
        entityId: user.id,
        ...meta,
      });
    }
    return {
      message:
        'Agar bu email ro‘yxatdan o‘tgan bo‘lsa, parolni tiklash havolasi yuborildi.',
    };
  }

  async resetPassword(dto: ResetPasswordDto, meta: RequestMeta) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(dto.token) },
      include: { user: true },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Havola eskirgan yoki noto‘g‘ri. Qaytadan so‘rov yuboring.',
      );
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
    await this.audit.log({
      userId: record.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: record.userId,
      ...meta,
    });
    return { message: 'Parol muvaffaqiyatli yangilandi. Endi tizimga kiring.' };
  }

  // ─── Email tasdiqlash ──────────────────────────────────────

  async sendVerificationEmail(userId: string, email: string) {
    const token = randomBytes(32).toString('hex');
    await this.prisma.emailVerifyToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
      },
    });
    const verifyUrl = `${this.appBase()}/auth/verify-email?token=${token}`;
    await this.mail.sendEmailVerification(email, verifyUrl);
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.emailVerified) {
      return { message: 'Email allaqachon tasdiqlangan.' };
    }
    await this.sendVerificationEmail(user.id, user.email);
    return { message: 'Tasdiqlash havolasi yuborildi.' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerifyToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Havola eskirgan yoki noto‘g‘ri.');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerifyToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
    return { message: 'Email muvaffaqiyatli tasdiqlandi.' };
  }

  // ─── Google OAuth ──────────────────────────────────────────

  getGoogleAuthUrl(): string {
    this.requireProvider('google');
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${this.apiBase()}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleGoogleCallback(code: string) {
    this.requireProvider('google');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${this.apiBase()}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException('Google token almashinuvi muvaffaqiyatsiz');
    }
    const { access_token } = (await tokenRes.json()) as {
      access_token: string;
    };

    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    if (!userRes.ok) {
      throw new UnauthorizedException('Google profilini olishda xatolik');
    }
    const profile = (await userRes.json()) as {
      email?: string;
      name?: string;
    };
    if (!profile.email) {
      throw new UnauthorizedException('Google profilida email topilmadi');
    }

    return this.findOrCreateOAuthUser({
      email: profile.email,
      fullName: profile.name ?? profile.email,
      provider: 'GOOGLE',
    });
  }

  // ─── OneID (sso.egov.uz) OAuth ─────────────────────────────

  getOneIdAuthUrl(): string {
    this.requireProvider('oneid');
    const params = new URLSearchParams({
      client_id: process.env.ONEID_CLIENT_ID!,
      redirect_uri:
        process.env.ONEID_REDIRECT_URI ??
        `${this.apiBase()}/api/auth/oneid/callback`,
      response_type: 'code',
      scope: 'openid',
    });
    return `https://sso.egov.uz/sso/oauth/Authorization.do?${params}`;
  }

  async handleOneIdCallback(code: string) {
    this.requireProvider('oneid');
    const redirectUri =
      process.env.ONEID_REDIRECT_URI ??
      `${this.apiBase()}/api/auth/oneid/callback`;
    const tokenRes = await fetch(
      'https://sso.egov.uz/sso/oauth/Authorization.do',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'one_authorization_code',
          client_id: process.env.ONEID_CLIENT_ID!,
          client_secret: process.env.ONEID_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          code,
        }),
      },
    );
    if (!tokenRes.ok) {
      throw new UnauthorizedException('OneID token almashinuvi muvaffaqiyatsiz');
    }
    const { access_token } = (await tokenRes.json()) as {
      access_token: string;
    };

    const userRes = await fetch(
      'https://sso.egov.uz/sso/oauth/Authorization.do',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'one_access_token_identify',
          client_id: process.env.ONEID_CLIENT_ID!,
          client_secret: process.env.ONEID_CLIENT_SECRET!,
          access_token,
          scope: 'openid',
        }),
      },
    );
    if (!userRes.ok) {
      throw new UnauthorizedException('OneID profilini olishda xatolik');
    }
    const profile = (await userRes.json()) as {
      email?: string;
      pin?: string;
      sur_name?: string;
      first_name?: string;
      full_name?: string;
    };
    const fullName = [profile.sur_name, profile.first_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return this.findOrCreateOAuthUser({
      email: profile.email ?? `${profile.pin}@oneid.uz`,
      fullName: fullName || profile.full_name || 'OneID foydalanuvchi',
      provider: 'ONEID',
      oneIdPinfl: profile.pin,
    });
  }

  // ─── Yordamchilar ──────────────────────────────────────────

  private async findOrCreateOAuthUser(profile: OAuthProfile) {
    const email = profile.email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (!user.isActive || user.deletedAt)) {
      throw new UnauthorizedException('Akkauntingiz bloklangan.');
    }
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          provider: profile.provider,
          oneIdPinfl: profile.oneIdPinfl,
          emailVerified: true,
          profile: { create: { fullName: profile.fullName } },
        },
      });
      await this.audit.log({
        userId: user.id,
        action: 'USER_REGISTERED_OAUTH',
        entityType: 'User',
        entityId: user.id,
        metadata: { provider: profile.provider },
      });
    }
    return this.buildSession(user.id);
  }

  private async buildSession(userId: string) {
    const user = await this.me(userId);
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private requireProvider(name: 'google' | 'oneid') {
    if (!this.providers()[name]) {
      throw new BadRequestException(
        `${name === 'google' ? 'Google' : 'OneID'} orqali kirish hozircha sozlanmagan`,
      );
    }
  }

  private apiBase() {
    return process.env.API_BASE_URL ?? 'http://localhost:4000';
  }

  private appBase() {
    return process.env.APP_BASE_URL ?? 'http://localhost:3000';
  }
}
