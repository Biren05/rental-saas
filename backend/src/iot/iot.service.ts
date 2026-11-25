import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PairDeviceDto } from './dto/pair-device.dto';
import { TelemetryPacketDto } from './dto/telemetry-packet.dto';

@Injectable()
export class IotService {
  private readonly logger = new Logger(IotService.name);

  constructor(private prisma: PrismaService) {}

  async pairDevice(tenantId: string, dto: PairDeviceDto) {
    const cleanImei = dto.imei.trim();

    // Check if IMEI is already registered
    const existing = await this.prisma.iotDevice.findUnique({
      where: { imei: cleanImei },
    });

    if (existing && existing.tenantId !== tenantId) {
      throw new ConflictException(
        'An IoT device with this IMEI is already registered to another organization.',
      );
    }

    // If vehicleId provided, verify vehicle belongs to tenant
    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findFirst({
        where: { id: dto.vehicleId, tenantId },
      });
      if (!vehicle) {
        throw new NotFoundException('Specified vehicle was not found in your fleet.');
      }

      // Check if vehicle already has another device
      const existingVehicleDevice = await this.prisma.iotDevice.findFirst({
        where: { vehicleId: dto.vehicleId, imei: { not: cleanImei } },
      });
      if (existingVehicleDevice) {
        throw new BadRequestException(
          `Vehicle is already paired with tracker "${existingVehicleDevice.deviceName}" (${existingVehicleDevice.imei}). Please unpair it first.`,
        );
      }
    }

