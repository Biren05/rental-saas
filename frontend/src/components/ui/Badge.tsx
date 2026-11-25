import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase();

  let badgeClass = 'badge-active';
  if (['SUSPENDED', 'FAILED', 'CANCELLED', 'ERROR'].includes(normalized)) {
    badgeClass = 'badge-suspended';
  } else if (['TRIALING', 'FLEET_MANAGER', 'MONTHLY', 'YEARLY'].includes(normalized)) {
    badgeClass = 'badge-trialing';
  } else if (['PENDING', 'WARNING', 'USER', 'DRIVER'].includes(normalized)) {
    badgeClass = 'badge-warning';
  }

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`badge ${badgeClass} ${sizeClass}`}>
      {status}
    </span>
  );
};
