import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
class UsersController {
  constructor(private prisma: PrismaService) {}

  /** Joriy foydalanuvchi profili va obuna holati. */
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        twoFactorEnabled: true,
        subscription: true,
      },
    });
  }
}

@Module({ controllers: [UsersController] })
export class UsersModule {}
