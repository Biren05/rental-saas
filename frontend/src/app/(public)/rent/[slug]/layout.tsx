import type { Metadata } from 'next';
import React from 'react';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(
      `${apiUrl}/public/rentals/${encodeURIComponent(slug)}/info`,
      { next: { revalidate: 60 } },
    );

    if (res.ok) {
      const json = await res.json();
      const tenant = json?.data || json;
      if (tenant?.name) {
        const location = tenant.address ? ` in ${tenant.address}` : ' in Nepal';
        return {
          title: `${tenant.name} | Rent Vehicles Online`,
          description: `Browse available cars, bikes, and scooters from ${tenant.name}${location}. Transparent NPR rates, online verification, and instant booking receipt.`,
        };
      }
    }
  } catch {
    // Fallback to default storefront metadata
  }

  return {
    title: 'Vehicle Rental Storefront | Book Online',
    description:
      'Browse available rental vehicles, check dates, and reserve online with instant receipt.',
  };
}

export default function TenantPublicLayout({ children }: Props) {
  return <>{children}</>;
}
