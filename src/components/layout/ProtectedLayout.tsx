'use client';

// src/components/layout/ProtectedLayout.tsx
import { usePathname } from 'next/navigation';
import { BottomNav } from '../mobile/BottomNav';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const pathname = usePathname();

  // Hide bottom nav di semua halaman inspection
  const showBottomNav = !(
    pathname.includes('/inspect/') ||
    pathname.includes('/locations/') &&
    !pathname.includes('/admin/')
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 overflow-auto safe-area-top">
        {children}
      </main>
      
      {/* Bottom Navigation - Conditional Render */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};