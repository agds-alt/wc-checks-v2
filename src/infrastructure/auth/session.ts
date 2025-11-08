// Session Management with Redis + JWT
import { cacheService } from '../cache/redis';
import { jwtService, JWTPayload, SessionData } from './jwt';

export class SessionService {
  /**
   * Create a new session
   */
  async createSession(payload: Omit<JWTPayload, 'sessionId' | 'iat' | 'exp'>): Promise<string> {
    // Create JWT token
    const token = await jwtService.createToken(payload);

    // Verify to get full payload with sessionId
    const fullPayload = await jwtService.verifyToken(token);
    if (!fullPayload) {
      throw new Error('Failed to create session');
    }

    // Store session data in Redis
    const sessionData = jwtService.createSessionData(fullPayload);
    await cacheService.setSession(fullPayload.sessionId, sessionData);

    return token;
  }

  /**
   * Validate session and return session data
   */
  async validateSession(token: string): Promise<SessionData | null> {
    // Verify JWT token
    const payload = await jwtService.verifyToken(token);
    if (!payload) return null;

    // Check if session exists in Redis
    const sessionData = await cacheService.getSession<SessionData>(payload.sessionId);
    if (!sessionData) return null;

    // Check if session is expired
    const now = new Date();
    if (new Date(sessionData.expiresAt) < now) {
      await this.deleteSession(payload.sessionId);
      return null;
    }

    return sessionData;
  }

  /**
   * Refresh session (extend expiration)
   */
  async refreshSession(token: string): Promise<string | null> {
    const payload = await jwtService.verifyToken(token);
    if (!payload) return null;

    // Check if session exists
    const sessionData = await cacheService.getSession<SessionData>(payload.sessionId);
    if (!sessionData) return null;

    // Create new token
    const newToken = await jwtService.refreshToken(token);
    if (!newToken) return null;

    // Extend session in Redis
    await cacheService.extendSession(payload.sessionId, 7 * 24 * 60 * 60);

    return newToken;
  }

  /**
   * Delete session (logout)
   */
  async deleteSession(sessionId: string): Promise<void> {
    await cacheService.deleteSession(sessionId);
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(_userId: string): Promise<void> {
    // This requires scanning Redis keys - implement if needed
    // await cacheService.delPattern(`session:*${_userId}*`);
  }

  /**
   * Get session data by session ID
   */
  async getSessionData(sessionId: string): Promise<SessionData | null> {
    return cacheService.getSession<SessionData>(sessionId);
  }
}

// Export singleton instance
export const sessionService = new SessionService();
