# Migration Guide: Vite → Next.js 14 + tRPC

This guide helps you understand the architectural changes and how to migrate existing components.

## 🔄 Major Changes

### Framework Migration
- **Before:** Vite + React + React Router
- **After:** Next.js 14 with App Router

### API Layer
- **Before:** Vercel serverless functions (`/api/*`)
- **After:** tRPC routers with type-safe procedures

### Authentication
- **Before:** Supabase Auth
- **After:** JWT + Redis sessions

### Architecture
- **Before:** Feature-based structure
- **After:** Domain-Driven Design (DDD)

---

## 📁 Directory Structure Changes

### Old Structure (Vite)
```
src/
├── components/       # Shared components
├── hooks/           # Custom hooks
├── pages/           # Page components
├── types/           # TypeScript types
└── main.tsx         # Entry point

api/                 # Vercel API routes
├── auth/
├── inspections.ts
├── locations.ts
└── ...
```

### New Structure (Next.js + DDD)
```
src/
├── domain/              # Business logic
│   ├── entities/       # Domain models
│   └── repositories/   # Data interfaces
│
├── infrastructure/      # External services
│   ├── database/       # Supabase + Repositories
│   ├── cache/          # Redis
│   └── auth/           # JWT + Sessions
│
├── server/             # tRPC backend
│   ├── routers/        # API routers
│   └── trpc.ts         # Configuration
│
├── app/                # Next.js App Router
│   ├── (auth)/        # Auth pages
│   ├── (dashboard)/   # Dashboard pages
│   └── api/trpc/      # tRPC endpoint
│
├── lib/                # Utilities
│   └── trpc/          # tRPC client
│
├── components/         # Shared UI (unchanged)
├── hooks/             # Custom hooks (unchanged)
└── types/             # TypeScript types (unchanged)
```

---

## 🔌 API Migration

### Old Way: Vercel Functions
```typescript
// api/inspections.ts
export default async function handler(req, res) {
  const { data } = await supabase
    .from('inspections')
    .select('*');

  return res.json(data);
}

// Frontend
const response = await fetch('/api/inspections');
const data = await response.json();
```

### New Way: tRPC
```typescript
// src/server/routers/inspection.ts
export const inspectionRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return inspectionRepo.list(input.limit);
    }),
});

// Frontend
const { data } = trpc.inspection.list.useQuery({ limit: 50 });
```

**Benefits:**
- ✅ Full type safety
- ✅ Auto-completion
- ✅ No manual API calls
- ✅ Built-in caching via React Query

---

## 🔐 Authentication Migration

### Old Way: Supabase Auth
```typescript
// Login
const { user } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Get user
const { data: { user } } = await supabase.auth.getUser();
```

### New Way: JWT + Redis + tRPC
```typescript
// Login
const { token, user } = await trpc.auth.login.mutate({
  email,
  password,
});
localStorage.setItem('auth_token', token);

// Get user
const { data: user } = trpc.auth.me.useQuery();
```

**Benefits:**
- ✅ Stateless JWT tokens
- ✅ Redis session storage
- ✅ Better scalability
- ✅ Token refresh mechanism

---

## 🧩 Component Migration

### Migrating Pages

**Old (Vite):**
```typescript
// src/pages/InspectionPage.tsx
import { useNavigate } from 'react-router-dom';

export default function InspectionPage() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/dashboard')}>
        Back
      </button>
    </div>
  );
}
```

**New (Next.js):**
```typescript
// src/app/(dashboard)/inspections/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function InspectionPage() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push('/dashboard')}>
        Back
      </button>
    </div>
  );
}
```

**Key Changes:**
- `useNavigate` → `useRouter` (from 'next/navigation')
- `navigate('/path')` → `router.push('/path')`
- File location: `src/pages/` → `src/app/`
- Add `'use client'` directive for client components

### Migrating API Calls

**Old:**
```typescript
// Custom hook with fetch
const useInspections = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inspections')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
```

**New:**
```typescript
// Use tRPC hook directly
const { data, isLoading } = trpc.inspection.list.useQuery();
```

**Benefits:**
- Less boilerplate
- Automatic refetching
- Built-in caching
- Type safety

### Migrating Forms

**Old:**
```typescript
const handleSubmit = async (data) => {
  const response = await fetch('/api/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create');
  }
};
```

**New:**
```typescript
const createMutation = trpc.inspection.create.useMutation({
  onSuccess: () => {
    toast.success('Created successfully');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const handleSubmit = (data) => {
  createMutation.mutate(data);
};
```

