import { describe, it, expect } from 'vitest';
import { getRotatedDimensions, generateId, clamp, rectsOverlap, formatNumber, getRelativeTime } from '@/lib/gameUtils';

describe('gameUtils', () => {
  describe('getRotatedDimensions', () => {
    it('should return original dimensions for 0 degree rotation', () => {
      const result = getRotatedDimensions(3, 2, 0);
      expect(result.width).toBe(3);
      expect(result.height).toBe(2);
    });

    it('should return original dimensions for 180 degree rotation', () => {
      const result = getRotatedDimensions(3, 2, 180);
      expect(result.width).toBe(3);
      expect(result.height).toBe(2);
    });

    it('should swap dimensions for 90 degree rotation', () => {
      const result = getRotatedDimensions(3, 2, 90);
      expect(result.width).toBe(2);
      expect(result.height).toBe(3);
    });

    it('should swap dimensions for 270 degree rotation', () => {
      const result = getRotatedDimensions(3, 2, 270);
      expect(result.width).toBe(2);
      expect(result.height).toBe(3);
    });

    it('should handle square dimensions', () => {
      expect(getRotatedDimensions(2, 2, 0)).toEqual({ width: 2, height: 2 });
      expect(getRotatedDimensions(2, 2, 90)).toEqual({ width: 2, height: 2 });
      expect(getRotatedDimensions(2, 2, 180)).toEqual({ width: 2, height: 2 });
      expect(getRotatedDimensions(2, 2, 270)).toEqual({ width: 2, height: 2 });
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId('test');
      // Wait a tiny bit to ensure different timestamp
      const id2 = generateId('test');
      
      expect(id1).not.toBe(id2);
    });

    it('should include prefix in ID', () => {
      const id = generateId('furniture');
      expect(id.startsWith('furniture-')).toBe(true);
    });

    it('should use default prefix if not specified', () => {
      const id = generateId();
      expect(id.startsWith('id-')).toBe(true);
    });
  });

  describe('clamp', () => {
    it('should return value if within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should return min if value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should return max if value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge values', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('rectsOverlap', () => {
    it('should return true for overlapping rectangles', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      
      expect(rectsOverlap(rect1, rect2)).toBe(true);
    });

    it('should return true for fully contained rectangle', () => {
      const rect1 = { x: 0, y: 0, width: 20, height: 20 };
      const rect2 = { x: 5, y: 5, width: 5, height: 5 };
      
      expect(rectsOverlap(rect1, rect2)).toBe(true);
    });

    it('should return false for non-overlapping rectangles', () => {
      const rect1 = { x: 0, y: 0, width: 5, height: 5 };
      const rect2 = { x: 10, y: 10, width: 5, height: 5 };
      
      expect(rectsOverlap(rect1, rect2)).toBe(false);
    });

    it('should return false for adjacent rectangles (touching but not overlapping)', () => {
      const rect1 = { x: 0, y: 0, width: 5, height: 5 };
      const rect2 = { x: 5, y: 0, width: 5, height: 5 };
      
      expect(rectsOverlap(rect1, rect2)).toBe(false);
    });

    it('should handle rectangles with zero dimensions (point vs rect)', () => {
      // A zero-sized rect is essentially a point - the function will consider it overlapping
      // if the point is inside another rectangle
      const point = { x: 5, y: 5, width: 0, height: 0 };
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      
      // Point (5,5) is inside rect, so they "overlap"
      expect(rectsOverlap(point, rect)).toBe(true);
      
      // But outside, no overlap
      const outsidePoint = { x: 15, y: 15, width: 0, height: 0 };
      expect(rectsOverlap(outsidePoint, rect)).toBe(false);
    });
  });

  describe('formatNumber', () => {
    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(5000)).toBe('5.0K');
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(2500000)).toBe('2.5M');
    });

    it('should format billions with B suffix', () => {
      expect(formatNumber(1000000000)).toBe('1.0B');
      expect(formatNumber(3500000000)).toBe('3.5B');
    });

    it('should return number as string for small values', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });
  });

  describe('getRelativeTime', () => {
    it('should return "just now" for recent timestamps', () => {
      const now = Date.now();
      expect(getRelativeTime(now)).toBe('just now');
      expect(getRelativeTime(now - 30000)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(getRelativeTime(twoHoursAgo)).toBe('2h ago');
    });

    it('should return days ago', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(getRelativeTime(threeDaysAgo)).toBe('3d ago');
    });
  });
});
