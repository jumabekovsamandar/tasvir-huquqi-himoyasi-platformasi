import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(ownerId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: { ...dto, ownerId },
    });
  }

  findAll(ownerId: string) {
    return this.prisma.task.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(ownerId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, ownerId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(ownerId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(ownerId, id);
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async remove(ownerId: string, id: string) {
    await this.findOne(ownerId, id);
    await this.prisma.task.delete({ where: { id } });
    return { deleted: true };
  }
}
