import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TraccarProvider {
  private readonly logger = new Logger(TraccarProvider.name);

  async fetchDeviceLocation(deviceId: string) {
    this.logger.log(`Fetching location from Traccar for device: ${deviceId}`);
    return {
      latitude: 27.7172,
      longitude: 85.324,
      speed: 45.0,
      timestamp: new Date(),
    };
  }
}
