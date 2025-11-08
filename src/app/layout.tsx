import type { Metadata } from 'next';
// import { Inter } from 'next/font/google'; // Temporarily disabled due to network issues
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/Provider';
import { Toaster } from 'sonner';

// const inter = Inter({ subsets: ['latin'] }); // Temporarily using system fonts

export const metadata: Metadata = {
  title: 'WC Check - Toilet Inspection System',
  description: 'Professional toilet inspection and maintenance tracking system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <TRPCProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TRPCProvider>
      </body>
    </html>
  );
}
