import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatDate,
  formatTime,
  getToday,
  debounce,
  escapeHtml,
  getTheme,
  setTheme,
  generateId,
  truncate,
  formatNumber,
  timeAgo,
  isValidEmail,
  deepClone
} from '../utils.js';

describe('Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/Jan/);
    });
  });

  describe('formatTime', () => {
    it('should format time string correctly', () => {
      const result = formatTime('19:30');
      expect(result).toMatch(/7:30|19:30/);
    });
  });

  describe('getToday', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const result = getToday();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('debounce', () => {
    it('should return a function', () => {
      const mockFn = () => {};
      const debouncedFn = debounce(mockFn, 300);
      expect(typeof debouncedFn).toBe('function');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const result = escapeHtml('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('getTheme', () => {
    it('should return dark theme by default', () => {
      const result = getTheme();
      expect(result).toBe('dark');
    });

    it('should return stored theme', () => {
      localStorage.setItem('dinemate-theme', 'light');
      const result = getTheme();
      expect(result).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('should set theme in localStorage', () => {
      setTheme('light');
      expect(localStorage.getItem('dinemate-theme')).toBe('light');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const result = truncate('Hello World', 5);
      expect(result).toBe('He...');
    });

    it('should not truncate short text', () => {
      const result = truncate('Hi', 10);
      expect(result).toBe('Hi');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      const result = formatNumber(1000000);
      expect(result).toBe('1,000,000');
    });
  });

  describe('timeAgo', () => {
    it('should return "Just now" for recent dates', () => {
      const result = timeAgo(new Date());
      expect(result).toBe('Just now');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should create deep copy of object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = deepClone(original);
      
      clone.b.c = 3;
      expect(original.b.c).toBe(2);
    });
  });
});
