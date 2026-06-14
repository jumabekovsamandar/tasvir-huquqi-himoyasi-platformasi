import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

type OAuthProfile = {
  email: string;
  fullName: string;
  provider: AuthProvider;
  oneIdPinfl?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email allaqachon ro‘yxatdan o‘tgan');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        subscription: { create: { plan: 'FREE', scanLimit: 5 } },
      },
    });
    return this.issueToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user?.passwordHash)
      throw new UnauthorizedException('Login yoki parol noto‘g‘ri');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Login yoki parol noto‘g‘ri');

    return this.issueToken(user.id, user.email, user.role);
  }

  // ─── Google OAuth ──────────────────────────────────────────

  getGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      redirect_uri: `${this.apiBase()}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleGoogleCallback(code: string) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri: `${this.apiBase()}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new UnauthorizedException('Google token almashinuvi muvaffaqiyatsiz');
    const { access_token } = await tokenRes.json();

    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    if (!userRes.ok) throw new UnauthorizedException('Google profilini olishda xatolik');
    const profile = await userRes.json();

    return this.findOrCreateOAuthUser({
      email: profile.email,
      fullName: profile.name ?? profile.email,
      provider: 'GOOGLE',
    });
  }

  // ─── OneID (sso.egov.uz) OAuth ─────────────────────────────

  getOneIdAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.ONEID_CLIENT_ID ?? '',
      redirect_uri:
        process.env.ONEID_REDIRECT_URI ??
        `${this.apiBase()}/api/auth/oneid/callback`,
      response_type: 'code',
      scope: 'openid',
    });
    return `https://sso.egov.uz/sso/oauth/Authorization.do?${params}`;
  }

  async handleOneIdCallback(code: string) {
    const tokenRes = await fetch(
      'https://sso.egov.uz/sso/oauth/Authorization.do',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'one_authorization_code',
          client_id: process.env.ONEID_CLIENT_ID ?? '',
          client_secret: process.env.ONEID_CLIENT_SECRET ?? '',
          redirect_uri:
            process.env.ONEID_REDIRECT_URI ??
            `${this.apiBase()}/api/auth/oneid/callback`,
          code,
        }),
      },
    );
    if (!tokenRes.ok) throw new UnauthorizedException('OneID token almashinuvi muvaffaqiyatsiz');
    const { access_token } = await tokenRes.json();

    const userRes = await fetch(
      'https://sso.egov.uz/sso/oauth/Authorization.do',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'one_access_token_identify',
          client_id: process.env.ONEID_CLIENT_ID ?? '',
          client_secret: process.env.ONEID_CLIENT_SECRET ?? '',
          access_token,
          scope: 'openid',
        }),
      },
    );
    if (!userRes.ok) throw new UnauthorizedException('OneID profilini olishda xatolik');
    const profile = await userRes.json();
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

  // ─── Helpers ───────────────────────────────────────────────

  private async findOrCreateOAuthUser(profile: OAuthProfile) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.fullName,
          provider: profile.provider,
          oneIdPinfl: profile.oneIdPinfl,
          emailVerified: true,
          subscription: { create: { plan: 'FREE', scanLimit: 5 } },
        },
      });
    }
    return this.issueToken(user.id, user.email, user.role);
  }

  private issueToken(sub: string, email: string, role: string) {
    const accessToken = this.jwt.sign({ sub, email, role });
    return { accessToken, user: { id: sub, email, role } };
  }

  private apiBase() {
    return process.env.API_BASE_URL ?? 'http://localhost:4000';
  }
}
