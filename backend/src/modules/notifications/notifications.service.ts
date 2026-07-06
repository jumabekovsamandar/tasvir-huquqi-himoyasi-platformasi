import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Ilova ichidagi bildirishnomalar. Arxitektura keyinchalik email/SMS/
 * Telegram kanallarini qo‘shishga tayyor: notify() yagona kirish nuqtasi
 * bo‘lib, kanallar shu yerda kengaytiriladi.
 */
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async notify(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    link?: string,
  ) {
    await this.prisma.notification.create({
      data: { userId, type, title, body, link },
    });
  }

  async list(userId: string, unreadOnly = false) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, ...(unreadOnly ? { readAt: null } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, unreadCount };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Bildirishnoma topilmadi');
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'Barcha bildirishnomalar o‘qildi deb belgilandi' };
  }
}
