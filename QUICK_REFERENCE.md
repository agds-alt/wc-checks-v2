# WC-Checks-v2 Quick Reference Guide

## Key File Paths

### Frontend Entry Points
- **Main App**: `/home/user/wc-checks-v2/src/App.tsx` - Route configuration, lazy loading
- **Entry**: `/home/user/wc-checks-v2/src/main.tsx` - React root mount
- **Build Config**: `/home/user/wc-checks-v2/vite.config.ts` - Vite settings, proxying, code splitting

### Core Services
- **Supabase Client**: `/home/user/wc-checks-v2/src/lib/supabase.ts` - Database connection
- **Auth Hook**: `/home/user/wc-checks-v2/src/hooks/useAuth.ts` - User authentication
- **Cloudinary**: `/home/user/wc-checks-v2/src/lib/cloudinary.ts` - Image uploads
- **PDF Export**: `/home/user/wc-checks-v2/src/lib/pdfGenerator.ts` - Report generation

### Database Schema
- **Types**: `/home/user/wc-checks-v2/src/types/database.types.ts` - Auto-generated Supabase types
- **Inspection Types**: `/home/user/wc-checks-v2/src/types/inspection.types.ts` - Domain models

### API Backend
- **Role Guard**: `/home/user/wc-checks-v2/api/middleware/role-guard.ts` - Auth & role validation
- **Auth Verify**: `/home/user/wc-checks-v2/api/auth/verify-role.ts` - Role verification endpoint
- **User Inspections**: `/home/user/wc-checks-v2/api/inspections.ts` - Inspection CRUD
- **Admin Endpoints**: `/home/user/wc-checks-v2/api/admin/` - Admin-only operations

---

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (port 5174)
npm run type-check      # Check TypeScript errors
npm run lint            # Run ESLint

# Production
npm run build           # Build for Vercel deployment
npm run preview         # Preview production build

# Environment
cp .env.example .env    # Setup environment variables
```

---

## Environment Variables

### Required for Frontend
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
```

### Required for Backend (Vercel)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## Architecture Overview

```
Frontend (React/Vite)
    ↓ (HTTP + JWT)
Vercel Serverless API
    ↓ (Service Role)
Supabase Database (PostgreSQL)
    
Images: Cloudinary
```

---

## Important Paths & Structures

### Page Components
```
src/pages/
├── LoginPage.tsx           # Public page
├── Dashboard.tsx           # Protected, lazy-loaded
├── InspectionPage.tsx      # Inspection form, lazy-loaded
├── ReportsPage.tsx         # Reports, lazy-loaded
├── admin/                  # Admin pages, all lazy-loaded
└── superadmin/            # Super admin pages
```

### Custom Hooks (15 total)
```
src/hooks/
├── useAuth.ts             # Authentication
├── useInspection.ts       # Single inspection ops
├── useInspections.ts      # Inspection list queries
├── useLocations.ts        # Location management
├── useBuildings.ts        # Building management
├── useOrganizations.ts    # Organization ops
├── useReports.ts          # Report data
├── useQRScanner.ts        # QR scanning
├── useIsAdmin.ts          # Admin check
├── useUserRoles.ts        # Role management
└── [other specialized hooks]
```

### Database Tables
```
users
├── Relationships:
│   ├── 1:many → user_roles (roles)
│   ├── 1:many → buildings (created_by)
│   └── many:1 → user_occupations
│
organizations
├── 1:many → buildings
└── 1:many → locations
│
buildings
└── 1:many → locations
│
locations
└── 1:many → inspection_records
│           └── 1:many → photos
│
roles
└── many ← user_roles
│
inspection_templates
└── 1:many ← inspection_records
```

---

## Role Hierarchy

| Level | Name | Permissions |
|-------|------|------------|
| 0 | User | Create/view own inspections |
| 50 | Auditor | View/verify inspections |
| 80 | Admin | Manage locations, buildings, templates |
| 90+ | Super Admin | Manage users, roles, organizations |

