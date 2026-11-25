import { NextRequest, NextResponse } from 'next/server';

// Only Platform Superadmin routes are blocked on individual Tenant domains.
// Each tenant domain hosts BOTH its own Public Storefront ("/") and its own Admin ("/dashboard", "/login").
const BLOCKED_PLATFORM_PREFIXES = ['/admin', '/superadmin'];

const TENANT_AUTH_AND_DASHBOARD_PREFIXES = [
  '/dashboard',
  '/login',
  '/register',
  '/first-login',
  '/forgot-password',
];

function isIpAddress(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname === '::1';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals, API routes, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hostHeader = req.headers.get('host') || '';
  const rawHostname = hostHeader.split(':')[0].toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost')
    .split(':')[0]
    .toLowerCase();

  // Main platform / Superadmin hosts: allow SaaS landing, Superadmin, /login, /dashboard, and /rent/[slug]
  const isPlatformHost =
    !rawHostname ||
    rawHostname === rootDomain ||
    rawHostname === `www.${rootDomain}` ||
    rawHostname === `app.${rootDomain}` ||
    rawHostname === `admin.${rootDomain}` ||
    isIpAddress(rawHostname);

  if (isPlatformHost) {
    return NextResponse.next();
  }

  // Strip leading "www." on tenant custom domains so www.agency.com.np == agency.com.np
  const hostname = rawHostname.replace(/^www\./, '');

  // Extract tenant key from subdomain (e.g. <slug>.localhost) or custom domain (e.g. agency.com)
  const tenantKey = hostname.endsWith(`.${rootDomain}`)
    ? hostname.slice(0, -(rootDomain.length + 1))
    : hostname;

  // Block Platform Superadmin routes on tenant domains
  const isPlatformOnlyRoute = BLOCKED_PLATFORM_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isPlatformOnlyRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Allow Tenant's own Admin Dashboard & Login routes on its own domain
  const isTenantAdminRoute = TENANT_AUTH_AND_DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isTenantAdminRoute) {
    return NextResponse.next();
  }

  // Rewrite root "/" -> "/rent/[tenantKey]" (Tenant Public Storefront)
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = `/rent/${tenantKey}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite "/confirmation/[bookingId]" -> "/rent/[tenantKey]/confirmation/[bookingId]"
  if (pathname.startsWith('/confirmation/')) {
    const url = req.nextUrl.clone();
    url.pathname = `/rent/${tenantKey}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Allow direct "/rent/..." paths to pass through
  if (pathname.startsWith('/rent/')) {
    return NextResponse.next();
  }

  // Any other unknown path on a tenant domain redirects to its public storefront root
  const url = req.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
