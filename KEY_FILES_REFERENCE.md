# Key Files Reference - Complete Absolute Paths

## Frontend Core Files

### Application Entry
- `/home/user/wc-checks-v2/src/main.tsx` - React root mount point
- `/home/user/wc-checks-v2/src/App.tsx` - Main app component with routes
- `/home/user/wc-checks-v2/src/App.css` - Main styles

### Build Configuration
- `/home/user/wc-checks-v2/vite.config.ts` - Vite bundler configuration
- `/home/user/wc-checks-v2/tsconfig.json` - TypeScript configuration
- `/home/user/wc-checks-v2/tailwind.config.js` - Tailwind CSS theming
- `/home/user/wc-checks-v2/postcss.config.js` - PostCSS plugins
- `/home/user/wc-checks-v2/package.json` - NPM dependencies and scripts

---

## Frontend Core Services (src/lib/)

### Database & Authentication
- `/home/user/wc-checks-v2/src/lib/supabase.ts` - Supabase client initialization with validation
- `/home/user/wc-checks-v2/src/lib/supabase-with-logging.ts` - Enhanced Supabase with logging
- `/home/user/wc-checks-v2/src/lib/authStorage.ts` - JWT token persistence to local storage
- `/home/user/wc-checks-v2/src/lib/logger.ts` - Structured logging utility

### Feature Services
- `/home/user/wc-checks-v2/src/lib/cloudinary.ts` - Cloudinary image upload service
- `/home/user/wc-checks-v2/src/lib/photoService.ts` - Photo handling and management
- `/home/user/wc-checks-v2/src/lib/locationService.ts` - Location operations helper
- `/home/user/wc-checks-v2/src/lib/qrGeneratorService.ts` - QR code generation utility
- `/home/user/wc-checks-v2/src/lib/pdfGenerator.ts` - PDF export functionality
- `/home/user/wc-checks-v2/src/lib/exportUtils.ts` - Data export utilities

### State Management
- `/home/user/wc-checks-v2/src/lib/queryClient.ts` - React Query configuration
- `/home/user/wc-checks-v2/src/lib/utils.ts` - General utility functions

### UI
- `/home/user/wc-checks-v2/src/lib/toast.tsx` - Toast notification wrapper

---

## Custom Hooks (src/hooks/)

### Core Authentication & Authorization
- `/home/user/wc-checks-v2/src/hooks/useAuth.ts` - User authentication state and methods
- `/home/user/wc-checks-v2/src/hooks/useIsAdmin.ts` - Admin role checking
- `/home/user/wc-checks-v2/src/hooks/useUserRoles.ts` - User role management

### Domain Data Hooks
- `/home/user/wc-checks-v2/src/hooks/useInspection.ts` - Single inspection CRUD operations
- `/home/user/wc-checks-v2/src/hooks/useInspections.ts` - List and query inspections
- `/home/user/wc-checks-v2/src/hooks/useLocations.ts` - Location data operations
- `/home/user/wc-checks-v2/src/hooks/useBuildings.ts` - Building management
- `/home/user/wc-checks-v2/src/hooks/useOrganizations.ts` - Organization operations
- `/home/user/wc-checks-v2/src/hooks/useReports.ts` - Report data queries

### Admin Hooks
- `/home/user/wc-checks-v2/src/hooks/useAdminInspections.ts` - Admin inspection oversight
- `/home/user/wc-checks-v2/src/hooks/useAdminStats.ts` - Admin statistics
- `/home/user/wc-checks-v2/src/hooks/useAuditLogs.ts` - Audit log querying

### Feature Hooks
- `/home/user/wc-checks-v2/src/hooks/useQRScanner.ts` - QR code scanning
- `/home/user/wc-checks-v2/src/hooks/useHaptic.ts` - Haptic feedback
- `/home/user/wc-checks-v2/src/hooks/usePerformance.ts` - Performance monitoring

---

## Type Definitions (src/types/)

### Database Schema Types (Auto-generated)
- `/home/user/wc-checks-v2/src/types/database.types.ts` - Supabase schema types (DO NOT EDIT MANUALLY)

### Domain Models
- `/home/user/wc-checks-v2/src/types/inspection.types.ts` - Inspection components, ratings, configurations
- `/home/user/wc-checks-v2/src/types/location.types.ts` - Location types
- `/home/user/wc-checks-v2/src/types/photo.types.ts` - Photo types
- `/home/user/wc-checks-v2/src/types/pdf.types.ts` - PDF export types

### Utilities
- `/home/user/wc-checks-v2/src/types/typeGuards.ts` - Type guard functions
- `/home/user/wc-checks-v2/src/types/media-devices.d.ts` - Media device ambient types
- `/home/user/wc-checks-v2/src/types/vite-env.d.ts` - Vite environment variable types

---

## Page Components (src/pages/)

