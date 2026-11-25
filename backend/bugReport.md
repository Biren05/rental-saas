# Backend Security & Bug Audit Report

**Audit Date:** 2026-11-25  
**Scope:** NestJS Backend (`backend/src/**`) — Authentication, Multi-Tenant Isolation, Public Booking, Payments, and Concurrency.  
**Test Runner Check:** `npm --prefix backend test -- --passWithNoTests` (`No tests found`)

---

## Summary of Findings & Fixes

| # | Severity | Area | Issue / Loophole | Status |
|---|---|---|---|---|
| 1 | Critical | `RentalsController` (`:tenantId/payments*`) | Cross-tenant IDOR: `:tenantId` route param was not validated against `TenantGuard`'s active tenant (`x-tenant-id`) | **Fixed** |
| 2 | Critical | `TenantsController` (`:id/documents*`) | Missing tenant ownership/admin guard on `POST`, `GET`, and `DELETE` document endpoints | **Fixed** |
| 3 | Critical | `RentalsService.createPublicBooking` | Client-supplied `dto.paidAmount` was trusted directly on `ADVANCE` / `PAY_ON_PICKUP` (payment amount tampering) | **Fixed** |
| 4 | High | `RentalsService.createPublicBooking` | Race condition between overlapping booking check and `rentalBooking.create` could allow double bookings | **Fixed** |
| 5 | High | `RentalsService.createPublicBooking` | Unauthenticated guest checkout mutated existing `User.fullName` and `User.phone` (account overwrite & `P2002` crash risk) | **Fixed** |
| 6 | High | `RentalsService.updateBookingPaymentReceipt` | Public endpoint allowed overwriting an already-attached payment receipt slip | **Fixed** |
| 7 | Critical | `VehiclesController` / `VehiclesService` | Cross-tenant IDOR on `GET/PATCH/DELETE /vehicles/:id` and `POST /vehicles?tenantId=` | **Fixed** |
| 8 | Critical | `SubscriptionsService.subscribe` | Paid subscription plans were marked `ACTIVE` immediately even while payment was `PENDING` | **Fixed** |
| 9 | High | `RentalsService` (`requestCustomerOtp` / `verifyCustomerOtp`) | Missing 60s OTP resend cooldown and brute-force attempt lockout | **Fixed** |
| 10 | High | `TenantsController.createTenant` | Any authenticated `USER` could bypass `/tenants/apply` and create `ACTIVE` tenants directly | **Fixed** |
| 11 | Critical | `DocumentsController` | Missing vehicle ownership/tenant check on vehicle document CRUD | **Fixed** |
| 12 | High | `RemindersController` | Missing vehicle ownership/tenant check on servicing reminders | **Fixed** |
| 13 | Critical | `InsuranceController` | Missing vehicle ownership/tenant check on insurance policy endpoints | **Fixed** |
| 14 | Critical | `GpsController` | Missing vehicle ownership/tenant check on GPS telemetry & live location | **Fixed** |
| 15 | High | `QrController` | Missing vehicle ownership/tenant check on `POST /qr/generate` | **Fixed** |
| 16 | Critical | `ParkingController` / `ParkingService` | Cross-tenant IDOR on parking entry, exit, and history (`vehicleId` / `parkingLogId`) | **Fixed** |
| 17 | High | `RoadsideController` / `RoadsideService` | Cross-tenant IDOR on roadside assistance requests and vehicle request history | **Fixed** |
| 18 | High | `FleetController` / `FleetService` | Missing fleet manager & vehicle ownership checks on `POST /fleet/assign` | **Fixed** |
| 19 | High | `SuspiciousController` / `SuspiciousService` | `GET /suspicious/reports` exposed all reporters' PII (`email`, `phone`, `fullName`) to any user | **Fixed** |
| 20 | Critical | `UploadsController` / `PublicRentalsController` | Unrestricted file upload (no size/MIME filter) and Stored XSS via inline `.svg` serving | **Fixed** |
| 21 | High | `IotController` / `IotService` | Unauthenticated `POST /iot/telemetry` allowed GPS spoofing without `x-iot-secret` or coordinate bounds check | **Fixed** |
| 22 | Medium | `PaymentsController` / `PaymentsService` | Missing DTO validation on `POST /payments/initiate` (`amount` <= 0 or invalid `PaymentMethod`) | **Fixed** |
| 23 | Medium | `RentalsService.updateBookingPaymentReceipt` | Missing URL validation on `paymentReceiptUrl` | **Fixed** |
| 24 | Medium | `EmergencyService` / `AdminController` | Missing vehicle access check on SOS trigger, missing `Role` DTO validation, and un-whitelisted settings merge | **Fixed** |
| 25 | Critical | `AuthService.register` / `RegisterDto` | Self-signup allowed passing `role: ADMIN` for instant Super-Admin privilege escalation | **Fixed** |
| 26 | High | `JwtStrategy` / `AuthModule` / `RentalsModule` / `jwt.config` | Hardcoded fallback JWT secrets allowed token forgery if `JWT_SECRET` was unset in production | **Fixed** |
| 27 | High | `TenantsController` / `VehiclesController` | Remaining upload endpoints (`/tenants/apply/upload`, `/tenants/:id/documents`, `/vehicles/upload-image`) lacked file size/MIME filters | **Fixed** |
| 28 | Medium | `AuthService.register` | Email was not normalized with `.trim().toLowerCase()` during registration, breaking login for mixed-case emails | **Fixed** |
| 29 | Medium | `RentalsController` (`createTenantPromo`, `applyLateFee`) | Missing DTO validation (`discountPercent` 1–100, positive late-fee `amount`) | **Fixed** |
| 30 | Medium | `TenantsService.addMember` | Missing email normalization (`.trim().toLowerCase()`) and allowed assigning `OWNER` role to invited members | **Fixed** |
| 31 | Low | `TenantsController.updateTenantStatus` | Missing `TenantStatus` enum DTO validation on status update | **Fixed** |
| 32 | Medium | `AdminService` | Platform settings & Superadmin QR URLs stored in local `data/platform-settings.json` instead of PostgreSQL | Documented |
| 33 | Medium | Automated Tests | No Jest unit/e2e test suite present (`No tests found`) | Documented |

