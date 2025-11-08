# WC-Checks-v2 Project Structure Overview

## Project Statistics
- **Total Lines of TypeScript/TSX Code**: ~13,600 lines
- **Framework**: Vite + React + TypeScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudinary (image/media)
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: Zustand + React Query

---

## 1. Framework Setup

### Vite Configuration
- **Config File**: `/home/user/wc-checks-v2/vite.config.ts`
- **Dev Server Port**: 5174
- **Proxy**: API calls proxied to `http://localhost:3000` (Vercel dev)
- **Build Target**: ES2020
- **Module Format**: ESNext

### Key Vite Optimizations:
- React chunk splitting (react-vendor, router-vendor, supabase-vendor)
- Code splitting for heavy features:
  - Admin pages
  - Reports & Analytics
  - Inspection form
- Terser minification with console drop in production
- Chunk size warning limit: 1000KB (React is large)

### TypeScript Configuration
- **Target**: ES2020
- **JSX**: react-jsx
- **Strict Mode**: Enabled
- **No unused locals/parameters**: Enforced
- **Module Resolution**: bundler

---

## 2. File/Folder Structure

```
/home/user/wc-checks-v2/
│
├── src/                          # Frontend source code
│   ├── App.tsx                  # Main app with route configuration
│   ├── main.tsx                 # Entry point
│   │
│   ├── pages/                   # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── InspectionPage.tsx
│   │   ├── LocationsListPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── ScanPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AddLocationPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── HelpPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── TestPage.tsx
│   │   │
│   │   ├── admin/                # Admin pages (lazy-loaded)
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── LocationsManager.tsx
│   │   │   ├── BuildingsManager.tsx
│   │   │   ├── OrganizationsManager.tsx
│   │   │   ├── QRCodeGenerator.tsx
│   │   │   └── OccupationManagerPage.tsx
│   │   │
│   │   └── superadmin/           # Super admin pages
│   │       └── UserManagement.tsx
│   │
│   ├── components/              # Reusable components
│   │   ├── ErrorBoundary.tsx
│   │   ├── DebugPanel.tsx
│   │   │
│   │   ├── forms/               # Form components
│   │   │   ├── ComprehensiveInspectionForm.tsx
│   │   │   ├── LocationForm.tsx
│   │   │   ├── EnhancedPhotoUpload.tsx
│   │   │   ├── GeneralPhotoUpload.tsx
│   │   │   ├── RatingSelector.tsx
│   │   │   ├── InspectionSuccessModal.tsx
│   │   │   ├── InspectionFailedModal.tsx
│   │   │   └── mobile/
│   │   │
│   │   ├── admin/               # Admin components
│   │   │   ├── AdminCard.tsx
│   │   │   └── auth/
│   │   │       ├── AdminRoute.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   │
│   │   ├── reports/             # Report components
│   │   │   ├── CalendarView.tsx
│   │   │   ├── InspectionDetailModal.tsx
│   │   │   ├── InspectionDrawer.tsx
│   │   │   └── PhotoReviewModal.tsx
│   │   │
│   │   ├── ui/                  # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ActionButton.tsx
│   │   │   ├── CameraUpload.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── mobile/              # Mobile-specific components
│   │   │   ├── Navbar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── ScanModal.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── ProtectedLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── App.css
│   │
│   ├── hooks/                   # Custom React hooks (15 total)
│   │   ├── useAuth.ts           # Authentication
│   │   ├── useInspection.ts     # Single inspection CRUD
│   │   ├── useInspections.ts    # Inspections list
│   │   ├── useLocations.ts      # Locations management
│   │   ├── useBuildings.ts      # Buildings management
│   │   ├── useOrganizations.ts  # Organizations
│   │   ├── useReports.ts        # Report data
│   │   ├── useQRScanner.ts      # QR code scanning
│   │   ├── useHaptic.ts         # Haptic feedback
│   │   ├── usePerformance.ts    # Performance monitoring
│   │   ├── useIsAdmin.ts        # Admin role check
│   │   ├── useUserRoles.ts      # User roles management
│   │   ├── useAdminInspections.ts
│   │   ├── useAdminStats.ts
│   │   └── useAuditLogs.ts
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── supabase.ts          # Supabase client with config validation
│   │   ├── supabase-with-logging.ts
│   │   ├── authStorage.ts       # Auth token storage
│   │   ├── logger.ts            # Logging utility
│   │   ├── cloudinary.ts        # Cloudinary upload service
│   │   ├── photoService.ts      # Photo handling
│   │   ├── locationService.ts   # Location operations
│   │   ├── qrGeneratorService.ts # QR code generation
│   │   ├── pdfGenerator.ts      # PDF export
│   │   ├── exportUtils.ts       # Data export utilities
│   │   ├── queryClient.ts       # React Query configuration
│   │   ├── toast.tsx            # Toast notifications
│   │   └── utils.ts             # General utilities
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── database.types.ts    # Auto-generated Supabase types
│   │   ├── inspection.types.ts  # Inspection-related types
│   │   ├── location.types.ts    # Location types
│   │   ├── photo.types.ts       # Photo types
│   │   ├── pdf.types.ts         # PDF types
│   │   ├── typeGuards.ts        # Type guard functions
│   │   ├── media-devices.d.ts   # Media device types
│   │   └── vite-env.d.ts        # Vite environment types
│   │
│   └── App.css
│
├── api/                         # Vercel serverless functions
│   ├── inspections.ts           # Inspection CRUD (all authenticated users)
│   ├── locations.ts             # Location operations
│   ├── profile.ts               # User profile endpoint
│   ├── templates.ts             # Inspection templates
│   ├── reports.ts               # Reports data endpoint
│   │
│   ├── admin/                   # Admin-only endpoints (level 80+)
│   │   ├── users.ts             # User management
│   │   ├── inspections.ts       # Admin inspection oversight
│   │   ├── resources.ts         # Resources management
│   │   ├── stats.ts             # Admin statistics
│   │   └── audit-logs.ts        # Audit trail
│   │
│   ├── auth/                    # Authentication endpoints
│   │   └── verify-role.ts       # Role verification (prevents frontend spoofing)
│   │
│   └── middleware/              # Shared middleware
│       └── role-guard.ts        # Auth validation & role checking
│
├── Configuration Files:
│   ├── vite.config.ts           # Vite build config
│   ├── tsconfig.json            # TypeScript config
│   ├── tsconfig.node.json       # Node TypeScript config
│   ├── tsconfig.api.json        # API TypeScript config
│   ├── package.json             # Dependencies
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js        # PostCSS config
│   ├── vercel.json              # Vercel deployment config
│   └── .env.example             # Environment variables template
│
├── public/                      # Static assets
│   └── manifest.json
│
├── .git/                        # Git repository
├── .gitignore
├── .vercelignore
├── README.md
└── [Documentation files...]
```