### Authentication Pages (Eagerly Loaded)
- `/home/user/wc-checks-v2/src/pages/LoginPage.tsx` - User login
- `/home/user/wc-checks-v2/src/pages/RegisterPage.tsx` - User registration

### Main Pages (Lazy Loaded)
- `/home/user/wc-checks-v2/src/pages/Dashboard.tsx` - Main dashboard
- `/home/user/wc-checks-v2/src/pages/InspectionPage.tsx` - Inspection form entry
- `/home/user/wc-checks-v2/src/pages/LocationInspectionPage.tsx` - Location-specific inspection
- `/home/user/wc-checks-v2/src/pages/LocationsListPage.tsx` - Browse locations
- `/home/user/wc-checks-v2/src/pages/AddLocationPage.tsx` - Create new location
- `/home/user/wc-checks-v2/src/pages/ScanPage.tsx` - QR code scanning
- `/home/user/wc-checks-v2/src/pages/ReportsPage.tsx` - View inspection reports
- `/home/user/wc-checks-v2/src/pages/AnalyticsPage.tsx` - Analytics dashboard
- `/home/user/wc-checks-v2/src/pages/ProfilePage.tsx` - User profile
- `/home/user/wc-checks-v2/src/pages/ProfilePageWithAdmin.tsx` - Admin profile view
- `/home/user/wc-checks-v2/src/pages/SettingsPage.tsx` - User settings
- `/home/user/wc-checks-v2/src/pages/HelpPage.tsx` - Help documentation
- `/home/user/wc-checks-v2/src/pages/AboutPage.tsx` - About page
- `/home/user/wc-checks-v2/src/pages/TestPage.tsx` - Testing/debug page

### Admin Pages (Lazy Loaded, Level 80+)
- `/home/user/wc-checks-v2/src/pages/admin/AdminDashboard.tsx` - Admin main dashboard
- `/home/user/wc-checks-v2/src/pages/admin/LocationsManager.tsx` - Manage locations
- `/home/user/wc-checks-v2/src/pages/admin/BuildingsManager.tsx` - Manage buildings
- `/home/user/wc-checks-v2/src/pages/admin/OrganizationsManager.tsx` - Manage organizations
- `/home/user/wc-checks-v2/src/pages/admin/QRCodeGenerator.tsx` - Generate QR codes
- `/home/user/wc-checks-v2/src/pages/admin/OccupationManagerPage.tsx` - Manage occupations

### Super Admin Pages (Lazy Loaded, Level 90+)
- `/home/user/wc-checks-v2/src/pages/superadmin/UserManagement.tsx` - User management

---

## Components (src/components/)

### Layout Components
- `/home/user/wc-checks-v2/src/components/layout/MainLayout.tsx` - Main layout wrapper
- `/home/user/wc-checks-v2/src/components/layout/ProtectedLayout.tsx` - Protected route layout
- `/home/user/wc-checks-v2/src/components/layout/Sidebar.tsx` - Desktop sidebar

### Form Components
- `/home/user/wc-checks-v2/src/components/forms/ComprehensiveInspectionForm.tsx` - Main inspection form
- `/home/user/wc-checks-v2/src/components/forms/LocationForm.tsx` - Location creation form
- `/home/user/wc-checks-v2/src/components/forms/EnhancedPhotoUpload.tsx` - Photo upload component
- `/home/user/wc-checks-v2/src/components/forms/GeneralPhotoUpload.tsx` - General photo upload
- `/home/user/wc-checks-v2/src/components/forms/RatingSelector.tsx` - Rating selection UI
- `/home/user/wc-checks-v2/src/components/forms/InspectionSuccessModal.tsx` - Success modal
- `/home/user/wc-checks-v2/src/components/forms/InspectionFailedModal.tsx` - Error modal

### Mobile Components
- `/home/user/wc-checks-v2/src/components/mobile/Navbar.tsx` - Mobile top navbar
- `/home/user/wc-checks-v2/src/components/mobile/BottomNav.tsx` - Mobile bottom navigation
- `/home/user/wc-checks-v2/src/components/mobile/ScanModal.tsx` - Mobile QR scanner
- `/home/user/wc-checks-v2/src/components/mobile/Sidebar.tsx` - Mobile drawer
- `/home/user/wc-checks-v2/src/components/mobile/index.ts` - Mobile component exports

### Report Components
- `/home/user/wc-checks-v2/src/components/reports/CalendarView.tsx` - Calendar view for reports
- `/home/user/wc-checks-v2/src/components/reports/InspectionDetailModal.tsx` - Inspection details
- `/home/user/wc-checks-v2/src/components/reports/InspectionDrawer.tsx` - Inspection drawer
- `/home/user/wc-checks-v2/src/components/reports/PhotoReviewModal.tsx` - Photo review modal

### Admin Components
- `/home/user/wc-checks-v2/src/components/admin/AdminCard.tsx` - Admin dashboard card
- `/home/user/wc-checks-v2/src/components/admin/auth/AdminRoute.tsx` - Admin route guard
- `/home/user/wc-checks-v2/src/components/admin/auth/ProtectedRoute.tsx` - Generic route protection

