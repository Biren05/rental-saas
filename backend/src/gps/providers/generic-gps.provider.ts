import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GenericGpsProvider {
  private readonly logger = new Logger(GenericGpsProvider.name);

  async parseTelemetryPayload(payload: any) {
    this.logger.log(`Parsing generic GPS telemetry packet`);
    return {
      latitude: payload.lat || 27.7172,
      longitude: payload.lng || 85.324,
      speed: payload.spd || 0.0,
      timestamp: new Date(),
    };
  }
}
