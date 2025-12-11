// src/hooks/useAuth.ts - Re-export from tRPC-based auth
// This ensures backward compatibility with all existing imports

export { useAuth, useAuthTRPC, useUserProfile } from './useAuthTRPC';
export type { AuthUser } from './useAuthTRPC';
