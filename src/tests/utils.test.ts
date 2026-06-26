import { describe, it, expect } from 'vitest';
import { formatDate, getToday, debounce } from '../utils.js';

describe('formatDate', () => {
  it('returns a non-empty string for a valid date', () => {
    expect(typeof formatDate('2025-12-25')).toBe('string');
    expect(formatDate('2025-12-25').length).toBeGreaterThan(0);
  });

  it('handles today correctly', () => {
    const today = getToday();
    expect(typeof formatDate(today)).toBe('string');
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    let count = 0;
    const inc = debounce(() => count++, 50);
    inc(); inc(); inc();
    expect(count).toBe(0);
    await new Promise(r => setTimeout(r, 100));
    expect(count).toBe(1);
  });
});

describe('getToday', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(getToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
