# Vehicle Identity & Management System Backend

An enterprise-grade, high-performance RESTful microservices-oriented monolithic backend built with **NestJS**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. Featuring seamless digital bluebook verification, QR code telemetry, parking automation, roadside assistance, real-time GPS tracking, multi-channel notifications (FCM, SMS, Email), and comprehensive Nepal payment gateway integrations (**eSewa**, **Khalti**, **Fonepay**).

---

## 📁 Full Project Folder Structure

```text
vehicle-identity-backend/
│
├── src/
│   ├── main.ts                       # Application bootstrap (Helmet, CORS, Compression, Swagger)
│   ├── app.module.ts                 # Root application module (Throttler, Middleware, Feature modules)
│   │
│   ├── config/                       # Centralized Environment & Feature Configurations
│   │   ├── app.config.ts             # Application & Server port settings
│   │   ├── database.config.ts        # Database connection strings
│   │   ├── jwt.config.ts             # JWT Access & Refresh token configuration
│   │   ├── mail.config.ts            # SMTP Email server configuration
│   │   ├── sms.config.ts             # SMS Gateway credentials
│   │   ├── storage.config.ts         # Storage provider & upload directory settings
│   │   └── swagger.config.ts         # Centralized OpenAPI 3.0 (Swagger) builder & UI configuration
│   │
│   ├── common/                       # Enterprise Shared Cross-Cutting Utilities
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts # Extracts authenticated user payload from request
│   │   │   ├── public.decorator.ts       # Bypass JWT authentication guard
│   │   │   ├── roles.decorator.ts        # Assign RBAC role metadata
│   │   │   └── swagger.decorator.ts      # Custom reusable OpenAPI decorators (@ApiAuth, @ApiCustomResponse)
│   │   ├── dto/
│   │   │   ├── api-response.dto.ts       # Standardized ApiResponseDto, ApiErrorResponseDto & PaginatedResponseDto
│   │   │   ├── pagination.dto.ts         # Reusable Pagination request DTO
│   │   │   └── response.dto.ts           # Standard API Envelope format
│   │   ├── enums/
│   │   │   ├── emergency-priority.enum.ts# Emergency priority levels (LOW, MEDIUM, HIGH, CRITICAL)
│   │   │   ├── payment-provider.enum.ts # Payment gateways (ESEWA, KHALTI, FONEPAY, CASH)
│   │   │   ├── roles.enum.ts            # User roles (USER, DRIVER, FLEET_MANAGER, ADMIN)
│   │   │   └── vehicle-type.enum.ts     # Vehicle categories (CAR, MOTORCYCLE, SCOOTER, TRUCK, etc.)
│   │   ├── exceptions/
│   │   │   └── custom.exception.ts       # Custom domain exception class
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Global exception filter with Request ID correlation
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts         # JWT authentication guard with public metadata check
│   │   │   └── roles.guard.ts            # Role-Based Access Control (RBAC) guard
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts    # Execution time & route logging
│   │   │   └── transform.interceptor.ts  # Unified response payload formatting
│   │   ├── middleware/
│   │   │   ├── audit-logger.middleware.ts# Request audit logger (IP, User Agent, Route, Request ID)
│   │   │   ├── logger.middleware.ts      # HTTP response status logger
│   │   │   └── request-id.middleware.ts # Generates/propagates unique `x-request-id` headers
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts        # Global validation pipe with whitelist & transformation
│   │   ├── utils/
│   │   │   ├── crypto.util.ts            # HMAC SHA256 signature generator & random bytes helper
│   │   │   └── qr.util.ts                # QR Code Data URL generator
│   │   └── constants/
│   │       └── system.constant.ts        # System-wide constants (Upload limits, pagination defaults)
│   │
│   ├── prisma/                       # Global Prisma ORM Integration
│   │   ├── prisma.module.ts          # Global Prisma module
│   │   ├── prisma.service.ts         # Database lifecycle management
│   │   └── seed.ts                   # Master database seed runner
│   │
│   ├── health/                       # System Health & Operational Probes
│   │   ├── health.controller.ts      # Health check endpoints (/api/v1/health)
│   │   ├── health.service.ts         # Memory, DB connectivity, & uptime probes
│   │   └── health.module.ts
│   │
│   ├── auth/                         # Authentication & Credentials Module
│   │   ├── auth.controller.ts        # Register, Login endpoints with OpenAPI documentation
│   │   ├── auth.service.ts           # Password hashing (bcrypt) & JWT token issuing
│   │   ├── auth.module.ts
│   │   ├── dto/                      # Login, Register, RefreshToken DTOs with @ApiProperty
│   │   ├── guards/                   # Local and JWT auth guards
│   │   ├── strategies/               # Passport JWT & Local strategies
│   │   └── decorators/               # Auth composite decorator
│   │
│   ├── users/                        # User Account Management
│   │   ├── users.controller.ts       # Profile fetch & patch endpoints
│   │   ├── users.service.ts          # User profile operations
│   │   ├── users.module.ts
│   │   ├── dto/                      # Create & Update user DTOs
│   │   └── entities/                 # User entity representation
│   │
│   ├── vehicles/                     # Digital Bluebook & Vehicle Registration
│   │   ├── vehicles.controller.ts    # Vehicle CRUD endpoints
│   │   ├── vehicles.service.ts       # Vehicle bluebook logic
│   │   ├── vehicles.module.ts
│   │   ├── dto/                      # Create & Update vehicle DTOs
│   │   └── entities/                 # Vehicle entity definition
│   │
│   ├── qr/                           # Vehicle QR Code & Public Scanner API
│   │   ├── qr.controller.ts          # QR generation & public scan endpoints
│   │   ├── qr.service.ts             # Dynamic QR payload generator & scan decoder
│   │   ├── qr.module.ts
│   │   └── dto/                      # Generate & Scan QR DTOs
│   │
│   ├── parking/                      # Automated Parking Session Management
│   │   ├── parking.controller.ts     # Check-in, Check-out & History endpoints
│   │   ├── parking.service.ts        # Duration & parking fee calculator
│   │   ├── parking.module.ts
│   │   └── dto/                      # Park & Exit parking DTOs
│   │
│   ├── emergency/                    # SOS Emergency Alerts & Broadcasts
│   │   ├── emergency.controller.ts   # SOS trigger & log retrieval
│   │   ├── emergency.service.ts      # Emergency broadcast processor
│   │   ├── emergency.module.ts
│   │   └── dto/                      # SOS alert creation DTO
│   │
│   ├── suspicious/                   # Stolen / Suspicious Vehicle Incident Reporting
│   │   ├── suspicious.controller.ts  # Submit & fetch incident reports
│   │   ├── suspicious.service.ts     # Suspicious report handler
│   │   ├── suspicious.module.ts
│   │   └── dto/                      # Report suspicious DTO
│   │
│   ├── documents/                    # Vehicle Tax Token, License & Bluebook Vault
│   │   ├── documents.controller.ts   # File record storage endpoints
│   │   ├── documents.service.ts      # Expiry tracking & document metadata
│   │   ├── documents.module.ts
│   │   └── dto/                      # Upload & Update document DTOs
│   │
│   ├── reminders/                    # Automated Maintenance & Tax Reminders
│   │   ├── reminders.controller.ts   # Reminder management
│   │   ├── reminders.service.ts      # Due date alert handler
│   │   ├── reminders.module.ts
│   │   └── dto/                      # Create reminder DTO
│   │
│   ├── notifications/                # Multi-Channel Notification Pipeline
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts  # Dispatcher for FCM, SMS, and Email
│   │   ├── notifications.module.ts
│   │   ├── firebase/                 # Firebase Cloud Messaging (FCM) push notification engine
│   │   ├── sms/                      # Bulk SMS gateway integration
│   │   └── email/                    # SMTP Email delivery engine
│   │
│   ├── family/                       # Family Shared Vehicle Access
│   │   ├── family.controller.ts      # Manage family member permissions
│   │   ├── family.service.ts         # Shared access handler
│   │   ├── family.module.ts
│   │   └── dto/                      # Add family member DTO
│   │
│   ├── fleet/                        # Organization Fleet & Roster Management
│   │   ├── fleet.controller.ts       # Commercial fleet management
│   │   ├── fleet.service.ts          # Vehicle assignment to fleet roster
│   │   ├── fleet.module.ts
│   │   └── dto/                      # Create fleet & Assign vehicle DTOs
│   │
│   ├── gps/                          # Telemetry & Real-Time Tracking
│   │   ├── gps.controller.ts         # Telemetry ingest & location fetch
│   │   ├── gps.service.ts            # GPS log persistence
│   │   ├── gps.module.ts
│   │   └── providers/                # Traccar & Generic hardware GPS parsers
│   │
│   ├── roadside/                     # Roadside Assistance & Towing Requests
│   │   ├── roadside.controller.ts    # Assistance request handler
│   │   ├── roadside.service.ts       # Towing dispatch logic
│   │   └── roadside.module.ts
│   │
│   ├── insurance/                    # Insurance Policy & Claims Management
│   │   ├── insurance.controller.ts   # Policy registration endpoints
│   │   ├── insurance.service.ts      # Policy validity & claims service
│   │   └── insurance.module.ts
│   │
│   ├── payments/                     # Nepal Payment Gateways Engine
│   │   ├── payments.controller.ts    # Unified payment initiation endpoint
│   │   ├── payments.service.ts       # Gateway router & transaction logger
│   │   ├── payments.module.ts
│   │   ├── esewa/                    # eSewa HMAC SHA256 signature verification & payment payload
│   │   ├── khalti/                   # Khalti EPAY initiate & transaction verification
│   │   └── fonepay/                  # Fonepay dynamic QR generation
│   │
│   ├── uploads/                      # Document & Image Attachment Handler
│   │   ├── uploads.controller.ts     # Multipart file upload endpoint
│   │   ├── uploads.service.ts        # Storage handler (Cloud / Local)
│   │   └── uploads.module.ts
│   │
│   ├── admin/                        # Administrative Control & Dashboard
│   │   ├── admin.controller.ts       # Master dashboard statistics & user audit
│   │   ├── admin.service.ts          # Aggregate system metrics
│   │   └── admin.module.ts
│   │
│   ├── analytics/                    # Platform Usage & Scan Telemetry
│   │   ├── analytics.controller.ts   # System registration analytics
│   │   ├── analytics.service.ts      # Data aggregation service
│   │   └── analytics.module.ts
│   │
│   └── scheduler/                    # Automated Cron Jobs
│       ├── scheduler.module.ts
│       ├── reminder.job.ts           # Daily midnight document & tax expiry notification job
│       └── cleanup.job.ts            # Weekly system cleanup job
│
├── prisma/
│   ├── schema.prisma                 # Master relational database schema
│   ├── migrations/                   # PostgreSQL migration scripts
│   └── seed.ts                       # Database seed configuration
│
├── uploads/                          # Local file storage target directory
├── logs/                             # Application runtime log files
├── docs/                             # Additional project documentation
├── scripts/                          # Deployment & utility scripts
├── test/                             # E2E integration test suites
│
├── .env                              # Environment configuration secrets
├── .env.example                      # Sample environment variables template
├── package.json                      # Dependencies & project scripts
├── tsconfig.json                     # TypeScript compiler configuration & path aliases (@/*)
├── nest-cli.json                     # Nest CLI configuration
└── README.md                         # Project documentation
```

