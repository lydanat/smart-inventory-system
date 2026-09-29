import { describe, it, expect } from 'vitest';
import { escapeHtml, formatCurrency } from '@/lib/utils';
import { mapPostgresError } from '@/lib/errors';
import { safeCompare } from '@/lib/security/safe-compare';

describe('Utility & Security Functions', () => {
  describe('escapeHtml', () => {
    it('escapes &, <, >, ", and single quotes', () => {
      const input = '<script>alert("XSS & injection\'s")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS &amp; injection&#39;s&quot;)&lt;/script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('handles empty strings and falsy values', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers into USD currency strings', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });
  });

  describe('safeCompare', () => {
    it('returns true for matching strings', () => {
      expect(safeCompare('my-secret-token-12345', 'my-secret-token-12345')).toBe(true);
    });

    it('returns false for mismatched strings', () => {
      expect(safeCompare('my-secret-token-12345', 'wrong-secret-token')).toBe(false);
      expect(safeCompare('short', 'longer-string')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(safeCompare(null, 'secret')).toBe(false);
      expect(safeCompare('secret', undefined)).toBe(false);
    });
  });

  describe('mapPostgresError', () => {
    it('maps 23514 check constraint on stock to friendly error', () => {
      const mapped = mapPostgresError({ code: '23514', message: 'violates check constraint items_quantity_check' });
      expect(mapped.code).toBe('BAD_REQUEST');
      expect(mapped.message).toBe('Not enough stock available.');
    });

    it('maps 23505 unique constraint on sku to conflict error', () => {
      const mapped = mapPostgresError({ code: '23505', message: 'violates unique constraint items_sku_uniq' });
      expect(mapped.code).toBe('CONFLICT');
      expect(mapped.message).toBe('An item with this SKU already exists.');
    });

    it('maps P0002 not found error', () => {
      const mapped = mapPostgresError({ code: 'P0002', message: 'item_not_found' });
      expect(mapped.code).toBe('NOT_FOUND');
      expect(mapped.message).toBe('The requested item was not found.');
    });

    it('returns generic error for unrecognized code without leaking SQL', () => {
      const mapped = mapPostgresError({ code: '42601', message: 'syntax error at or near SELECT' });
      expect(mapped.code).toBe('INTERNAL_ERROR');
      expect(mapped.message).not.toContain('syntax error');
      expect(mapped.message).not.toContain('SELECT');
    });
  });
});
