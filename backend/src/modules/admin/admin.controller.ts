import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/roles.decorator';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { requestMeta } from '../../common/request-meta';
import { AdminService } from './admin.service';

class SetActiveDto {
  @IsBoolean()
  isActive: boolean;
}

class VerifyLawyerDto {
  @IsBoolean()
  verified: boolean;
}

class AssignLawyerDto {
  @IsOptional()
  @IsUUID()
  lawyerId?: string;
}

class ContactStatusDto {
  @IsIn(['NEW', 'REVIEWED', 'ARCHIVED'])
  status: 'NEW' | 'REVIEWED' | 'ARCHIVED';
}

/** Barcha admin endpointlari server tomonda ADMIN roli bilan himoyalangan. */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('users')
  listUsers(
    @Query('page') page?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.admin.listUsers(Math.max(1, Number(page) || 1), role, search);
  }

  @Patch('users/:id/active')
  setUserActive(
    @CurrentUser() admin: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetActiveDto,
    @Req() req: Request,
  ) {
    return this.admin.setUserActive(admin, id, dto.isActive, requestMeta(req));
  }

  @Get('lawyers')
  listLawyers(@Query('verified') verified?: string) {
    return this.admin.listLawyers(verified);
  }

  @Patch('lawyers/:userId/verify')
  verifyLawyer(
    @CurrentUser() admin: AuthUser,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: VerifyLawyerDto,
    @Req() req: Request,
  ) {
    return this.admin.verifyLawyer(admin, userId, dto.verified, requestMeta(req));
  }

  @Patch('cases/:id/assign')
  assignLawyer(
    @CurrentUser() admin: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignLawyerDto,
    @Req() req: Request,
  ) {
    return this.admin.assignLawyer(admin, id, dto.lawyerId ?? null, requestMeta(req));
  }

  @Get('contacts')
  listContacts(@Query('status') status?: string) {
    return this.admin.listContacts(status);
  }

  @Patch('contacts/:id/status')
  setContactStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ContactStatusDto,
  ) {
    return this.admin.setContactStatus(id, dto.status);
  }

  @Get('audit-logs')
  listAuditLogs(
    @Query('page') page?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.admin.listAuditLogs(
      Math.max(1, Number(page) || 1),
      action,
      userId,
    );
  }
}
