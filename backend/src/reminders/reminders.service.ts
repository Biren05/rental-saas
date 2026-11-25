import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReminderDto, user?: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, dto.vehicleId, user, true);
    return this.prisma.reminder.create({
      data: {
        vehicleId: dto.vehicleId,
        title: dto.title,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async findByVehicle(vehicleId: string, user?: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, vehicleId, user, false);
    return this.prisma.reminder.findMany({
      where: { vehicleId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async markAsCompleted(id: string, user?: { id: string; role: string }) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id } });
    if (!reminder) throw new NotFoundException('Reminder not found');
    await assertVehicleAccess(this.prisma, reminder.vehicleId, user, true);

    return this.prisma.reminder.update({
      where: { id },
      data: { isCompleted: true },
    });
  }
}
