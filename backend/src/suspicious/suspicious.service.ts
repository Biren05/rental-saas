import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportSuspiciousDto } from './dto/report-suspicious.dto';

@Injectable()
export class SuspiciousService {
  constructor(private prisma: PrismaService) {}

  async createReport(reporterId: string, dto: ReportSuspiciousDto) {
    return this.prisma.suspiciousReport.create({
      data: {
        reporterId,
        ...dto,
      },
    });
  }

  async getAllReports(user: { id: string; role: string }) {
    return this.prisma.suspiciousReport.findMany({
      where: user.role === 'ADMIN' ? undefined : { reporterId: user.id },
      include: {
        reporter: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
