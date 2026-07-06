import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { requestMeta } from '../../common/request-meta';
import { UsersService } from './users.service';
import { DeleteAccountDto, UpdateLawyerProfileDto, UpdateProfileDto } from './dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch('me/profile')
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch('me/lawyer-profile')
  updateLawyerProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateLawyerProfileDto,
  ) {
    return this.users.updateLawyerProfile(user.id, dto);
  }

  /** Shaxsiy ma'lumotlar eksporti (privacy-by-design). */
  @Get('me/export')
  exportData(@CurrentUser() user: AuthUser) {
    return this.users.exportData(user.id);
  }

  /** Akkauntni o‘chirish (soft delete + shaxsiy ma'lumotlarni anonimlashtirish). */
  @Delete('me')
  deleteAccount(
    @CurrentUser() user: AuthUser,
    @Body() dto: DeleteAccountDto,
    @Req() req: Request,
  ) {
    return this.users.deleteAccount(user.id, dto, requestMeta(req));
  }
}
