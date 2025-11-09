// Auth layout - public pages (login, register)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - WC Check',
  description: 'Login to WC Check toilet inspection system',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {children}
    </div>
  );
}
