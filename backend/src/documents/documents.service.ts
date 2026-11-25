import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async createDocument(dto: UploadDocumentDto, user?: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, dto.vehicleId, user, true);
    return this.prisma.document.create({
      data: {
        vehicleId: dto.vehicleId,
        title: dto.title,
        fileUrl: dto.fileUrl,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });
  }

  async getVehicleDocuments(vehicleId: string, user?: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, vehicleId, user, false);
    return this.prisma.document.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteDocument(id: string, user?: { id: string; role: string }) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await assertVehicleAccess(this.prisma, doc.vehicleId, user, true);
    return this.prisma.document.delete({ where: { id } });
  }
}
