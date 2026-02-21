import { describe, it, expect } from 'vitest';
import {
  gridToPixel,
  pixelToGrid,
  snapToGrid,
  isInBounds,
  createCollisionKey,
  parseCollisionKey,
  lerp,
  easeOutQuad,
  gridDistance,
  manhattanDistance,
  isAdjacent,
  getDirection,
  findPath,
} from '@/features/engine/grid';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '@/features/engine/constants';

describe('Grid Utilities', () => {
  describe('gridToPixel', () => {
    it('should convert grid position to pixel position', () => {
      const result = gridToPixel(5, 10);
      expect(result.x).toBe(5 * TILE_SIZE);
      expect(result.y).toBe(10 * TILE_SIZE);
    });

    it('should handle zero position', () => {
      const result = gridToPixel(0, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('pixelToGrid', () => {
    it('should convert pixel position to grid position', () => {
      const result = pixelToGrid(5 * TILE_SIZE + 10, 10 * TILE_SIZE + 20);
      expect(result.gridX).toBe(5);
      expect(result.gridY).toBe(10);
    });

    it('should floor to nearest grid cell', () => {
      const result = pixelToGrid(TILE_SIZE - 1, TILE_SIZE - 1);
      expect(result.gridX).toBe(0);
      expect(result.gridY).toBe(0);
    });

    it('should handle zero position', () => {
      const result = pixelToGrid(0, 0);
      expect(result.gridX).toBe(0);
      expect(result.gridY).toBe(0);
    });
  });

  describe('snapToGrid', () => {
    it('should snap pixel position to nearest grid cell', () => {
      const result = snapToGrid(5 * TILE_SIZE + 10, 10 * TILE_SIZE + 20);
      expect(result.x).toBe(5 * TILE_SIZE);
      expect(result.y).toBe(10 * TILE_SIZE);
    });

    it('should snap to zero for small values', () => {
      const result = snapToGrid(10, 20);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('isInBounds', () => {
    it('should return true for positions within bounds', () => {
      expect(isInBounds(0, 0)).toBe(true);
      expect(isInBounds(10, 10)).toBe(true);
      expect(isInBounds(MAP_WIDTH - 1, MAP_HEIGHT - 1)).toBe(true);
    });

    it('should return false for positions outside bounds', () => {
      expect(isInBounds(-1, 0)).toBe(false);
      expect(isInBounds(0, -1)).toBe(false);
      expect(isInBounds(MAP_WIDTH, 0)).toBe(false);
      expect(isInBounds(0, MAP_HEIGHT)).toBe(false);
    });
  });

  describe('createCollisionKey', () => {
    it('should create a string key from grid coordinates', () => {
      expect(createCollisionKey(5, 10)).toBe('5,10');
      expect(createCollisionKey(0, 0)).toBe('0,0');
    });

    it('should handle negative values', () => {
      expect(createCollisionKey(-5, -10)).toBe('-5,-10');
    });
  });

  describe('parseCollisionKey', () => {
    it('should parse collision key back to grid position', () => {
      const result = parseCollisionKey('5,10');
      expect(result.gridX).toBe(5);
      expect(result.gridY).toBe(10);
    });

    it('should handle zero values', () => {
      const result = parseCollisionKey('0,0');
      expect(result.gridX).toBe(0);
      expect(result.gridY).toBe(0);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 1)).toBe(100);
      expect(lerp(0, 100, 0.5)).toBe(50);
    });

    it('should handle negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
    });

    it('should work with progress outside 0-1 range', () => {
      expect(lerp(0, 100, 2)).toBe(200);
      expect(lerp(0, 100, -0.5)).toBe(-50);
    });
  });

  describe('easeOutQuad', () => {
    it('should ease at start (slow)', () => {
      const startEase = easeOutQuad(0.1);
      const midEase = easeOutQuad(0.5);
      expect(startEase).toBeLessThan(midEase);
    });

    it('should ease at end (fast)', () => {
      const midEase = easeOutQuad(0.5);
      const endEase = easeOutQuad(0.9);
      expect(endEase).toBeGreaterThan(midEase);
    });

    it('should return 0 at progress 0', () => {
      expect(easeOutQuad(0)).toBe(0);
    });

    it('should return 1 at progress 1', () => {
      expect(easeOutQuad(1)).toBe(1);
    });
  });

  describe('gridDistance', () => {
    it('should calculate Manhattan distance between grid positions', () => {
      expect(gridDistance({ gridX: 0, gridY: 0 }, { gridX: 5, gridY: 5 })).toBe(10);
      expect(gridDistance({ gridX: 2, gridY: 3 }, { gridX: 5, gridY: 7 })).toBe(7);
    });

    it('should return 0 for same position', () => {
      expect(gridDistance({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 5 })).toBe(0);
    });
  });

  describe('manhattanDistance', () => {
    it('should calculate Manhattan distance between pixel positions', () => {
      expect(manhattanDistance({ x: 0, y: 0 }, { x: 100, y: 200 })).toBe(300);
    });
  });

  describe('isAdjacent', () => {
    it('should return true for adjacent positions', () => {
      expect(isAdjacent({ gridX: 5, gridY: 5 }, { gridX: 6, gridY: 5 })).toBe(true);
      expect(isAdjacent({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 6 })).toBe(true);
      expect(isAdjacent({ gridX: 5, gridY: 5 }, { gridX: 4, gridY: 5 })).toBe(true);
      expect(isAdjacent({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 4 })).toBe(true);
    });

    it('should return false for non-adjacent positions', () => {
      expect(isAdjacent({ gridX: 5, gridY: 5 }, { gridX: 7, gridY: 5 })).toBe(false);
      expect(isAdjacent({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 5 })).toBe(false);
      expect(isAdjacent({ gridX: 5, gridY: 5 }, { gridX: 6, gridY: 6 })).toBe(false);
    });
  });

  describe('getDirection', () => {
    it('should return correct direction for adjacent positions', () => {
      expect(getDirection({ gridX: 5, gridY: 5 }, { gridX: 6, gridY: 5 })).toBe('right');
      expect(getDirection({ gridX: 5, gridY: 5 }, { gridX: 4, gridY: 5 })).toBe('left');
      expect(getDirection({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 6 })).toBe('down');
      expect(getDirection({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 4 })).toBe('up');
    });

    it('should return null for non-adjacent positions', () => {
      expect(getDirection({ gridX: 5, gridY: 5 }, { gridX: 7, gridY: 5 })).toBeNull();
      expect(getDirection({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 5 })).toBeNull();
    });
  });

  describe('findPath', () => {
    it('should find a straight path', () => {
      const collisionMap = new Set<string>();
      const path = findPath({ gridX: 0, gridY: 0 }, { gridX: 3, gridY: 0 }, collisionMap);
      
      expect(path.length).toBe(4);
      expect(path[0]).toEqual({ gridX: 0, gridY: 0 });
      expect(path[path.length - 1]).toEqual({ gridX: 3, gridY: 0 });
    });

    it('should find a path around obstacles', () => {
      const collisionMap = new Set<string>(['1,0', '2,0']); // Block straight path
      const path = findPath({ gridX: 0, gridY: 0 }, { gridX: 3, gridY: 0 }, collisionMap);
      
      expect(path.length).toBeGreaterThan(4);
      expect(path[0]).toEqual({ gridX: 0, gridY: 0 });
      expect(path[path.length - 1]).toEqual({ gridX: 3, gridY: 0 });
    });

    it('should return empty array when no path exists (completely surrounded)', () => {
      // Create a closed box around the target - player cannot reach it
      const collisionMap = new Set<string>([
        '2,0', '2,1', '2,2', '2,3', '2,4', // Left wall
        '4,0', '4,1', '4,2', '4,3', '4,4', // Right wall
        '2,0', '3,0', '4,0', // Top wall
        '2,4', '3,4', '4,4', // Bottom wall
      ]);
      // Player starts inside the box, target is outside
      const path = findPath({ gridX: 3, gridY: 2 }, { gridX: 10, gridY: 10 }, collisionMap);
      
      expect(path).toHaveLength(0);
    });

    it('should return single point when start equals end', () => {
      const collisionMap = new Set<string>();
      const path = findPath({ gridX: 5, gridY: 5 }, { gridX: 5, gridY: 5 }, collisionMap);
      
      expect(path).toHaveLength(1);
      expect(path[0]).toEqual({ gridX: 5, gridY: 5 });
    });
  });
});
