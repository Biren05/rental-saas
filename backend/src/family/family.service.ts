import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async addMember(ownerId: string, dto: AddMemberDto) {
    return this.prisma.familyMember.create({
      data: {
        ownerId,
        memberName: dto.memberName,
        memberPhone: dto.memberPhone,
        relation: dto.relation,
      },
    });
  }

  async getMembers(ownerId: string) {
    return this.prisma.familyMember.findMany({
      where: { ownerId },
    });
  }

  async removeMember(id: string, ownerId: string) {
    const member = await this.prisma.familyMember.findFirst({ where: { id, ownerId } });
    if (!member) throw new NotFoundException('Family member record not found');
    return this.prisma.familyMember.delete({ where: { id } });
  }
}
