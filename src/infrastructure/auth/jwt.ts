// JWT Authentication using jose (Edge Runtime compatible)
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

export interface JWTPayload {
  userId: string;
  email: string;
  role: number;
  organizationId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface SessionData extends JWTPayload {
  createdAt: Date;
  expiresAt: Date;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const JWT_ALGORITHM = 'HS256';
const DEFAULT_EXPIRATION = '7d'; // 7 days
const SESSION_EXPIRATION = 7 * 24 * 60 * 60; // 7 days in seconds

export class JWTService {
  /**
   * Create a new JWT token
   */
  async createToken(payload: Omit<JWTPayload, 'sessionId' | 'iat' | 'exp'>): Promise<string> {
    const sessionId = nanoid();

    const token = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      sessionId,
    })
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(DEFAULT_EXPIRATION)
      .sign(JWT_SECRET);

    return token;
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: [JWT_ALGORITHM],
      });

      return payload as JWTPayload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Create session data from JWT payload
   */
  createSessionData(payload: JWTPayload): SessionData {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRATION * 1000);

    return {
      ...payload,
      createdAt: now,
      expiresAt,
    };
  }

  /**
   * Refresh token (create new token with extended expiration)
   */
  async refreshToken(oldToken: string): Promise<string | null> {
    const payload = await this.verifyToken(oldToken);
    if (!payload) return null;

    // Create new token with same data but new expiration
    return this.createToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    });
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization) return null;

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1];
  }
}

// Export singleton instance
export const jwtService = new JWTService();
