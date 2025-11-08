'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();

  const { data: user, isLoading, error } = trpc.auth.me.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      toast.success('Logged out successfully');
      router.push('/login');
    },
  });

  useEffect(() => {
    if (error) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('auth_token');
      router.push('/login');
    }
  }, [error, router]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">WC Check</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="rounded-lg border-4 border-dashed border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome, {user?.full_name}!
                </h2>
                <p className="mt-2 text-gray-600">
                  Email: {user?.email}
                </p>
                {user?.phone && (
                  <p className="mt-1 text-gray-600">
                    Phone: {user?.phone}
                  </p>
                )}

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DashboardCard
                    title="Inspections"
                    description="View and manage toilet inspections"
                    href="/inspections"
                  />
                  <DashboardCard
                    title="Locations"
                    description="Manage toilet locations"
                    href="/locations"
                  />
                  <DashboardCard
                    title="Buildings"
                    description="Manage buildings"
                    href="/buildings"
                  />
                  {user?.role >= 80 && (
                    <DashboardCard
                      title="Reports"
                      description="View inspection reports and analytics"
                      href="/reports"
                    />
                  )}
                  {user?.role >= 90 && (
                    <>
                      <DashboardCard
                        title="Users"
                        description="Manage users and permissions"
                        href="/users"
                      />
                      <DashboardCard
                        title="Organizations"
                        description="Manage organizations"
                        href="/organizations"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </a>
  );
}
