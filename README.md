# WC Check v2 - Toilet Inspection System

Modern toilet inspection and maintenance tracking system built with Next.js, tRPC, Redis, and Domain-Driven Design.

## 🚀 Features

- ✅ **tRPC** - Type-safe End-to-end API
- ✅ **Redis** - Session & Caching Layer
- ✅ **JWT** - Stateless Authentication
- ✅ **Domain-Driven Design (DDD)** - Clean Architecture
- ✅ **Repository Pattern** - Data Access Layer
- ✅ **Superjson** - Efficient Serialization
- ✅ **Next.js 14** - App Router & Server Components
- ✅ **TypeScript** - Full Type Safety
- ✅ **Tailwind CSS** - Modern UI Styling
- ✅ **Supabase** - PostgreSQL Database
- ✅ **Cloudinary** - Image Storage

## 📁 Project Structure (DDD)

```
src/
├── domain/                  # Core business logic (entities, interfaces)
│   ├── entities/           # Domain entities (User, Building, Inspection, etc.)
│   └── repositories/       # Repository interfaces
│
├── infrastructure/         # External concerns & implementations
│   ├── database/
│   │   ├── supabase/      # Supabase client
│   │   └── repositories/  # Repository implementations
│   ├── cache/             # Redis cache service
│   └── auth/              # JWT & session management
│
├── server/                # tRPC server
│   ├── routers/           # tRPC routers (auth, user, etc.)
│   └── trpc.ts            # tRPC configuration
│
├── app/                   # Next.js App Router
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (dashboard)/      # Dashboard pages
│   └── api/trpc/         # tRPC API endpoint
│
└── lib/                   # Utilities & shared code
    └── trpc/              # tRPC client configuration
```

## 🔧 Tech Stack

### Backend
- **Next.js 14** - React framework with App Router
- **tRPC** - Type-safe API layer
- **Supabase** - PostgreSQL database
- **Redis (ioredis)** - Session management & caching
- **JWT (jose)** - Authentication tokens
- **Superjson** - Data serialization

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching (via tRPC)
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/toilet-monitoring-app.git
   cd toilet-monitoring-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` dengan kredensial Anda:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run development server**

   **IMPORTANT:** This project uses Vercel serverless functions for the API. You must use `vercel dev` to run both the frontend AND backend:

   ```bash
   # Install Vercel CLI globally (first time only)
   npm install -g vercel

   # Run with Vercel dev server (starts both frontend + API)
   vercel dev
   ```

   **OR** if you only want to run the frontend (API calls will fail):
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) (Vercel Dev)

   atau [http://localhost:5174](http://localhost:5174) (Vite only, no API)

## 🗄️ Database Setup

### Supabase Tables Required:

1. **users** - User management
2. **roles** - Role definitions
3. **user_roles** - User-role mapping
4. **locations** - Toilet locations
5. **inspection_templates** - Checklist templates
6. **inspection_records** - Inspection results
7. **photos** - Photo storage records

### Initial Roles Setup:
```sql
INSERT INTO roles (name, level, display_name) VALUES
('super_admin', 'super_admin', 'Super Admin'),
('admin', 'admin', 'Admin'),
('user', 'user', 'User');
```

### Default Template:
```sql
INSERT INTO inspection_templates (id, name, fields, is_default) VALUES
('default-template-001', 'Template Standar Toilet', '{}', true);
```

## 📱 User Flow

1. **Login/Register** → User masuk atau mendaftar
2. **Dashboard** → Melihat statistik dan lokasi yang perlu inspeksi
3. **Scan QR** → Scan QR code di lokasi toilet
4. **Checklist** → Isi checklist dengan swipe cards UI
5. **Upload Foto** → Ambil minimal 1 foto (max 3) dengan timestamp
6. **Submit** → Data tersimpan ke database
7. **Report** → Lihat hasil dalam kalender atau list view

## 🎨 Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx           # Dashboard
│   ├── login/             # Auth pages
│   ├── scan/              # QR Scanner
│   ├── toilets/           # Inspection pages
│   ├── locations/         # Location management
│   ├── history/           # Calendar & history
│   └── profile/           # User profile
│
├── features/              # Feature modules (Clean Architecture)
│   ├── toilets/          # Toilet inspection feature
│   │   ├── api.ts        # API functions
│   │   ├── types.ts      # TypeScript types
│   │   ├── hooks.ts      # React hooks
│   │   └── components/   # Feature components
│   ├── locations/        # Location management
│   ├── templates/        # Template management
│   └── users/            # User management
│
├── components/           # Shared UI components
│   ├── BottomNavigation.tsx
│   └── ui/              # Reusable UI components
│
├── lib/                 # Core utilities
│   ├── supabaseClient.ts
│   └── utils.ts
│
├── config/              # App configuration
│   └── constants.ts
│
└── types/               # Global TypeScript types
    └── database.types.ts
```

## 🔑 Key Components

### Toilet Checklist Items (11 items)
1. Kebersihan Lantai
2. Kebersihan Dinding
3. Kebersihan Toilet/Kloset
4. Kebersihan Wastafel
5. Ketersediaan Tissue
6. Ketersediaan Sabun
7. Ketersediaan Hand Sanitizer
8. Kondisi Cermin
9. Bau Ruangan
10. Kondisi Pencahayaan
11. Kondisi Pintu & Kunci

### Scoring System
- **90-100%**: Sangat Baik 🌟
- **75-89%**: Baik 😊
- **60-74%**: Cukup 😐
- **40-59%**: Buruk 😟
- **0-39%**: Kritis 🚨

## 🚀 Deployment

### Build for production:
```bash
npm run build
npm run start
```

### Deploy to Vercel:
```bash
vercel
```

### Environment Variables on Production:
Pastikan semua environment variables di-set di platform deployment Anda.

## 📈 Performance Optimizations

- Image compression sebelum upload
- Lazy loading untuk komponen berat
- PWA dengan service worker untuk offline support
- Optimized bundle dengan Next.js automatic code splitting
- CDN untuk static assets via Cloudinary

## 🔒 Security

- Supabase Row Level Security (RLS)
- Environment variables untuk sensitive data
- Input validation dan sanitization
- Secure image upload dengan Cloudinary signed uploads

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Developed with 💚 for effective toilet monitoring system.

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buka issue di GitHub repository.

---

**Note:** Pastikan Anda telah setup Supabase dan Cloudinary sebelum menjalankan aplikasi. Demo account tersedia di halaman login untuk testing.