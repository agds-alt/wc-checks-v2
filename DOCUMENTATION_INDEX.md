# WC-Checks-v2 Project Documentation Index

This directory contains comprehensive documentation about the wc-checks-v2 toilet inspection management system. Below is a guide to help you find what you need.

---

## Documentation Files Created

### 1. EXPLORATION_SUMMARY.md (Best Starting Point)
**Read this first for a high-level overview**

- Quick project overview
- Tech stack summary
- Key findings highlights
- Architecture decisions explained
- Security measures overview
- Performance optimizations
- File organization philosophy
- Common development tasks

**Best for**: Managers, architects, new team members, project overview

---

### 2. PROJECT_STRUCTURE_OVERVIEW.md (Most Comprehensive)
**Deep technical dive into every aspect**

1. Framework Setup (Vite/React configuration)
2. File/Folder Structure (complete tree with descriptions)
3. Dependencies in package.json (organized by category)
4. Domain Models & Entities (full database schema)
5. API/Backend Setup (endpoints and authentication)
6. Database Configuration (Supabase details)
7. Key Services & Utilities (all helper services)
8. Development Setup (commands and setup)
9. Important Notes (deployment, security, performance)

**Best for**: Developers implementing features, code reviews, detailed technical understanding

**File size**: 24 KB, 769 lines

---

### 3. QUICK_REFERENCE.md (Cheat Sheet)
**Fast lookups while coding**

- Key file paths (quick copy-paste)
- Essential commands
- Environment variables
- Architecture overview diagram
- Page components list
- Database table relationships
- Role hierarchy table
- Key features (inspection, QR, auth)
- Development tips & how-tos
- Common code patterns
- Security checklist
- Debugging hints
- Useful resources

**Best for**: Developers actively coding, debugging, looking up info quickly

**File size**: 8.1 KB, 292 lines

---

### 4. KEY_FILES_REFERENCE.md (File Directory)
**Complete absolute paths for all key files**

- Frontend core files (entry points, config)
- Frontend services (src/lib/)
- Custom hooks (all 15 hooks)
- Type definitions (all 8 type files)
- Page components (17 pages listed)
- Component files (40+ components)
- API endpoints (all backend routes)
- Deployment configuration
- Environment files
- Quick navigation shortcuts

**Best for**: Finding specific files, understanding organization, onboarding

**File size**: 12 KB, 248 lines

---

## How to Use This Documentation

### If you're NEW to the project:
1. Start with **EXPLORATION_SUMMARY.md** (15 min read)
2. Skim **QUICK_REFERENCE.md** to learn shortcuts (5 min)
3. Review **KEY_FILES_REFERENCE.md** to understand structure (10 min)
4. Review actual code in suggested files

### If you're adding a NEW FEATURE:
1. Check **PROJECT_STRUCTURE_OVERVIEW.md** section 4 (database schema)
2. Check **QUICK_REFERENCE.md** "Adding..." sections
3. Use **KEY_FILES_REFERENCE.md** to find template files
4. Review existing similar features in the codebase

### If you're DEBUGGING:
1. Check **QUICK_REFERENCE.md** debugging section
2. Use **KEY_FILES_REFERENCE.md** to locate logging files
3. Check **PROJECT_STRUCTURE_OVERVIEW.md** section 5 (API setup)
4. Refer to error messages in logs

### If you're ONBOARDING a DEVELOPER:
1. Have them read **EXPLORATION_SUMMARY.md** (overview)
2. Share **QUICK_REFERENCE.md** (practical guide)
3. Walk through **KEY_FILES_REFERENCE.md** (file structure)
4. Have them set up environment and run `npm run dev`

### If you're REVIEWING CODE:
1. Check **PROJECT_STRUCTURE_OVERVIEW.md** section 4 (schema)
2. Reference **QUICK_REFERENCE.md** common patterns
3. Check **KEY_FILES_REFERENCE.md** for file organization compliance

---

## Project Quick Facts

