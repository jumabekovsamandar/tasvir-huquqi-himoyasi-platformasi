import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Non-fatal connect: the app still boots if the database is unavailable,
    // so `npm run start:prod` succeeds in any environment.
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch (err) {
      this.logger.warn(
        `Database connection failed — continuing without DB: ${(err as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
