'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tenant } from '../types';
import { tenantService } from '../services/tenant.service';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  role: string | null;
  loading: boolean;
  isTenantDomain: boolean;
  refreshTenant: () => Promise<void>;
  switchTenant: (newTenantId: string) => void;
  availableTenants: Tenant[];
}

function getHostTenantKey(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname.toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost')
    .split(':')[0]
    .toLowerCase();

  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname === '::1';
  const isPlatform =
    !hostname ||
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === `app.${rootDomain}` ||
    hostname === `admin.${rootDomain}` ||
    isIp;

  if (isPlatform) return null;

  const normalizedHost = hostname.replace(/^www\./, '');
  return normalizedHost.endsWith(`.${rootDomain}`)
    ? normalizedHost.slice(0, -(rootDomain.length + 1))
    : normalizedHost;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);

  const loadTenantData = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Determine list of accessible tenants
      let candidateTenants: Tenant[] = [];

      if (user.tenantMemberships && user.tenantMemberships.length > 0) {
        candidateTenants = user.tenantMemberships.map((m: any) => ({
          ...m.tenant,
          myRole: m.role,
        }));
      }

      // If user is superadmin or candidate list is empty, fetch available tenants from API
      if (isAdmin) {
        try {
          const all = await tenantService.getAllTenants();
          const allList = (all as any)?.data || all;
          if (Array.isArray(allList) && allList.length > 0) {
            candidateTenants = allList;
          }
        } catch {
          // Ignore
        }
      }

      const hostKey = getHostTenantKey();
      if (hostKey) {
        candidateTenants = candidateTenants.filter(
          (t) =>
            t.slug?.toLowerCase() === hostKey ||
            t.domain?.toLowerCase() === hostKey
        );
      }

      setAvailableTenants(candidateTenants);

      // 2. Select target tenant ID
      const savedTenantId = typeof window !== 'undefined' ? localStorage.getItem('activeTenantId') : null;
      let targetId: string | null = null;

      if (savedTenantId && candidateTenants.some((t) => t.id === savedTenantId)) {
        targetId = savedTenantId;
      } else if (candidateTenants.length > 0) {
        targetId = candidateTenants[0].id;
        if (typeof window !== 'undefined') {
          localStorage.setItem('activeTenantId', targetId);
        }
      }

      setActiveTenantId(targetId);

      // 3. Fetch detailed tenant details
      if (targetId) {
        const fullTenant = await tenantService.getTenantById(targetId);
        const data = (fullTenant as any)?.data || fullTenant;
        setTenant(data);
      } else {
        setTenant(null);
      }
    } catch (err) {
      console.error('Failed to load tenant details in TenantContext:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  const switchTenant = (newTenantId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTenantId', newTenantId);
    }
    setActiveTenantId(newTenantId);
    setLoading(true);
    tenantService
      .getTenantById(newTenantId)
      .then((res) => {
        const data = (res as any)?.data || res;
        setTenant(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const refreshTenant = async () => {
    if (activeTenantId) {
      try {
        const res = await tenantService.getTenantById(activeTenantId);
        const data = (res as any)?.data || res;
        setTenant(data);
      } catch (err) {
        console.error('Failed to refresh tenant:', err);
      }
    } else {
      await loadTenantData();
    }
  };

  const currentMembership = user?.tenantMemberships?.find(
    (m: any) => m.tenantId === activeTenantId || m.tenant?.id === activeTenantId
  );
  const role = currentMembership?.role || (isAdmin ? 'SUPERADMIN' : 'MEMBER');

  const isTenantDomain = !!getHostTenantKey();

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenantId: activeTenantId,
        role,
        loading: loading || authLoading,
        isTenantDomain,
        refreshTenant,
        switchTenant,
        availableTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
