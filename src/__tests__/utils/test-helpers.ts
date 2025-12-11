/**
 * Test Utilities and Helpers
 * Reusable test utilities for mocking and testing
 */

// SessionData type is available if needed for future test utilities
// import type { SessionData } from '@/infrastructure/auth/jwt';

/**
 * Create mock tRPC context for testing
 */
export function createMockContext(overrides?: Partial<{
  user: {
    userId: string;
    email: string;
    role: number;
    organizationId: string;
    sessionId: string;
  };
  req: any;
  res: any;
}>) {
  return {
    user: overrides?.user || null,
    req: overrides?.req || {},
    res: overrides?.res || {},
  };
}

/**
 * Create authenticated mock context
 */
export function createAuthenticatedContext(userOverrides?: Partial<{
  userId: string;
  email: string;
  role: number;
  organizationId: string;
  sessionId: string;
}>) {
  return createMockContext({
    user: {
      userId: userOverrides?.userId || 'test-user-123',
      email: userOverrides?.email || 'test@example.com',
      role: userOverrides?.role || 0,
      organizationId: userOverrides?.organizationId || 'test-org-123',
      sessionId: userOverrides?.sessionId || 'test-session-123',
    },
  });
}

/**
 * Create admin mock context
 */
export function createAdminContext() {
  return createAuthenticatedContext({
    role: 10, // SUPER_ADMIN
  });
}

/**
 * Create manager mock context
 */
export function createManagerContext() {
  return createAuthenticatedContext({
    role: 5, // MANAGER
  });
}

/**
 * Mock Supabase client
 */
export function createMockSupabaseClient() {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    abortSignal: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };
}

/**
 * Mock Redis client
 */
export function createMockRedisClient() {
  const store: Record<string, string> = {};

  return {
    get: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    set: jest.fn((key: string, value: string, ..._args: any[]) => {
      store[key] = value;
      return Promise.resolve('OK');
    }),
    del: jest.fn((key: string | string[]) => {
      const keys = Array.isArray(key) ? key : [key];
      keys.forEach(k => delete store[k]);
      return Promise.resolve(keys.length);
    }),
    keys: jest.fn((pattern: string) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Promise.resolve(Object.keys(store).filter(k => regex.test(k)));
    }),
    exists: jest.fn((key: string) => Promise.resolve(store[key] ? 1 : 0)),
    expire: jest.fn(() => Promise.resolve(1)),
    ttl: jest.fn(() => Promise.resolve(3600)),
    _store: store, // Access internal store for testing
    _reset: () => Object.keys(store).forEach(k => delete store[k]),
  };
}

// Simple session type for testing
interface MockSession {
  userId: string;
  email: string;
  role: number;
  organizationId: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Create mock session data
 */
export function createMockSession(overrides?: Partial<MockSession>): MockSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return {
    userId: overrides?.userId || 'test-user-123',
    email: overrides?.email || 'test@example.com',
    role: overrides?.role ?? 0,
    organizationId: overrides?.organizationId || 'test-org-123',
    sessionId: overrides?.sessionId || 'test-session-123',
    createdAt: overrides?.createdAt || now,
    expiresAt: overrides?.expiresAt || expiresAt,
  };
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock successful Supabase response
 */
export function mockSupabaseSuccess<T>(data: T) {
  return {
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  };
}

/**
 * Mock Supabase error response
 */
export function mockSupabaseError(message: string, code = 'PGRST116') {
  return {
    data: null,
    error: {
      message,
      details: '',
      hint: '',
      code,
    },
    count: null,
    status: 400,
    statusText: 'Bad Request',
  };
}

/**
 * Mock Supabase not found response
 */
export function mockSupabaseNotFound() {
  return mockSupabaseError('No rows found', 'PGRST116');
}

/**
 * Mock Cloudinary upload response
 */
export function mockCloudinaryUploadSuccess(publicId: string = 'test-image-123') {
  return {
    secure_url: `https://res.cloudinary.com/test/image/upload/${publicId}.jpg`,
    public_id: publicId,
    width: 1920,
    height: 1080,
    format: 'jpg',
    resource_type: 'image',
    created_at: new Date().toISOString(),
    bytes: 245678,
  };
}

/**
 * Mock Cloudinary upload error
 */
export function mockCloudinaryUploadError(message: string = 'Upload failed') {
  return {
    error: {
      message,
      http_code: 400,
    },
  };
}
