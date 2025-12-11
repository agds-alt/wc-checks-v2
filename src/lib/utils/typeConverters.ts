/**
 * Type Conversion Utilities
 * Helper functions to safely convert between application types and database types
 */

import type { Json } from '@/types/database.types';

/**
 * Convert any object to Supabase Json type
 * Ensures type safety when storing complex objects in JSON columns
 */
export function toJson<T extends Record<string, any>>(value: T): Json {
  if (value === null || value === undefined) {
    return null;
  }

  // Deep clone to avoid mutations and ensure JSON-serializable
  return JSON.parse(JSON.stringify(value)) as Json;
}

/**
 * Convert Supabase Json type to typed object
 * Safely extracts typed data from JSON columns
 */
export function fromJson<T>(value: Json | null | undefined): T | null {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    // If already an object, return as-is
    if (typeof value === 'object') {
      return value as T;
    }

    // If string, try to parse
    if (typeof value === 'string') {
      return JSON.parse(value) as T;
    }

    return value as T;
  } catch (error) {
    console.error('[typeConverters] Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Convert Date to ISO string for database storage
 */
export function dateToString(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Convert ISO string to Date object
 */
export function stringToDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Ensure value is an array, converting if necessary
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Convert null/undefined to empty string for form inputs
 */
export function nullToEmptyString(value: string | null | undefined): string {
  return value ?? '';
}

/**
 * Convert empty string to null for database storage
 */
export function emptyStringToNull(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value.trim() === '') {
    return null;
  }
  return value.trim();
}

/**
 * Safely convert any value to boolean
 */
export function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return !!value;
}

/**
 * Convert coordinates object to Json for storage
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export function coordinatesToJson(coords: Coordinates | LocationCoordinates | null | undefined): Json {
  if (!coords) return null;

  // Handle LocationCoordinates format (latitude/longitude)
  if ('latitude' in coords && 'longitude' in coords) {
    return {
      lat: coords.latitude,
      lng: coords.longitude,
    } as Json;
  }

  // Handle Coordinates format (lat/lng)
  return {
    lat: (coords as Coordinates).lat,
    lng: (coords as Coordinates).lng,
  } as Json;
}

/**
 * Convert Json to coordinates object
 */
export function jsonToCoordinates(json: Json | null | undefined): Coordinates | null {
  if (!json || typeof json !== 'object') return null;

  const obj = json as Record<string, unknown>;

  if (typeof obj.lat === 'number' && typeof obj.lng === 'number') {
    return {
      lat: obj.lat,
      lng: obj.lng,
    };
  }

  return null;
}

/**
 * Type-safe deep clone for complex objects
 */
export function deepClone<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (Array.isArray(value)) {
    return value.map(item => deepClone(item)) as T;
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, deepClone(val)])
    ) as T;
  }

  return value;
}
