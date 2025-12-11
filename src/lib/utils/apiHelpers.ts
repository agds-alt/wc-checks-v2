/**
 * API Helper Utilities
 * Shared utilities for API error handling
 */

/**
 * Safely parse error response from API
 * Handles cases where server returns HTML instead of JSON
 */
export async function parseErrorResponse(
  response: Response,
  defaultMessage: string
): Promise<string> {
  try {
    const error = await response.json();
    return error.error || error.message || defaultMessage;
  } catch {
    // Server returned non-JSON response (likely HTML error page)
    return `Server error (${response.status}): ${response.statusText || defaultMessage}`;
  }
}

/**
 * Check if response content type is JSON
 */
export function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return contentType !== null && contentType.includes('application/json');
}

/**
 * Safely parse JSON response with error handling
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
  try {
    if (!isJsonResponse(response)) {
      console.warn('[API] Non-JSON response received:', response.headers.get('content-type'));
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('[API] JSON parse failed:', error);
    return null;
  }
}
