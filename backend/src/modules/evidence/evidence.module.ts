import { Controller, Get, Module, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidence')
class EvidenceController {
  constructor(private prisma: PrismaService) {}

  /** Foydalanuvchining barcha elektron dalillari (vaqt tamg‘asi bilan). */
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.evidence.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.evidence.findFirst({
      where: { id, userId: user.id },
      include: { image: true, match: true, scan: true },
    });
  }
}

@Module({ controllers: [EvidenceController] })
export class EvidenceModule {}
