import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

class CreateJobDto {
  @IsString() imageId: string;
}

class UpdateMatchDto {
  @IsEnum(MatchStatus) status: MatchStatus;
}

@ApiTags('monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitoring')
class MonitoringController {
  constructor(private prisma: PrismaService) {}

  /** Tasvir uchun 24/7 internet monitoring vazifasini yoqish. */
  @Post('jobs')
  startJob(@CurrentUser() user: AuthUser, @Body() dto: CreateJobDto) {
    return this.prisma.monitoringJob.create({
      data: { userId: user.id, imageId: dto.imageId, active: true },
    });
  }

  @Get('jobs')
  jobs(@CurrentUser() user: AuthUser) {
    return this.prisma.monitoringJob.findMany({
      where: { userId: user.id },
      include: { matches: { orderBy: { foundAt: 'desc' } } },
    });
  }

  /** Topilgan barcha nusxalar (reverse image search natijalari). */
  @Get('matches')
  matches(@CurrentUser() user: AuthUser) {
    return this.prisma.monitoringMatch.findMany({
      where: { job: { userId: user.id } },
      orderBy: { foundAt: 'desc' },
    });
  }

  @Patch('matches/:id')
  updateMatch(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.prisma.monitoringMatch.updateMany({
      where: { id, job: { userId: user.id } },
      data: { status: dto.status },
    });
  }
}

@Module({ controllers: [MonitoringController] })
export class MonitoringModule {}
