// Admin layout - admin-only pages
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BottomNav } from '@/components/mobile/BottomNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!adminLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, authLoading, adminLoading, router]);

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <>
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
