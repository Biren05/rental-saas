import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Vehicle Rental Storefront | Book Online',
  description: 'Browse available rental vehicles, check dates, and reserve online with instant receipt.',
};

export default function PublicStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
