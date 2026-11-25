import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        mustChangePassword: true,
        createdAt: true,
        tenantMemberships: {
          include: {
            tenant: {
              include: {
                subscriptions: {
                  include: {
                    plan: true,
                  },
                },
                _count: {
                  select: {
                    vehicles: true,
                    bookings: true,
                    members: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        avatarUrl: true,
      },
    });
  }
}