---

## 🗃️ Database Access Migration

### Old Way: Direct Supabase
```typescript
// In component or API route
const { data } = await supabase
  .from('inspections')
  .select('*')
  .eq('location_id', locationId);
```

### New Way: Repository Pattern + tRPC
```typescript
// 1. Define in Repository
class InspectionRepository implements IInspectionRepository {
  async findByLocation(locationId: string): Promise<Inspection[]> {
    const { data } = await this.supabase
      .from('inspections')
      .select('*')
      .eq('location_id', locationId);

    return data.map(this.mapToEntity);
  }
}

// 2. Use in tRPC Router
export const inspectionRouter = router({
  getByLocation: protectedProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ input }) => {
      return inspectionRepo.findByLocation(input.locationId);
    }),
});

// 3. Use in Component
const { data } = trpc.inspection.getByLocation.useQuery({
  locationId: 'abc123'
});
```

**Benefits:**
- ✅ Separation of concerns
- ✅ Testable business logic
- ✅ Consistent data access patterns
- ✅ Type-safe end-to-end

---

## 🛡️ Protected Routes Migration

### Old Way: Route Guards
```typescript
// Custom ProtectedRoute component
<Routes>
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
</Routes>
```

### New Way: Middleware + Auth Check
```typescript
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check happens in tRPC context
  // Unauthorized requests throw UNAUTHORIZED error
  return <>{children}</>;
}
```

Authentication is handled at the tRPC level via `protectedProcedure`.

---

## 🎨 Styling Migration

No changes needed! Tailwind CSS works the same way.

```typescript
// Both old and new
<div className="flex items-center justify-between p-4">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

---

## 📦 Environment Variables

### Old (.env)
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_CLOUDINARY_CLOUD_NAME=...
```

### New (.env)
```env
# Public (client-side)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

# Private (server-side only)
SUPABASE_SERVICE_KEY=...
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=...
JWT_SECRET=...
```

**Key Changes:**
- `VITE_*` → `NEXT_PUBLIC_*` for client-side vars
- Server-only vars don't need prefix

---

## 🚀 Migration Checklist

### For Each Page Component:
- [ ] Move from `src/pages/` to `src/app/`
- [ ] Add `'use client'` if using hooks/state
- [ ] Update `useNavigate` → `useRouter`
- [ ] Update `Link` import to `next/link`

### For Each API Call:
- [ ] Identify equivalent tRPC procedure
- [ ] Replace `fetch()` with `trpc.*.useQuery()` or `useMutation()`
- [ ] Remove manual loading/error states
- [ ] Update TypeScript types

### For Authentication:
- [ ] Replace Supabase auth with tRPC auth procedures
- [ ] Update token storage (localStorage)
- [ ] Update protected route logic

### General:
- [ ] Update imports for Next.js modules
- [ ] Test all functionality
- [ ] Remove unused old code

---

## 📚 Useful Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

## 💡 Tips & Best Practices

1. **Use Server Components when possible**
   - Faster initial load
   - Smaller bundle size
   - Only add `'use client'` when needed

2. **Leverage tRPC Caching**
   - Data is automatically cached
   - Use `refetch()` or `invalidate()` to update

3. **Keep Repository Logic Simple**
   - One repository per entity
   - Pure data access, no business logic

4. **Use TypeScript Strictly**
   - Define types in domain entities
   - Let tRPC infer types automatically

5. **Test Incrementally**
   - Migrate one feature at a time
   - Keep old code until migration is complete

---

## ❓ Common Issues

### Issue: "Module not found" errors
**Solution:** Update imports to use path aliases:
```typescript
// Old
import { Button } from '../../../components/Button';

// New
import { Button } from '@/components/Button';
```

### Issue: "Client Component needed" error
**Solution:** Add `'use client'` directive at top of file:
```typescript
'use client';

import { useState } from 'react';
// ...
```

### Issue: API returns 401 Unauthorized
**Solution:** Check if token is being sent:
```typescript
// In tRPC Provider
headers() {
  const token = localStorage.getItem('auth_token');
  return {
    authorization: token ? `Bearer ${token}` : '',
  };
}
```

---

## 🆘 Need Help?

1. Check the [README.md](./README.md) for setup instructions
2. Review existing migrated code in `src/app/` for examples
3. Consult tRPC router definitions in `src/server/routers/`
4. Check domain entities in `src/domain/entities/`

Good luck with the migration! 🚀
