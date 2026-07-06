import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/roles.decorator';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { requestMeta } from '../../common/request-meta';
import { CasesService } from './cases.service';
import { AddMessageDto, AddNoteDto, ChangeStatusDto, RequestInfoDto } from './dto';

@ApiTags('cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cases')
export class CasesController {
  constructor(private readonly cases: CasesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.cases.list(user, status);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.cases.getOne(user, id);
  }

  @Patch(':id/status')
  @Roles('LAWYER', 'ADMIN')
  changeStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
    @Req() req: Request,
  ) {
    return this.cases.changeStatus(user, id, dto, requestMeta(req));
  }

  @Post(':id/request-info')
  @Roles('LAWYER', 'ADMIN')
  requestInfo(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestInfoDto,
    @Req() req: Request,
  ) {
    return this.cases.requestInfo(user, id, dto, requestMeta(req));
  }

  @Post(':id/provide-info')
  provideInfo(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.cases.provideInfo(user, id, dto);
  }

  @Get(':id/notes')
  @Roles('LAWYER', 'ADMIN')
  listNotes(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.cases.listNotes(user, id);
  }

  @Post(':id/notes')
  @Roles('LAWYER', 'ADMIN')
  addNote(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddNoteDto,
  ) {
    return this.cases.addNote(user, id, dto);
  }

  @Get(':id/messages')
  listMessages(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cases.listMessages(user, id);
  }

  @Post(':id/messages')
  addMessage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.cases.addMessage(user, id, dto);
  }
}