---

## ✨ System Features

- **🔐 Authentication & RBAC**: JWT Access & Refresh token rotation, bcrypt password hashing, and Role-Based Access Control (`USER`, `DRIVER`, `FLEET_MANAGER`, `ADMIN`).
- **🚘 Digital Bluebook & Vehicle Management**: Vehicle registration, color, engine/chassis identification, ownership verification, and digital bluebook management.
- **📱 Dynamic QR Telemetry & Public Scanner**: Auto-generation of vehicle QR codes and public scanner API for emergency identification and vehicle owner contact.
- **🅿️ Parking Automation**: Parking spot check-in/check-out with duration tracking and automated fee calculation.
- **🚨 SOS Emergency Alerts**: One-touch SOS alert trigger broadcasting vehicle location and priority level to contacts.
- **⚠️ Suspicious Activity Reporting**: Incident submission for suspicious or stolen vehicles.
- **📄 Digital Document Vault & Expiry Monitoring**: Storage for bluebook scans, tax tokens, and driver licenses with automated expiry alerts.
- **🇳🇵 Integrated Nepal Payment Gateways**:
  - **eSewa**: Native HMAC SHA256 signature generation and transaction verification.
  - **Khalti**: EPAY API initiation and verification.
  - **Fonepay**: Dynamic merchant QR generation for instant mobile banking payments.