---

## 3. Dependencies in package.json

### Production Dependencies (Core Framework)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.26.0",
  "@tanstack/react-query": "^5.17.0",
  "zustand": "^5.0.8"
}
```

### Backend & Database
```json
{
  "@supabase/supabase-js": "^2.76.1",
  "supabase": "2.54.11",
  "@vercel/node": "^3.0.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.65.0",
  "@hookform/resolvers": "^3.10.0",
  "zod": "^3.25.76"
}
```

### UI & Components
```json
{
  "lucide-react": "^0.548.0",
  "react-hot-toast": "^2.6.0",
  "sonner": "^2.0.7",
  "tailwindcss": "^3.4.18",
  "tailwindcss-animate": "^1.0.7",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

### Features
```json
{
  "html5-qrcode": "^2.3.8",
  "jsqr": "^1.4.0",
  "qrcode": "^1.5.4",
  "qrcode.react": "3.1.0",
  "jspdf": "^3.0.3",
  "jspdf-autotable": "^5.0.2",
  "react-to-print": "^3.2.0",
  "cloudinary": "^2.8.0",
  "cloudinary-react": "^1.8.1",
  "browser-image-compression": "^2.0.2",
  "date-fns": "^2.30.0",
  "uuid": "^13.0.0",
  "nanoid": "^5.1.6"
}
```

### Dev Dependencies
```json
{
  "vite": "^5.4.11",
  "@vitejs/plugin-react": "^4.3.4",
  "typescript": "^5.9.3",
  "eslint": "^8.57.1",
  "@typescript-eslint/eslint-plugin": "^7.18.0",
  "@typescript-eslint/parser": "^7.18.0",
  "autoprefixer": "^10.4.21",
  "postcss": "^8.5.6",
  "postcss-import": "^16.1.1",
  "terser": "^5.44.0",
  "rollup-plugin-visualizer": "^6.0.5"
}
```

### Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "type-check": "tsc --noEmit",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

---

## 4. Domain Models & Entities

### Core Database Schema (Supabase/PostgreSQL)

#### **users** - User accounts
```typescript
{
  id: string (UUID)
  email: string
  full_name: string
  phone: string | null
  occupation_id: string | null (FK to user_occupations)
  profile_photo_url: string | null
  password_hash: string | null
  is_active: boolean
  last_login_at: timestamp | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### **organizations** - Tenant organizations
```typescript
{
  id: string (UUID)
  name: string
  short_code: string
  address: string | null
  email: string | null
  phone: string | null
  logo_url: string | null
  is_active: boolean
  created_by: string | null (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

#### **buildings** - Buildings within organizations
```typescript
{
  id: string (UUID)
  organization_id: string (FK)
  name: string
  short_code: string
  address: string | null
  type: string | null (e.g., "office", "mall", "school")
  total_floors: number | null
  is_active: boolean
  created_by: string | null (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

#### **locations** - Toilet locations within buildings
```typescript
{
  id: string (UUID)
  building_id: string (FK)
  organization_id: string (FK)
  name: string
  code: string | null
  qr_code: string (unique QR identifier)
  floor: string | null
  area: string | null
  section: string | null
  description: string | null
  photo_url: string | null
  coordinates: JSON | null (lat/lng)
  is_active: boolean
  created_by: string | null (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

#### **inspection_records** - Inspection submissions
```typescript
{
  id: string (UUID)
  user_id: string (FK)
  location_id: string (FK)
  template_id: string (FK)
  inspection_date: string (date)
  inspection_time: string (time)
  responses: JSON (structured inspection answers)
  photo_urls: string[] | null (Cloudinary URLs)
  overall_status: string ("good", "normal", "bad")
  notes: string | null
  duration_seconds: number | null
  verified_by: string | null (FK to users)
  verified_at: timestamp | null
  verification_notes: string | null
  submitted_at: timestamp | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### **inspection_templates** - Customizable inspection forms
```typescript
{
  id: string (UUID)
  name: string
  description: string | null
  fields: JSON (form field definitions)
  estimated_time: number | null (minutes)
  is_default: boolean
  is_active: boolean
  created_by: string | null (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

#### **photos** - Photo records with metadata
```typescript
{
  id: string (UUID)
  file_url: string (Cloudinary URL)
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  inspection_id: string | null (FK)
  location_id: string | null (FK)
  field_reference: string | null (which field in form)
  caption: string | null
  created_by: string | null (FK to users)
  is_deleted: boolean
  deleted_by: string | null (FK to users)
  deleted_at: timestamp | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### **roles** - Role definitions
```typescript
{
  id: string (UUID)
  name: string (e.g., "user", "admin", "superadmin")
  level: number (0=user, 50=auditor, 80=admin, 90+=superadmin)
  description: string | null
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

#### **user_roles** - User-to-role assignments
```typescript
{
  id: string (UUID)
  user_id: string (FK)
  role_id: string (FK)
  assigned_by: string | null (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

#### **user_occupations** - Job titles/occupations
```typescript
{
  id: string (UUID)
  name: string
  display_name: string
  description: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Database Views

#### **locations_with_details** - Enriched location data
Combines locations with building and organization details for easier querying.

### Database Functions
- `get_user_role_level()` - Returns user's role level
- `is_admin()` - Check if user is admin (level >= 80)
- `is_super_admin()` - Check if user is superadmin (level >= 90)
- `user_has_role_level(required_level)` - Role level check
- `user_has_any_role_level(required_levels)` - Multiple role check

### Frontend Type Definitions

**InspectionComponent** - Inspection aspects checked:
```typescript
type InspectionComponent = 
  | 'aroma'
  | 'floor_cleanliness'
  | 'wall_condition'
  | 'sink_condition'
  | 'mirror_condition'
  | 'toilet_condition'
  | 'urinal_condition'
  | 'soap_availability'
  | 'tissue_availability'
  | 'air_freshener'
  | 'trash_bin_condition'
```

**RatingChoice** - Component rating system:
```typescript
type RatingChoice = 'good' | 'normal' | 'bad' | 'other'
```

**ComponentRating** - Rating for each component:
```typescript
interface ComponentRating {
  component: InspectionComponent
  choice: RatingChoice
  notes?: string  // Required when choice === 'other'
  photo?: string  // Optional photo URL
}
```

---

## 5. API/Backend Setup

### Architecture
- **Platform**: Vercel Serverless Functions (Node.js)
- **Framework**: @vercel/node with TypeScript
- **Authentication**: JWT-based (Supabase Auth tokens)
- **Authorization**: Role-based access control (RBAC) with levels

### API Endpoints Structure

#### **Public/User Endpoints**
```
GET    /api/inspections              - List user's inspections
GET    /api/inspections?id=xxx       - Get specific inspection
POST   /api/inspections              - Create inspection
PATCH  /api/inspections?id=xxx       - Update inspection (own only)
DELETE /api/inspections?id=xxx       - Delete inspection (own only)

GET    /api/locations                - List locations
POST   /api/locations                - Create location
PATCH  /api/locations?id=xxx         - Update location
DELETE /api/locations?id=xxx         - Delete location

GET    /api/profile                  - Get user profile
POST   /api/profile                  - Update profile

GET    /api/templates                - List inspection templates
POST   /api/templates                - Create template
PATCH  /api/templates?id=xxx         - Update template

GET    /api/reports                  - Generate reports
GET    /api/reports?type=...         - Filtered reports
```

#### **Admin Endpoints** (Level 80+)
```
GET    /api/admin/inspections        - All organization inspections
POST   /api/admin/inspections/:id/verify - Verify inspection

GET    /api/admin/users              - User management
POST   /api/admin/users              - Create user
PATCH  /api/admin/users/:id/role     - Assign role
DELETE /api/admin/users/:id          - Deactivate user

GET    /api/admin/resources          - Resource management
POST   /api/admin/resources          - Create resource

GET    /api/admin/stats              - Admin statistics
GET    /api/admin/audit-logs         - Audit trail
```

#### **Auth Endpoints**
```
GET    /api/auth/verify-role         - Verify token & role (prevents frontend spoofing)
```

### API Middleware (`api/middleware/role-guard.ts`)
- **Authentication Validation**: JWT token verification
- **Role Verification**: Minimum role level enforcement
- **User Status Check**: Ensures user is active
- **Response Formatting**: Standard success/error response wrapper

### Authentication Flow
1. Frontend sends JWT token in `Authorization: Bearer <token>` header
2. Backend validates JWT signature and expiration
3. Backend queries `users` and `user_roles` tables
4. Backend checks role level against endpoint requirements
5. API responds with 401 if unauthorized, 403 if insufficient role level

### Role Hierarchy
```
Level 0   - Regular User
Level 50  - Auditor (can view/verify inspections)
Level 80  - Admin (can manage buildings, locations, templates)
Level 90+ - Super Admin (can manage users, roles, organizations)
```

---

## 6. Database Configuration

### Provider
- **Supabase** (PostgreSQL-based)
- **Region**: Configurable per project
- **Connection**: Secure HTTPS with anon key (frontend) and service role key (backend)

### Environment Variables Required

```env
# Frontend (safe to expose)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend (NEVER expose in frontend)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Image Storage (Cloudinary)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset-name
VITE_CLOUDINARY_FOLDER=toilet-inspections
```

### Supabase Features Used
- **Authentication**: Built-in Auth with JWT
- **Row-Level Security (RLS)**: Policies for data isolation
- **Realtime**: Optional subscriptions for live updates
- **Functions**: PostgreSQL functions for complex queries
- **Storage**: Via Cloudinary (external, not Supabase storage)

### Database Client Initialization
```typescript
// Frontend (with read-only anon key)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

// Backend (with service role key - full access)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
```

### Key Relationships
- Users → Organizations (multi-tenancy via created_by tracking)
- Organizations → Buildings (1-to-many)
- Buildings → Locations (1-to-many)
- Locations → Inspections (1-to-many)
- Inspections → Photos (1-to-many)
- Users → Roles (many-to-many via user_roles)
- Users → Occupations (many-to-1)

### Audit Trail
- All tables have `created_at`, `updated_at` timestamps
- Most entities track `created_by` and `updated_by` user IDs
- Photos track `deleted_by` and `deleted_at` for soft deletes
- Inspections can store `verified_by` and `verified_at` for verification

---

## 7. Key Services & Utilities

### Supabase Client (`src/lib/supabase.ts`)
- Validates environment variables
- Handles connection with retry logic (1 retry, 500ms delay, 5s timeout)
- Custom error classes: `SupabaseConfigError`, `SupabaseConnectionError`
- Typed with auto-generated Supabase types

### Authentication (`src/hooks/useAuth.ts`)
- JWT token management
- User session handling
- Login/logout functionality
- Role verification via `/api/auth/verify-role`

### Image Management
- **Cloudinary**: Primary image storage (external)
- **browser-image-compression**: Client-side image optimization
- **Upload Flow**: Compress → Upload to Cloudinary → Store URL in DB

### QR Code System
- **Generation**: `qrcode.react` for creating QR codes
- **Scanning**: `html5-qrcode` for mobile scanning
- **Format**: Location-specific QR codes stored in `locations.qr_code`

### PDF Export
- **Library**: `jspdf` + `jspdf-autotable`
- **Use Case**: Export inspection records and reports as PDFs

### State Management
- **Zustand**: Global app state (authentication, user data)
- **React Query**: Server state (inspections, locations, reports)
- **Local Storage**: Auth token persistence

### Notifications
- **Toast**: `react-hot-toast` + `sonner` for user feedback

### Form Validation
- **react-hook-form**: Form state management
- **Zod**: Schema validation (TypeScript-first)

---

## 8. Development Setup

### Commands
```bash
npm run dev          # Start Vite dev server (port 5174)
npm run build        # Build for production
npm run type-check   # TypeScript type checking
npm run lint         # ESLint checks
npm run preview      # Preview production build locally
```

### Tech Stack Summary
| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5.4 |
| Styling | Tailwind CSS + PostCSS |
| Routing | React Router DOM v6 |
| State (Global) | Zustand |
| State (Server) | React Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Notifications | Sonner + React Hot Toast |
| Backend | Vercel Serverless (Node.js) |
| Database | Supabase (PostgreSQL) |
| Image Storage | Cloudinary |
| PDF Export | jsPDF + jsPDF AutoTable |
| QR Codes | qrcode.react + html5-qrcode |
| Deployment | Vercel |

---

## 9. Important Notes

### Deployment
- Vercel serverless functions for API endpoints
- Frontend built with Vite and deployed to Vercel CDN
- All builds use `pnpm` (see `vercel.json`)

### Security
- Service role key never exposed in frontend
- JWT token validation on every API call
- Role-based access control enforced server-side
- RLS policies in database for additional protection

### Performance
- Lazy-loaded pages (except login/register)
- Code-split vendor chunks
- React Query with 2-minute stale time, 5-minute gc time
- Image compression before upload

### Mobile
- Dedicated mobile components for better UX
- QR code scanning for location lookup
- Haptic feedback support
- Responsive design with Tailwind CSS
