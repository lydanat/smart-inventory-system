import { describe, it, expect } from 'vitest';
import {
  checkOutOfStock,
  checkLowStock,
  checkExpired,
  checkExpiringSoon,
  checkOverstock,
  checkSlowMoving,
  checkFastMover,
  runAllInventoryRules,
  type RuleItem,
} from '@/lib/rules/inventory-rules';

describe('Layer 1 Deterministic Rules Engine', () => {
  const fixedToday = '2026-09-29';

  const baseItem: RuleItem = {
    id: 'item-1',
    name: 'Almond Milk 1L',
    category: 'Dairy',
    quantity: 20,
    unit: 'cartons',
    low_stock_threshold: 5,
    expiry_date: '2026-10-15',
    price: 3.5,
  };

  it('detects out of stock condition with critical severity', () => {
    const item = { ...baseItem, quantity: 0 };
    const flag = checkOutOfStock(item);

    expect(flag).not.toBeNull();
    expect(flag?.flagType).toBe('out_of_stock');
    expect(flag?.severity).toBe('critical');
    expect(flag?.suggestedAction).toBe('reorder');
    expect(flag?.suggestedQuantity).toBeGreaterThanOrEqual(10);
  });

  it('detects low stock condition when quantity <= low_stock_threshold', () => {
    const item = { ...baseItem, quantity: 4, low_stock_threshold: 5 };
    const flag = checkLowStock(item);

    expect(flag).not.toBeNull();
    expect(flag?.flagType).toBe('low_stock');
    expect(flag?.severity).toBe('warning');
    expect(flag?.suggestedAction).toBe('reorder');
  });

  it('returns null when stock is healthy', () => {
    const item = { ...baseItem, quantity: 20, low_stock_threshold: 5 };
    expect(checkOutOfStock(item)).toBeNull();
    expect(checkLowStock(item)).toBeNull();
  });

  it('detects expired items with critical severity and retire action', () => {
    const item = { ...baseItem, expiry_date: '2026-09-20' }; // 9 days in the past
    const flag = checkExpired(item, fixedToday);

    expect(flag).not.toBeNull();
    expect(flag?.flagType).toBe('expired');
    expect(flag?.severity).toBe('critical');
    expect(flag?.suggestedAction).toBe('retire');
  });

  it('detects items expiring soon (within 7 days) with discount action', () => {
    const item = { ...baseItem, expiry_date: '2026-10-02' }; // 3 days in future
    const flag = checkExpiringSoon(item, fixedToday, 7);

    expect(flag).not.toBeNull();
    expect(flag?.flagType).toBe('expiring_soon');
    expect(flag?.severity).toBe('warning');
    expect(flag?.suggestedAction).toBe('discount');
  });

  it('does not flag items expiring far in the future', () => {
    const item = { ...baseItem, expiry_date: '2026-12-01' };
    expect(checkExpired(item, fixedToday)).toBeNull();
    expect(checkExpiringSoon(item, fixedToday, 7)).toBeNull();
  });

  it('detects fast mover when sales exceed remaining stock', () => {
    const item = { ...baseItem, quantity: 5 };
    const movements7d = [
      { item_id: 'item-1', delta: -8, created_at: '2026-09-28' },
    ];

    const flag = checkFastMover(item, movements7d);
    expect(flag).not.toBeNull();
    expect(flag?.flagType).toBe('fast_mover');
    expect(flag?.severity).toBe('warning');
  });

  it('detects overstock when quantity > 3x threshold with low velocity', () => {
    const item = { ...baseItem, quantity: 50, low_stock_threshold: 5 };
    const movements7d = [
      { item_id: 'item-1', delta: -1, created_at: '2026-09-28' },
    ];

    const flag = checkOverstock(item, movements7d);
    expect(flag).not.toBeNull();
    expect(flag?.flagType).toBe('overstock');
    expect(flag?.severity).toBe('info');
    expect(flag?.suggestedAction).toBe('promote');
  });

  it('detects slow moving when zero sales in last 14 days', () => {
    const item = { ...baseItem, quantity: 20 };
    const movements14d: { item_id: string; delta: number; created_at: string }[] = [];

    const flag = checkSlowMoving(item, movements14d);
    expect(flag).not.toBeNull();
    expect(flag?.flagType).toBe('slow_moving');
    expect(flag?.severity).toBe('info');
  });

  it('correctly sorts flags with critical severity first', () => {
    const items: RuleItem[] = [
      { ...baseItem, id: '1', quantity: 20, expiry_date: '2026-10-01' }, // expiring soon (warning)
      { ...baseItem, id: '2', quantity: 0 }, // out of stock (critical)
      { ...baseItem, id: '3', quantity: 3, low_stock_threshold: 5 }, // low stock (warning)
      { ...baseItem, id: '4', quantity: 10, expiry_date: '2026-09-15' }, // expired (critical)
    ];

    const flags = runAllInventoryRules(items, [], [], fixedToday);

    expect(flags.length).toBeGreaterThanOrEqual(4);
    expect(flags[0].severity).toBe('critical');
    expect(flags[1].severity).toBe('critical');
    expect(['out_of_stock', 'expired']).toContain(flags[0].flagType);
  });
});