- **🔔 Multi-Channel Notification Engine**: Multi-channel dispatcher supporting Firebase Cloud Messaging (FCM) push notifications, SMS Gateway, and SMTP Email.
- **👨‍👩‍👧 Family Vehicle Sharing**: Delegate read/write vehicle access permissions to family members.
- **🚚 Fleet & Driver Rosters**: Manage commercial vehicle fleets, driver assignments, and organization rosters.
- **📡 Real-Time GPS Telemetry**: Ingest real-time GPS telemetry location coordinates from Traccar server and generic GPS hardware.
- **🛠️ Roadside Assistance & Towing Dispatch**: Emergency roadside request handling and towing service dispatching.
- **📜 Insurance Policy Management**: Insurance coverage tracking, policy dates, and premium management.
- **📊 Admin Dashboard & Usage Analytics**: Comprehensive statistics on total users, registered vehicles, active QR scans, and revenue telemetry.
- **⏰ Background Scheduler**: Automated daily cron jobs (`reminder.job.ts`) for tax/insurance renewal reminders and weekly database cleanup (`cleanup.job.ts`).
- **🏥 System Health Probes**: Dedicated `/api/v1/health` and `/api/v1/health/liveness` endpoints for memory usage, database ping, and container orchestration probes.

---

## 🛠️ Tech Stack & Infrastructure

