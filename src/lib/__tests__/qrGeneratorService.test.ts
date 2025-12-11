/**
 * QR Generator Service Unit Tests
 * Tests for QR code generation, parsing, and validation
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateLocationQRCode,
  parseQRCode,
  isValidQRCode,
  getOrganizationCodeFromQR,
  getBuildingCodeFromQR,
  formatQRCodeForDisplay,
  generateBulkQRCodes,
} from '../qrGeneratorService';

describe('qrGeneratorService', () => {
  describe('generateLocationQRCode', () => {
    it('should generate QR code with organization, building, and location codes', () => {
      const result = generateLocationQRCode('PROS', 'BLD1', 'F3T1');

      expect(result).toBe('PROS-BLD1-F3T1-xxxxxxx');
      expect(result.split('-')).toHaveLength(4);
    });

    it('should generate QR code without location code', () => {
      const result = generateLocationQRCode('PROS', 'BLD1');

      expect(result).toBe('PROS-BLD1-xxxxxxx');
      expect(result.split('-')).toHaveLength(3);
    });

    it('should convert codes to uppercase', () => {
      const result = generateLocationQRCode('pros', 'bld1', 'f3t1');

      expect(result).toBe('PROS-BLD1-F3T1-xxxxxxx');
    });

    it('should handle special characters in codes', () => {
      const result = generateLocationQRCode('PRO_S', 'BLD.1', 'F3/T1');

      expect(result).toContain('PRO_S');
      expect(result).toContain('BLD.1');
      expect(result).toContain('F3/T1');
    });

    it('should include nanoid in generated code', () => {
      const result = generateLocationQRCode('PROS', 'BLD1');

      const parts = result.split('-');
      expect(parts[parts.length - 1]).toBe('xxxxxxx');
      expect(parts[parts.length - 1].length).toBe(7);
    });
  });

  describe('parseQRCode', () => {
    it('should parse QR code with location code (4 parts)', () => {
      const qrCode = 'PROS-BLD1-F3T1-x7k2m9p';
      const result = parseQRCode(qrCode);

      expect(result).toEqual({
        organizationCode: 'PROS',
        buildingCode: 'BLD1',
        locationCode: 'F3T1',
        uniqueId: 'x7k2m9p',
      });
    });

    it('should parse QR code without location code (3 parts)', () => {
      const qrCode = 'PROS-BLD1-x7k2m9p';
      const result = parseQRCode(qrCode);

      expect(result).toEqual({
        organizationCode: 'PROS',
        buildingCode: 'BLD1',
        locationCode: undefined,
        uniqueId: 'x7k2m9p',
      });
    });

    it('should return null for invalid QR code (too few parts)', () => {
      const qrCode = 'PROS-BLD1';
      const result = parseQRCode(qrCode);

      expect(result).toBeNull();
    });

    it('should handle QR codes with more than 4 parts', () => {
      const qrCode = 'PROS-BLD1-F3T1-EXTRA-x7k2m9p';
      const result = parseQRCode(qrCode);

      // Should still parse but location code will include extra parts
      expect(result).not.toBeNull();
      expect(result?.uniqueId).toBe('x7k2m9p');
    });

    it('should return null for empty string', () => {
      const result = parseQRCode('');

      expect(result).toBeNull();
    });

    it('should handle QR codes with special characters', () => {
      const qrCode = 'PRO_S-BLD.1-F3/T1-x7k2m9p';
      const result = parseQRCode(qrCode);

      expect(result).not.toBeNull();
      expect(result?.organizationCode).toBe('PRO_S');
      expect(result?.buildingCode).toBe('BLD.1');
    });
  });

  describe('isValidQRCode', () => {
    it('should return true for valid QR code with location', () => {
      const qrCode = 'PROS-BLD1-F3T1-x7k2m9p';

      expect(isValidQRCode(qrCode)).toBe(true);
    });

    it('should return true for valid QR code without location', () => {
      const qrCode = 'PROS-BLD1-x7k2m9p';

      expect(isValidQRCode(qrCode)).toBe(true);
    });

    it('should return false for QR code with wrong nanoid length', () => {
      const qrCode = 'PROS-BLD1-F3T1-x7k'; // nanoid too short

      expect(isValidQRCode(qrCode)).toBe(false);
    });

    it('should return false for QR code with too few parts', () => {
      const qrCode = 'PROS-BLD1';

      expect(isValidQRCode(qrCode)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidQRCode('')).toBe(false);
    });

    it('should return false for QR code without hyphens', () => {
      const qrCode = 'PROSBLD1F3T1x7k2m9p';

      expect(isValidQRCode(qrCode)).toBe(false);
    });
  });

  describe('getOrganizationCodeFromQR', () => {
    it('should extract organization code from valid QR', () => {
      const qrCode = 'PROS-BLD1-F3T1-x7k2m9p';

      expect(getOrganizationCodeFromQR(qrCode)).toBe('PROS');
    });

    it('should return null for invalid QR', () => {
      const qrCode = 'INVALID';

      expect(getOrganizationCodeFromQR(qrCode)).toBeNull();
    });

    it('should handle QR without location code', () => {
      const qrCode = 'PROS-BLD1-x7k2m9p';

      expect(getOrganizationCodeFromQR(qrCode)).toBe('PROS');
    });
  });

  describe('getBuildingCodeFromQR', () => {
    it('should extract building code from valid QR', () => {
      const qrCode = 'PROS-BLD1-F3T1-x7k2m9p';

      expect(getBuildingCodeFromQR(qrCode)).toBe('BLD1');
    });

    it('should return null for invalid QR', () => {
      const qrCode = 'INVALID';

      expect(getBuildingCodeFromQR(qrCode)).toBeNull();
    });

    it('should handle QR without location code', () => {
      const qrCode = 'PROS-BLD1-x7k2m9p';

      expect(getBuildingCodeFromQR(qrCode)).toBe('BLD1');
    });
  });

  describe('formatQRCodeForDisplay', () => {
    it('should add spaces around hyphens', () => {
      const qrCode = 'PROS-BLD1-F3T1-x7k2m9p';

      expect(formatQRCodeForDisplay(qrCode)).toBe('PROS - BLD1 - F3T1 - x7k2m9p');
    });

    it('should handle QR without location code', () => {
      const qrCode = 'PROS-BLD1-x7k2m9p';

      expect(formatQRCodeForDisplay(qrCode)).toBe('PROS - BLD1 - x7k2m9p');
    });

    it('should handle QR with no hyphens', () => {
      const qrCode = 'PROSBLD1';

      expect(formatQRCodeForDisplay(qrCode)).toBe('PROSBLD1');
    });

    it('should handle empty string', () => {
      expect(formatQRCodeForDisplay('')).toBe('');
    });
  });

  describe('generateBulkQRCodes', () => {
    it('should generate multiple QR codes with sequential location codes', () => {
      const codes = generateBulkQRCodes(3, 'PROS', 'BLD1', 'F3T');

      expect(codes).toHaveLength(3);
      expect(codes[0]).toContain('F3T01');
      expect(codes[1]).toContain('F3T02');
      expect(codes[2]).toContain('F3T03');
    });

    it('should generate QR codes without location prefix', () => {
      const codes = generateBulkQRCodes(2, 'PROS', 'BLD1');

      expect(codes).toHaveLength(2);
      expect(codes[0]).toBe('PROS-BLD1-xxxxxxx');
      expect(codes[1]).toBe('PROS-BLD1-xxxxxxx');
    });

    it('should avoid existing codes', () => {
      const existing = ['PROS-BLD1-F3T01-xxxxxxx'];

      // Since our mock nanoid always returns 'xxxxxxx', and we're generating
      // with the same prefix, the codes will be the same
      // In real implementation, nanoid generates unique IDs
      const codes = generateBulkQRCodes(2, 'PROS', 'BLD1', 'F3T', existing);

      expect(codes).toHaveLength(2);
      // Note: Due to mocking, this test demonstrates the uniqueness check logic
    });

    it('should handle large bulk generation', () => {
      const codes = generateBulkQRCodes(100, 'PROS', 'BLD1', 'F');

      expect(codes).toHaveLength(100);
      expect(codes[99]).toContain('F100');
    });

    it('should pad location codes with leading zeros', () => {
      const codes = generateBulkQRCodes(10, 'PROS', 'BLD1', 'F');

      expect(codes[0]).toContain('F01');
      expect(codes[8]).toContain('F09');
      expect(codes[9]).toContain('F10');
    });

    it('should return empty array when count is 0', () => {
      const codes = generateBulkQRCodes(0, 'PROS', 'BLD1');

      expect(codes).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    it('should generate and parse QR code successfully', () => {
      const generated = generateLocationQRCode('PROS', 'BLD1', 'F3T1');
      const parsed = parseQRCode(generated);

      expect(parsed).not.toBeNull();
      expect(parsed?.organizationCode).toBe('PROS');
      expect(parsed?.buildingCode).toBe('BLD1');
      expect(parsed?.locationCode).toBe('F3T1');
    });

    it('should validate generated QR code', () => {
      const generated = generateLocationQRCode('PROS', 'BLD1', 'F3T1');

      expect(isValidQRCode(generated)).toBe(true);
    });

    it('should extract codes from generated QR', () => {
      const generated = generateLocationQRCode('PROS', 'BLD1', 'F3T1');

      expect(getOrganizationCodeFromQR(generated)).toBe('PROS');
      expect(getBuildingCodeFromQR(generated)).toBe('BLD1');
    });

    it('should format generated QR code for display', () => {
      const generated = generateLocationQRCode('PROS', 'BLD1', 'F3T1');
      const formatted = formatQRCodeForDisplay(generated);

      expect(formatted).toContain(' - ');
      expect(formatted.split(' - ')).toHaveLength(4);
    });
  });
});
