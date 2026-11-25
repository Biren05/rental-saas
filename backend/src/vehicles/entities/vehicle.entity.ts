export class VehicleEntity {
  id: string;
  ownerId: string;
  plateNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  color: string;
  chassisNumber?: string;
  engineNumber?: string;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