    if (existing) {
      // Update existing device
      return this.prisma.iotDevice.update({
        where: { id: existing.id },
        data: {
          deviceName: dto.deviceName,
          vehicleId: dto.vehicleId || null,
          deviceType: dto.deviceType || existing.deviceType,
          model: dto.model || existing.model,
          simNumber: dto.simNumber || existing.simNumber,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              plateNumber: true,
              brand: true,
              model: true,
              status: true,
            },
          },
        },
      });
    }

    // Create new paired device
    return this.prisma.iotDevice.create({
      data: {
        tenantId,
        imei: cleanImei,
        deviceName: dto.deviceName,
        vehicleId: dto.vehicleId || null,
        deviceType: dto.deviceType || 'GPS_TRACKER',
        model: dto.model || 'Generic GPS Tracker',
        simNumber: dto.simNumber,
        status: 'OFFLINE',
        lastLatitude: 27.7172, // Default Kathmandu valley coordinate
        lastLongitude: 85.324,
        lastSpeed: 0,
        batteryLevel: 100,
        ignitionStatus: false,
        isEngineLocked: false,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
            status: true,
          },
        },
      },
    });
  }

  async unpairDevice(tenantId: string, deviceId: string) {
    const device = await this.prisma.iotDevice.findFirst({
      where: { id: deviceId, tenantId },
    });

    if (!device) {
      throw new NotFoundException('IoT device not found.');
    }

    return this.prisma.iotDevice.delete({
      where: { id: deviceId },
    });
  }

  async getTenantDevices(tenantId: string) {
    return this.prisma.iotDevice.findMany({
      where: { tenantId },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
            color: true,
            status: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async recordTelemetry(
    dto: TelemetryPacketDto,
    iotSecret?: string,
    isInternalSimulation = false,
  ) {
    const configuredSecret = process.env.IOT_WEBHOOK_SECRET;
    if (!isInternalSimulation && configuredSecret && iotSecret !== configuredSecret) {
      throw new UnauthorizedException('Invalid IoT telemetry secret');
    }

    if (
      !Number.isFinite(dto.latitude) ||
      dto.latitude < -90 ||
      dto.latitude > 90 ||
      !Number.isFinite(dto.longitude) ||
      dto.longitude < -180 ||
      dto.longitude > 180
    ) {
      throw new BadRequestException('Invalid GPS coordinates');
    }

    const cleanImei = dto.imei.trim();

    const device = await this.prisma.iotDevice.findUnique({
      where: { imei: cleanImei },
    });

    if (!device) {
      this.logger.warn(`Received telemetry from unregistered device IMEI: ${cleanImei}`);
      return { success: false, message: 'Unregistered device IMEI' };
    }

    const now = new Date();
    const speed = dto.speed ?? device.lastSpeed ?? 0;
    const ignition = dto.ignition ?? (speed > 5);

    // Update live device state
    const updated = await this.prisma.iotDevice.update({
      where: { id: device.id },
      data: {
        lastLatitude: dto.latitude,
        lastLongitude: dto.longitude,
        lastSpeed: speed,
        batteryLevel: dto.batteryLevel ?? device.batteryLevel,
        ignitionStatus: ignition,
        status: 'ONLINE',
        lastPingAt: now,
      },
    });

    // If paired with a vehicle, log historical GPS breadcrumb
    if (device.vehicleId) {
      await this.prisma.gpsLog.create({
        data: {
          vehicleId: device.vehicleId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          speed,
          recordedAt: now,
        },
      });
    }

    return {
      success: true,
      deviceId: updated.id,
      engineLocked: updated.isEngineLocked,
      ack: 'OK',
    };
  }

  async toggleEngineLock(tenantId: string, deviceId: string, lock: boolean) {
    const device = await this.prisma.iotDevice.findFirst({
      where: { id: deviceId, tenantId },
      include: { vehicle: true },
    });

    if (!device) {
      throw new NotFoundException('IoT device not found in your organization.');
    }

    const updated = await this.prisma.iotDevice.update({
      where: { id: deviceId },
      data: {
        isEngineLocked: lock,
        status: lock ? 'ALARM' : 'ONLINE',
      },
    });

    this.logger.log(
      `[RELAY COMMAND] Remote engine ${lock ? 'IMMOBILIZED (CUTOFF)' : 'UNLOCKED (RESTORED)'} for vehicle ${
        device.vehicle?.plateNumber || device.imei
      }`,
    );

    return {
      success: true,
      isEngineLocked: updated.isEngineLocked,
      message: lock
        ? `Engine immobilizer activated for ${device.vehicle?.plateNumber || device.deviceName}. Ignition fuel relay has been cut off.`
        : `Engine ignition restored for ${device.vehicle?.plateNumber || device.deviceName}. Vehicle is free to operate.`,
    };
  }

  async getVehicleTracking(tenantId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
      include: {
        iotDevice: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    const trail = await this.prisma.gpsLog.findMany({
      where: { vehicleId },
      take: 60,
      orderBy: { recordedAt: 'desc' },
    });

    return {
      vehicle: {
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        status: vehicle.status,
      },
      device: vehicle.iotDevice,
      trail: trail.reverse(),
    };
  }

  async simulateMovement(tenantId: string, deviceId: string) {
    const device = await this.prisma.iotDevice.findFirst({
      where: { id: deviceId, tenantId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Kathmandu route simulator waypoint generator
    const currentLat = device.lastLatitude || 27.7172;
    const currentLng = device.lastLongitude || 85.324;

    // Small realistic step (roughly 100-300 meters)
    const latDelta = (Math.random() - 0.45) * 0.003;
    const lngDelta = (Math.random() - 0.45) * 0.003;
    const newLat = parseFloat((currentLat + latDelta).toFixed(6));
    const newLng = parseFloat((currentLng + lngDelta).toFixed(6));
    const newSpeed = device.isEngineLocked ? 0 : Math.floor(25 + Math.random() * 45);

    return this.recordTelemetry(
      {
        imei: device.imei,
        latitude: newLat,
        longitude: newLng,
        speed: newSpeed,
        batteryLevel: Math.max(10, Math.floor((device.batteryLevel || 95) - Math.random() * 2)),
        ignition: !device.isEngineLocked && newSpeed > 0,
      },
      undefined,
      true,
    );
  }
}