---

## Detailed Findings & Applied Remediations

### 1. Cross-Tenant IDOR in Payment Endpoints (Critical — Fixed)
- **Location:** `backend/src/rentals/rentals.controller.ts` (`getTenantPaymentsById`, `getPaymentStatsById`, `getUdharoLedgerById`, `recordPaymentById`)
- **Root Cause:** `TenantGuard` validates `x-tenant-id` / `x-tenant-slug` headers, not `:tenantId` URL params. A member of Tenant A could pass their own `x-tenant-id` header while requesting `/rentals/<TENANT_B_ID>/payments` or `/udharo`.
- **Fix Applied:** Added `assertTenantMatch(activeTenantId, paramTenantId)` using `@CurrentTenant('id')` and throwing `ForbiddenException` on mismatch.

### 2. Missing Authorization on Tenant Document Endpoints (Critical — Fixed)
- **Location:** `backend/src/tenants/tenants.controller.ts` & `backend/src/tenants/tenants.service.ts` (`uploadTenantDocument`, `getTenantDocuments`, `deleteTenantDocument`)
- **Root Cause:** Any authenticated user could upload, view, or delete any tenant's business verification documents by passing `:id`.
- **Fix Applied:** Extracted `TenantsService.assertTenantAccess(tenantId, user)` and enforced it across all three document endpoints (allowing only `ADMIN` or verified members of that tenant).

### 3. Client-Side Payment Amount Tampering (Critical — Fixed)
- **Location:** `backend/src/rentals/rentals.service.ts` (`createPublicBooking`)
- **Root Cause:** `dto.paidAmount` from the request body was trusted directly for `ADVANCE` and `PAY_ON_PICKUP` bookings.
- **Fix Applied:** Server now strictly computes `effectivePaid`: `totalAmount` for `FULL`, `Math.min(2000, totalAmount)` for `ADVANCE`, and `0` for `PAY_ON_PICKUP`.

### 4. Double-Booking Race Condition (High — Fixed)
- **Location:** `backend/src/rentals/rentals.service.ts` (`createPublicBooking`)
- **Root Cause:** Availability check (`findFirst`) and booking creation (`create`) ran outside a database transaction.
- **Fix Applied:** Wrapped both operations inside `this.prisma.$transaction(async (tx) => { ... })`.

### 5. Guest Checkout Profile Overwrite & Unique Constraint Risk (High — Fixed)
- **Location:** `backend/src/rentals/rentals.service.ts` (`createPublicBooking`)
- **Root Cause:** Guest bookings updated `User.fullName` and `User.phone` on existing user records without authentication, risking account spoofing or `P2002` unique constraint errors.
- **Fix Applied:** Stopped mutating existing `User` records during guest checkout; per-booking snapshots (`customerName`, `customerEmail`, `customerPhone`) already preserve the submitted details cleanly.

### 6. Unauthenticated Payment Receipt Overwrite (High — Fixed)
- **Location:** `backend/src/rentals/rentals.service.ts` (`updateBookingPaymentReceipt`)
- **Root Cause:** Public endpoint allowed replacing an already-submitted payment slip.
- **Fix Applied:** Blocked updates if `booking.paymentReceiptUrl` is already present.

---

## Remaining Recommendations (Medium)
1. **Persist Platform Settings in PostgreSQL:** Migrate `AdminService` (`backend/data/platform-settings.json`) to a Prisma `PlatformSettings` table so settings survive container redeploys.
2. **Add Automated Jest E2E Tests:** Add integration tests covering tenant isolation (`TenantGuard`), `createPublicBooking` concurrency, and promo/discount calculations.