---

## Key Features

### Inspection System
- **Scoring**: 11 components (aroma, cleanliness, availability, etc.)
- **Ratings**: good/normal/bad/other
- **Photos**: Cloudinary storage with optional field references
- **Templates**: Customizable inspection forms

### QR Code System
- **Generation**: `qrcode.react` creates QR codes
- **Scanning**: `html5-qrcode` for mobile scanning
- **Storage**: Encoded in `locations.qr_code` field
- **Use**: Quick location lookup

### Authentication
- **Method**: Supabase JWT tokens
- **Storage**: Local storage via `authStorage.ts`
- **Verification**: Backend validates all API requests
- **Prevention**: Frontend role spoofing prevented by server-side checks

### State Management
- **Global**: Zustand (auth state, app config)
- **Server**: React Query (inspections, locations, reports)
- **Caching**: 2-min stale time, 5-min gc time

---

## Development Tips

### Adding a New Page
1. Create in `/src/pages/`
2. Add export for lazy loading compatibility
3. Add route in `src/App.tsx` (lazy-loaded if heavy)
4. Add navigation link if needed

### Adding an API Endpoint
1. Create file in `/api/` directory
2. Use `validateAuth(req, minLevel)` from middleware
3. Use standard response format: `successResponse()` / `errorResponse()`
4. Deploy with `npm run build` → Vercel automatic deployment

### Adding a New Hook
1. Create in `/src/hooks/`
2. Use React Query for server state (`useQuery`, `useMutation`)
3. Export with named export
4. Use `useAuth()` for user context

### Adding Database Types
- Auto-generate with: `supabase gen types typescript --project-id YOUR_ID > src/types/database.types.ts`
- Never manually edit `database.types.ts`

---

## Performance Considerations

### Bundle Size
- Main vendor: ~782KB (React is large, 1000KB limit)
- Separate chunks: admin, reports, inspection forms
- Lazy loading: All pages except login

### React Query Settings
- **Stale Time**: 2 minutes (balance freshness & performance)
- **GC Time**: 5 minutes (keep in memory)
- **Retry**: 1 attempt only (faster failures)
- **Refetch**: On window focus, mount, reconnect

### Image Handling
- **Compression**: Client-side before upload (browser-image-compression)
- **Storage**: Cloudinary (external CDN, faster delivery)
- **Responsive**: Multiple sizes if needed

---

## Security Checklist

- [ ] Service role key NEVER in frontend code
- [ ] JWT tokens validated on every API call
- [ ] Role levels checked server-side
- [ ] User status verified (is_active)
- [ ] Sensitive data in environment variables
- [ ] CORS properly configured
- [ ] RLS policies in Supabase enabled

---

## Debugging

### Frontend
- Enable `DebugPanel` in `App.tsx` for development info
- Check browser console for React Query logs
- Use `logger.error()` for structured logging
- React Dev Tools browser extension helpful

### Backend
- Check Vercel function logs in dashboard
- Console logs appear in `vercel logs` CLI
- Role validation logged in `role-guard.ts`

### Database
- Use Supabase SQL editor for direct queries
- Check RLS policies if data access denied
- Review user_roles and role tables for permission issues

---

## Common Patterns

### Calling API from Frontend
```typescript
const { data } = await fetch('/api/inspections', {
  headers: {
    Authorization: `Bearer ${token}`, // From useAuth
  }
}).then(r => r.json())
```

### Validating Auth in API
```typescript
const auth = await validateAuth(req, 80); // Requires admin level
if (!auth) return errorResponse(res, 401, 'Unauthorized');
```

### Using React Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['inspections', userId],
  queryFn: () => fetchInspections(userId)
})
```

### Toast Notifications
```typescript
import { toast } from './lib/toast'
toast.success('Inspection saved!')
toast.error('Failed to save inspection')
```

---

## Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Query**: https://tanstack.com/query/latest
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vercel Docs**: https://vercel.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
