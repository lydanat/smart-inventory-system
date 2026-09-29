import { describe, it, expect } from 'vitest';
import { itemFormSchema, itemQuerySchema } from '@/lib/validation/item';
import { adjustStockSchema } from '@/lib/validation/stock';
import { supplierFormSchema } from '@/lib/validation/supplier';
import { signupSchema, loginSchema } from '@/lib/validation/auth';

describe('Validation Schemas', () => {
  describe('authSchema', () => {
    it('validates a correct signup input', () => {
      const result = signupSchema.safeParse({
        businessName: 'My Corner Mart',
        email: 'owner@example.com',
        password: 'securePassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short passwords and empty business names', () => {
      const shortPass = signupSchema.safeParse({
        businessName: 'My Corner Mart',
        email: 'owner@example.com',
        password: 'short',
      });
      expect(shortPass.success).toBe(false);

      const emptyName = signupSchema.safeParse({
        businessName: '   ',
        email: 'owner@example.com',
        password: 'securePassword123!',
      });
      expect(emptyName.success).toBe(false);
    });

    it('rejects unknown properties due to .strict()', () => {
      const unknownProp = signupSchema.safeParse({
        businessName: 'My Corner Mart',
        email: 'owner@example.com',
        password: 'securePassword123!',
        hackerField: 'inject',
      });
      expect(unknownProp.success).toBe(false);
    });

    it('validates a correct login input', () => {
      const result = loginSchema.safeParse({
        email: 'owner@example.com',
        password: 'mypassword',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('itemFormSchema & itemQuerySchema', () => {
    it('validates itemQuery defaults', () => {
      const result = itemQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
        expect(result.data.status).toBe('all');
      }
    });

    it('validates a valid item', () => {
      const result = itemFormSchema.safeParse({
        name: 'Organic Milk 1L',
        sku: 'MILK-001',
        category: 'Dairy',
        unit: 'bottles',
        quantity: 15,
        lowStockThreshold: 5,
        price: 3.5,
        expiryDate: '2026-10-15',
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative quantity or price', () => {
      const negQty = itemFormSchema.safeParse({
        name: 'Milk',
        quantity: -5,
      });
      expect(negQty.success).toBe(false);

      const negPrice = itemFormSchema.safeParse({
        name: 'Milk',
        price: -10,
      });
      expect(negPrice.success).toBe(false);
    });

    it('rejects invalid expiry date format', () => {
      const badDate = itemFormSchema.safeParse({
        name: 'Milk',
        expiryDate: '15/10/2026',
      });
      expect(badDate.success).toBe(false);
    });
  });

  describe('supplierFormSchema', () => {
    it('validates a valid supplier', () => {
      const result = supplierFormSchema.safeParse({
        name: 'Fresh Dairy Co.',
        contactName: 'Alice Smith',
        phone: '+123456789',
        email: 'alice@freshdairy.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('adjustStockSchema', () => {
    it('accepts valid stock adjustments', () => {
      const result = adjustStockSchema.safeParse({
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        delta: 10,
        reason: 'restock',
        note: 'Weekly supplier delivery',
      });
      expect(result.success).toBe(true);
    });

    it('rejects zero delta', () => {
      const zeroDelta = adjustStockSchema.safeParse({
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        delta: 0,
        reason: 'adjustment',
      });
      expect(zeroDelta.success).toBe(false);
    });

    it('rejects unknown reasons', () => {
      const badReason = adjustStockSchema.safeParse({
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        delta: 2,
        reason: 'magic',
      });
      expect(badReason.success).toBe(false);
    });
  });
});
