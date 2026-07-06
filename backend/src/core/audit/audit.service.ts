import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestMeta } from '../../common/request-meta';

export type AuditEntry = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
} & RequestMeta;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Muhim harakatni audit logga yozadi. Audit yozuvi muvaffaqiyatsiz
   * bo‘lsa ham asosiy amal bekor qilinmaydi — xato faqat logga tushadi.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId ?? null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata,
        },
      });
    } catch (err) {
      this.logger.error(`Audit log yozilmadi: ${entry.action}`, err as Error);
    }
  }
}
