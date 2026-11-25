import React from 'react';
import { Car, Building2, Layers, QrCode } from 'lucide-react';
import { MetricCard } from '../../ui/MetricCard';

interface OverviewMetricsProps {
  loading: boolean;
  totalVehicles: number;
  totalUsers: number;
  plansCount: number;
  totalQrCodes: number;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  loading,
  totalVehicles,
  totalUsers,
  plansCount,
  totalQrCodes,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <MetricCard
        label="Total Vehicles"
        value={loading ? '...' : totalVehicles}
        icon={Car}
        trendText="Active across all fleets"
        colorVariant="indigo"
      />
      <MetricCard
        label="Active Users"
        value={loading ? '...' : totalUsers}
        icon={Building2}
        subtext="Owners, staff & customers"
        colorVariant="purple"
      />
      <MetricCard
        label="SaaS Plans"
        value={loading ? '...' : plansCount}
        icon={Layers}
        subtext="Configured pricing tiers"
        colorVariant="cyan"
      />
      <MetricCard
        label="Smart QR Telemetry"
        value={loading ? '...' : totalQrCodes}
        icon={QrCode}
        trendText="Digital tags provisioned"
        colorVariant="emerald"
      />
    </div>
  );
};
