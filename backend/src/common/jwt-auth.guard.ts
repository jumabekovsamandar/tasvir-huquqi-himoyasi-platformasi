import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Bearer JWT token talab qiluvchi guard. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
