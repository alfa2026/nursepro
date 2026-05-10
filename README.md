# PRO Nurse Enterprise ERP

A comprehensive, production-ready hospital management system built with Next.js 16, React 19, Firebase, and Tailwind CSS 4. Designed for Saudi Arabian healthcare institutions with full Arabic/English bilingual support.

## Features

### Core Modules
- **Dashboard** - Real-time hospital overview with department occupancy, staff distribution, and alerts
- **Staff Management** - Employee profiles, HR records, attendance tracking, performance reviews
- **Departments** - Department management, bed tracking, isolation cases, patient management
- **Scheduling & Roster** - Shift scheduling, monthly roster, shift preferences, overtime tracking
- **Attendance** - Check-in/out, late tracking, absence reports, auto-checkout
- **Leave Management** - Leave requests, approvals, balance tracking (annual, sick, emergency, etc.)
- **Payroll** - Salary processing, allowances, deductions, overtime calculations

### Clinical Modules
- **Vital Signs Monitoring** - Real-time patient vitals tracking
- **Early Warning Score (EWS)** - Clinical deterioration detection
- **Handover (SBAR)** - Structured shift handover with SBAR format
- **Emergency Codes** - Code Blue/Red/Black activation and response tracking
- **Quick Response** - Emergency response coordination
- **Incidents** - Incident reporting, investigation, and resolution
- **Quality Indicators** - Clinical quality metrics and trending

### Administrative Modules
- **Reports** - Customizable report generation and approval workflows
- **Notifications** - Real-time push notifications with priority levels
- **Messages** - Internal messaging system with threading
- **Announcements** - Organization-wide announcements
- **Policies** - Policy document management
- **Training** - Staff training and certification tracking
- **Equipment** - Medical equipment inventory and maintenance
- **Inventory** - Supply management with stock alerts
- **Maintenance** - Facility maintenance tracking
- **Meals** - Patient and staff meal management
- **Archive** - Document archival system

### System Administration
- **User Management** - User creation, role assignment, status management
- **Role Management** - Dynamic role creation with granular permissions
- **Permissions** - Module-level permission control
- **Audit Logs** - Complete audit trail of all system actions
- **Settings** - Hospital-wide configuration
- **Dashboard Config** - Customizable dashboard widgets

### Organization
- **Org Chart** - Visual organizational hierarchy
- **Hierarchy Management** - Department/team structure
- **Workflow Engine** - Configurable approval workflows
- **Dynamic Roles** - Enhanced role system with department scoping

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16.2.4 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| Backend | Firebase (Firestore, Auth, Realtime DB, Storage) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | React Context + Firestore subscriptions |
| Language | TypeScript 5.7 |
| Icons | Lucide React |

## Prerequisites

- Node.js 22+ (LTS recommended)
- npm 10+ or pnpm
- Firebase project (Blaze plan recommended for production)

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd pronurse-enterprise-erp
npm install
```

### 2. Configure Firebase

Copy the environment template and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-xxxxxxxxxx
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use an existing one
3. Enable **Authentication** (Email/Password + Google provider)
4. Enable **Cloud Firestore** (start in production mode)
5. Deploy security rules:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Demo Mode

If Firebase is not configured (no `.env.local`), the app runs in **demo mode** with sample data. Demo credentials:

| Role | Email | Employee Code | Password |
|------|-------|--------------|----------|
| Super Admin | admin@pronurse.com | ADM001 | admin123 |
| HR Manager | hr@pronurse.com | HR001 | hr123 |
| Head Nurse | nurse@pronurse.com | NRS001 | nurse123 |
| Doctor | doctor@pronurse.com | DOC001 | doctor123 |
| Receptionist | reception@pronurse.com | REC001 | reception123 |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
npm i -g vercel
vercel --prod
```

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Docker

```bash
# Build
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your-key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-id \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id \
  -t pronurse-erp .

# Run
docker run -p 3000:3000 pronurse-erp
```

Note: For Docker, set `BUILD_STANDALONE=true` environment variable during build.

### VPS / Cloud Hosting

```bash
# Build static export
npm run build

# The output is in the 'out' directory
# Serve with nginx, Apache, or any static file server

# Example with nginx:
# server {
#   listen 80;
#   root /path/to/out;
#   location / {
#     try_files $uri $uri/ /index.html;
#   }
# }
```

