import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // ─── Google OAuth ──────────────────────────────────────────

  @Get('google')
  google(@Res() res: Response) {
    return res.redirect(this.auth.getGoogleAuthUrl());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const result = await this.auth.handleGoogleCallback(code);
    return this.redirectToFrontend(res, result.accessToken);
  }

  // ─── OneID OAuth ───────────────────────────────────────────

  @Get('oneid')
  oneId(@Res() res: Response) {
    return res.redirect(this.auth.getOneIdAuthUrl());
  }

  @Get('oneid/callback')
  async oneIdCallback(@Query('code') code: string, @Res() res: Response) {
    const result = await this.auth.handleOneIdCallback(code);
    return this.redirectToFrontend(res, result.accessToken);
  }

  private redirectToFrontend(res: Response, token: string) {
    const base = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
    return res.redirect(`${base}/auth/callback?token=${token}`);
  }
}