- **Language**: TypeScript (13,600+ lines)
- **Framework**: React 18 + Vite 5.4
- **Backend**: Vercel Serverless (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + PostCSS
- **Main Vendor Size**: ~782 KB
- **Pages**: 17 (2 eager, 15 lazy-loaded)
- **Components**: 40+
- **Hooks**: 15
- **API Endpoints**: 15
- **Database Tables**: 9

---

## Core Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 18.2.0 |
| Build Tool | Vite | 5.4.11 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 3.4.18 |
| Routing | React Router | 6.26.0 |
| State (Global) | Zustand | 5.0.8 |
| State (Server) | React Query | 5.17.0 |
| Forms | React Hook Form | 7.65.0 |
| Validation | Zod | 3.25.76 |
| Backend | Vercel Node | 3.0.0 |
| Database | Supabase | 2.54.11 |
| Icons | Lucide React | 0.548.0 |
| PDF | jsPDF | 3.0.3 |
| QR Codes | qrcode.react | 3.1.0 |

---

## Development Workflow

```bash
# Initial setup
git clone <repo>
cd /home/user/wc-checks-v2
pnpm install
cp .env.example .env
# Edit .env with real credentials

# Development
pnpm run dev          # Start on localhost:5174
pnpm run type-check   # Check types
pnpm run lint         # Lint code

# Production
pnpm run build        # Build bundle
git push              # Auto-deploy to Vercel
```

---

## Key Directories

```
/home/user/wc-checks-v2/
├── src/
│   ├── pages/          (17 pages)
│   ├── components/     (40+ components)
│   ├── hooks/          (15 hooks)
│   ├── lib/            (12 services)
│   └── types/          (8 type files)
├── api/                (15 endpoints)
├── public/             (static assets)
└── [config files]
```

---

## Important Security Notes

- Never expose `SUPABASE_SERVICE_KEY` in frontend code
- All sensitive keys go in `.env` file (not git)
- JWT tokens validated on every API call
- Role levels checked server-side
- Database has RLS policies for additional security

---

## Common Questions Answered

### Q: Where's the login page?
A: `/home/user/wc-checks-v2/src/pages/LoginPage.tsx` (eagerly loaded)

### Q: How does authentication work?
A: JWT tokens from Supabase stored in localStorage, validated via `/api/auth/verify-role`

### Q: Where are inspections created?
A: Form in `ComprehensiveInspectionForm.tsx`, data stored via `/api/inspections`

### Q: How do I add a new page?
A: Create in `/src/pages/`, lazy-load in `App.tsx` (see QUICK_REFERENCE.md)

### Q: Where's the database schema?
A: `/home/user/wc-checks-v2/src/types/database.types.ts` (auto-generated from Supabase)

### Q: How do I deploy?
A: Push to main branch, Vercel auto-deploys

---

## Getting Help

1. **Finding a file**: Use `KEY_FILES_REFERENCE.md`
2. **Learning how something works**: Use `PROJECT_STRUCTURE_OVERVIEW.md`
3. **Quick lookup while coding**: Use `QUICK_REFERENCE.md`
4. **Understanding the big picture**: Use `EXPLORATION_SUMMARY.md`
5. **Actual code**: Check the files themselves!

---

## Documentation Metadata

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| EXPLORATION_SUMMARY.md | 384 | 11 KB | High-level overview & summary |
| PROJECT_STRUCTURE_OVERVIEW.md | 769 | 24 KB | Comprehensive technical deep dive |
| QUICK_REFERENCE.md | 292 | 8.1 KB | Developer cheat sheet |
| KEY_FILES_REFERENCE.md | 248 | 12 KB | File directory & locations |
| DOCUMENTATION_INDEX.md | This file | - | Navigation guide |

**Total Documentation**: 1,693 lines across 5 files (44 KB)

---

## Last Updated

Generated: November 8, 2025

These documents provide a complete understanding of the wc-checks-v2 project structure and are suitable for:
- New team members
- Project reviews
- Feature development
- Code reviews
- Architecture decisions
- Onboarding & training

---

## Next Steps

1. Read `EXPLORATION_SUMMARY.md` for overview
2. Bookmark `QUICK_REFERENCE.md` for daily use
3. Set up development environment
4. Run `pnpm run dev`
5. Start exploring the code!

Happy coding!
