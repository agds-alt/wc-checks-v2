// src/hooks/useAuthTRPC.ts - tRPC-based authentication hook
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useCallback, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  is_active: boolean | null;
  occupation_id: string | null;
  role: number;
  organizationId: string;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  last_login_at?: string | Date | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  password_hash?: string | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  profile: AuthUser | null; // Alias for compatibility with old useAuth
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuthTRPC(): UseAuthReturn {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Check if token exists
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('sb-auth-token');

  // Fetch current user via tRPC
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    enabled: hasToken, // Only fetch if token exists
    retry: 1,
    onError: (err) => {
      console.error('Auth error:', err);
      setError(err.message);

      // If unauthorized, clear token
      if (err.message.includes('UNAUTHORIZED') || err.message.includes('Authentication required')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-auth-token');
        }
      }
    },
  });

  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Clear token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-auth-token');
      }

      // Redirect to login
      router.push('/login');
    },
    onError: (err) => {
      console.error('Logout error:', err);
      // Still clear token and redirect even if mutation fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-auth-token');
      }
      router.push('/login');
    },
  });

  // Sign out function
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, [logoutMutation]);

  // Refresh profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  return {
    user: user || null,
    profile: user || null, // Alias for compatibility
    loading: isLoading,
    error,
    isAuthenticated: !!user && hasToken,
    signOut,
    refreshProfile,
  };
}

// Compatibility hook name (can import either way)
export const useAuth = useAuthTRPC;

// User profile helper hook
export function useUserProfile() {
  const { user } = useAuthTRPC();

  return {
    fullName: user?.full_name || 'User',
    email: user?.email || '',
    occupationId: user?.occupation_id,
    isActive: user?.is_active ?? false,
  };
}