### UI Components (Reusable)
- `/home/user/wc-checks-v2/src/components/ui/Button.tsx` - Button component
- `/home/user/wc-checks-v2/src/components/ui/Card.tsx` - Card component
- `/home/user/wc-checks-v2/src/components/ui/Input.tsx` - Input field
- `/home/user/wc-checks-v2/src/components/ui/Badge.tsx` - Badge component
- `/home/user/wc-checks-v2/src/components/ui/ActionButton.tsx` - Action button
- `/home/user/wc-checks-v2/src/components/ui/CameraUpload.tsx` - Camera upload
- `/home/user/wc-checks-v2/src/components/ui/LoadingSpinner.tsx` - Loading spinner
- `/home/user/wc-checks-v2/src/components/ui/Skeleton.tsx` - Skeleton loader
- `/home/user/wc-checks-v2/src/components/ui/StatCard.tsx` - Statistics card
- `/home/user/wc-checks-v2/src/components/ui/index.ts` - UI component exports

### Error Handling
- `/home/user/wc-checks-v2/src/components/ErrorBoundary.tsx` - React error boundary
- `/home/user/wc-checks-v2/src/components/DebugPanel.tsx` - Debug information panel

---

## Backend API Endpoints (api/)

### Authentication
- `/home/user/wc-checks-v2/api/auth/verify-role.ts` - GET - Verify JWT token and user role

### User Endpoints
- `/home/user/wc-checks-v2/api/profile.ts` - Profile GET/POST endpoints

### Data Endpoints
- `/home/user/wc-checks-v2/api/inspections.ts` - Inspection CRUD (GET, POST, PATCH, DELETE)
- `/home/user/wc-checks-v2/api/locations.ts` - Location operations (GET, POST, PATCH, DELETE)
- `/home/user/wc-checks-v2/api/templates.ts` - Inspection templates (GET, POST, PATCH, DELETE)
- `/home/user/wc-checks-v2/api/reports.ts` - Report generation and querying

### Admin Endpoints (Level 80+)
- `/home/user/wc-checks-v2/api/admin/users.ts` - User management
- `/home/user/wc-checks-v2/api/admin/inspections.ts` - Admin inspection oversight
- `/home/user/wc-checks-v2/api/admin/resources.ts` - Resource management
- `/home/user/wc-checks-v2/api/admin/stats.ts` - Admin statistics
- `/home/user/wc-checks-v2/api/admin/audit-logs.ts` - Audit trail access

### Middleware
- `/home/user/wc-checks-v2/api/middleware/role-guard.ts` - JWT validation & role checking

---

## Deployment Configuration

- `/home/user/wc-checks-v2/vercel.json` - Vercel deployment settings
- `/home/user/wc-checks-v2/.vercelignore` - Files to ignore in Vercel deployment
- `/home/user/wc-checks-v2/.gitignore` - Git ignore rules

---

## Environment & Documentation

- `/home/user/wc-checks-v2/.env.example` - Environment variables template
- `/home/user/wc-checks-v2/package.json` - NPM dependencies and scripts
- `/home/user/wc-checks-v2/README.md` - Project README
- `/home/user/wc-checks-v2/PROJECT_STRUCTURE_OVERVIEW.md` - Comprehensive structure overview (CREATED)
- `/home/user/wc-checks-v2/QUICK_REFERENCE.md` - Quick reference guide (CREATED)
- `/home/user/wc-checks-v2/KEY_FILES_REFERENCE.md` - This file

---

## Public Assets

- `/home/user/wc-checks-v2/public/manifest.json` - PWA manifest (if applicable)

---

## Quick Navigation

### To understand the app flow:
1. Start: `/home/user/wc-checks-v2/src/App.tsx` (routes)
2. Then: `/home/user/wc-checks-v2/src/pages/LoginPage.tsx` (entry point)
3. Then: `/home/user/wc-checks-v2/src/pages/Dashboard.tsx` (main screen)

### To understand the database:
1. Schema: `/home/user/wc-checks-v2/src/types/database.types.ts` (all tables)
2. Models: `/home/user/wc-checks-v2/src/types/inspection.types.ts` (domain objects)
3. Backend: `/home/user/wc-checks-v2/api/middleware/role-guard.ts` (how auth works)

### To add a new feature:
1. Backend: `/home/user/wc-checks-v2/api/` (create endpoint)
2. Frontend: `/home/user/wc-checks-v2/src/hooks/` (create hook)
3. UI: `/home/user/wc-checks-v2/src/pages/` or `/home/user/wc-checks-v2/src/components/` (add component)

### To debug:
1. Frontend logs: `/home/user/wc-checks-v2/src/lib/logger.ts` (check usage)
2. Backend logs: `/home/user/wc-checks-v2/api/middleware/role-guard.ts` (see debugging)
3. Database: Check Supabase console directly

