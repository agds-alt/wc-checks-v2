// src/lib/auth.ts - Auth utilities for tRPC-based authentication

/**
 * Get the current auth token from localStorage
 * Returns null if no token is found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('sb-auth-token');
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb-auth-token');
  }
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sb-auth-token', token);
  }
}