- **Framework**: NestJS (v10)
- **Language**: TypeScript (v5)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM (v5)
- **Security & Headers**: Helmet, CORS, Rate Limiting (`@nestjs/throttler`)
- **Performance**: Response Compression (`compression`), Gzip
- **Tracing**: Request ID Correlation (`x-request-id` header via `uuid`)
- **API Spec**: OpenAPI 3.0 (Swagger UI at `/docs`)

---

## ⚙️ Environment Variables Configuration (`.env`)

```env
# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database (PostgreSQL / Prisma)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vehicle_identity_db?schema=public"

# JWT Configuration
JWT_SECRET=super-secret-jwt-key-vehicle-identity-2026
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=super-secret-refresh-key-vehicle-identity-2026
JWT_REFRESH_EXPIRATION=7d

# Mail Server Configuration
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=smtp_username
MAIL_PASS=smtp_password
MAIL_FROM="Vehicle Identity System <noreply@vehicleidentity.com>"

# SMS Configuration
SMS_API_KEY=sample_sms_api_key
SMS_SENDER_ID=VEHICLE_ID

# Storage / Upload Configuration
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads

# Payment Gateways (Nepal)
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBmUzBxWgH5
KHAKTI_SECRET_KEY=test_secret_key_khalti
FONEPAY_MERCHANT_CODE=TEST_FONEPAY

# Firebase Push Notifications
FIREBASE_PROJECT_ID=vehicle-identity-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@vehicle-identity-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSAMPLE\n-----END PRIVATE KEY-----"
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Migration & Client Generation

```bash
# Generate Prisma Client
npx prisma generate

# Execute Database Migration
npx prisma migrate dev --name init

# Seed Initial Master Data (System Admin)
npx prisma db seed
```

### 3. Execution

```bash
# Development Mode (With Watcher)
npm run start:dev

# Production Build & Start
npm run build
npm run start:prod
```

---

## 📚 API Documentation & Interactive Swagger UI

Once the application is running, the interactive Swagger UI is available at:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

### Key Features of the API Documentation:
- **Bearer Authentication**: Click **Authorize** and input your JWT Access Token (`Bearer <token>`).
- **Module Grouping**: Organised by tags (`Auth`, `Users`, `Vehicles`, `QR`, `Parking`, `Emergency`, `Payments`, etc.).
- **Standard Envelope Schemas**: All responses follow standardized success (`ApiResponseDto`) and error (`ApiErrorResponseDto`) envelopes.
- **Request Tracing**: All API responses expose the correlation header `x-request-id`.
