import { api } from '../lib/api';

export interface HealthData {
  status: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  database: {
    status: string;
    responseTimeMs?: number;
  };
}

export const healthService = {
  getHealth: () => api.get<HealthData>('/health'),
};