## Project Structure

```
pronurse-enterprise-erp/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/          # Dashboard layout group (authenticated)
│   │   ├── dashboard/        # Main dashboard
│   │   ├── staff/            # Staff management
│   │   ├── departments/      # Department management
│   │   ├── admin/            # Admin panel
│   │   ├── organization/     # Org hierarchy
│   │   └── ...               # 50+ modules
│   ├── login/                # Authentication
│   ├── pending-approval/     # Post-registration waiting
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing/redirect
├── components/
│   ├── ui/                   # shadcn/ui components (40+)
│   ├── dashboard/            # Dashboard-specific components
│   ├── layout/               # Layout components (sidebar, topbar)
│   └── notifications/        # Notification components
├── contexts/
│   ├── auth-context.tsx      # Authentication & authorization
│   ├── lang-context.tsx      # Language (AR/EN) management
│   └── notification-context.tsx  # Real-time notifications
├── hooks/
│   ├── use-firestore.ts      # Firestore collection/document hooks
│   ├── use-realtime.ts       # Firebase Realtime DB hooks
│   ├── use-mobile.ts         # Mobile detection
│   └── use-toast.ts          # Toast notifications
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   ├── firebase-services.ts  # Generic Firestore CRUD
│   ├── collections.ts        # Module-specific service layer
│   ├── organization-services.ts  # Org hierarchy services
│   ├── seed-data.ts          # Initial data seeding
│   ├── pending-users.ts      # Pending user management
│   └── utils.ts              # Utility functions
├── types/
│   ├── index.ts              # Core type definitions (830+ lines)
│   └── organization.ts       # Organization-specific types
├── config/
│   └── navigation.ts         # Sidebar navigation config
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore composite indexes
├── storage.rules             # Firebase Storage security rules
├── firebase.json             # Firebase deployment config
├── vercel.json               # Vercel deployment config
├── Dockerfile                # Docker deployment
└── .env.local.example        # Environment variables template
```

## Firebase Architecture

### Firestore Collections

| Collection | Description |
|-----------|------------|
| `users` | User profiles and authentication data |
| `roles` | Role definitions with permissions |
| `permissions` | System permission definitions |
| `departments` | Department configuration |
| `shifts` | Shift assignments |
| `shiftTemplates` | Reusable shift templates |
| `attendance` | Attendance records |
| `leaveRequests` | Leave/vacation requests |
| `leaveBalances` | Annual leave balances |
| `notifications` | Push notifications |
| `messages` | Internal messages |
| `reports` | Generated reports |
| `auditLogs` | System audit trail |
| `settings` | Hospital settings |
| `equipment` | Medical equipment |
| `inventory` | Supply inventory |
| `training` | Training programs |
| `certifications` | Staff certifications |
| `incidents` | Incident reports |
| `qualityIndicators` | Quality metrics |
| `payroll` | Payroll records |
| `emergencyCodes` | Emergency activations |
| `activities` | Activity feed |
| `orgUnits` | Organizational units |
| `positions` | Employee positions |
| `dynamicRoles` | Enhanced roles |
| `workflows` | Workflow definitions |
| `workflowInstances` | Active workflow instances |

### Security Rules

Role-based access control implemented in `firestore.rules`:
- **Super Admin**: Full system access
- **Hospital Admin**: All except system settings
- **HR**: User management, payroll, training
- **Head Nurse / Department Manager**: Department-scoped access
- **Nurse / Doctor**: Read-only with self-service operations
- **Receptionist**: Limited front-desk operations

### Real-time Synchronization

All data uses Firestore `onSnapshot` for real-time updates:
- Dashboard stats update live across all connected clients
- Notifications are pushed in real-time
- Activity feed shows live updates
- User presence tracked via Realtime Database

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | Google Analytics ID |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | No | Realtime Database URL |
| `NEXT_PUBLIC_WHATSAPP_API_URL` | No | WhatsApp Business API |
| `NEXT_PUBLIC_WHATSAPP_API_TOKEN` | No | WhatsApp API token |
| `BUILD_STANDALONE` | No | Set to `true` for Docker builds |

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## License

Proprietary - All rights reserved.
