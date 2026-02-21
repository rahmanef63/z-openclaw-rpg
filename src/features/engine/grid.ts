// Grid math utilities for Super Space RPG

import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from './constants';
import type { Position, GridPosition } from './types';

// Alias for backward compatibility
export const CELL_SIZE = TILE_SIZE;

/**
 * Convert grid position to pixel position
 */
export function gridToPixel(gridX: number, gridY: number): Position {
  return {
    x: gridX * TILE_SIZE,
    y: gridY * TILE_SIZE,
  };
}

/**
 * Convert pixel position to grid position
 */
export function pixelToGrid(x: number, y: number): GridPosition {
  return {
    gridX: Math.floor(x / TILE_SIZE),
    gridY: Math.floor(y / TILE_SIZE),
  };
}

/**
 * Snap pixel position to grid
 */
export function snapToGrid(x: number, y: number): Position {
  return gridToPixel(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
}

/**
 * Check if a grid position is within map bounds
 * Overload that accepts optional map dimensions
 */
export function isInBounds(gridX: number, gridY: number, mapWidth?: number, mapHeight?: number): boolean {
  const width = mapWidth ?? MAP_WIDTH;
  const height = mapHeight ?? MAP_HEIGHT;
  return gridX >= 0 && gridX < width && gridY >= 0 && gridY < height;
}

/**
 * Create a collision key from grid coordinates
 */
export function createCollisionKey(gridX: number, gridY: number): string {
  return `${gridX},${gridY}`;
}

/**
 * Parse collision key back to grid coordinates
 */
export function parseCollisionKey(key: string): GridPosition {
  const [x, y] = key.split(',').map(Number);
  return { gridX: x, gridY: y };
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

/**
 * Ease out quad for smooth movement
 */
export function easeOutQuad(progress: number): number {
  return 1 - (1 - progress) * (1 - progress);
}

/**
 * Calculate distance between two grid positions
 */
export function gridDistance(from: GridPosition, to: GridPosition): number {
  return Math.abs(from.gridX - to.gridX) + Math.abs(from.gridY - to.gridY);
}

/**
 * Calculate Manhattan distance between two pixel positions
 */
export function manhattanDistance(from: Position, to: Position): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

/**
 * Check if two grid positions are adjacent
 */
export function isAdjacent(from: GridPosition, to: GridPosition): boolean {
  return gridDistance(from, to) === 1;
}

/**
 * Get direction from one grid position to another
 */
export function getDirection(from: GridPosition, to: GridPosition): string | null {
  const dx = to.gridX - from.gridX;
  const dy = to.gridY - from.gridY;
  
  if (Math.abs(dx) + Math.abs(dy) !== 1) return null;
  
  if (dx === 1) return 'right';
  if (dx === -1) return 'left';
  if (dy === 1) return 'down';
  if (dy === -1) return 'up';
  
  return null;
}

/**
 * Simple A* pathfinding for NPCs
 */
export function findPath(
  start: GridPosition,
  end: GridPosition,
  collisionMap: Set<string>
): GridPosition[] {
  const openSet: GridPosition[] = [start];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  const startKey = createCollisionKey(start.gridX, start.gridY);
  const endKey = createCollisionKey(end.gridX, end.gridY);
  
  gScore.set(startKey, 0);
  fScore.set(startKey, gridDistance(start, end));
  
  while (openSet.length > 0) {
    // Get node with lowest fScore
    let current = openSet[0];
    let currentIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      const key = createCollisionKey(openSet[i].gridX, openSet[i].gridY);
      const currentKey = createCollisionKey(current.gridX, current.gridY);
      if ((fScore.get(key) ?? Infinity) < (fScore.get(currentKey) ?? Infinity)) {
        current = openSet[i];
        currentIdx = i;
      }
    }
    
    const currentKey = createCollisionKey(current.gridX, current.gridY);
    
    if (currentKey === endKey) {
      // Reconstruct path
      const path: GridPosition[] = [current];
      let key = currentKey;
      while (cameFrom.has(key)) {
        key = cameFrom.get(key)!;
        path.unshift(parseCollisionKey(key));
      }
      return path;
    }
    
    openSet.splice(currentIdx, 1);
    
    // Check neighbors
    const neighbors = [
      { gridX: current.gridX + 1, gridY: current.gridY },
      { gridX: current.gridX - 1, gridY: current.gridY },
      { gridX: current.gridX, gridY: current.gridY + 1 },
      { gridX: current.gridX, gridY: current.gridY - 1 },
    ];
    
    for (const neighbor of neighbors) {
      if (!isInBounds(neighbor.gridX, neighbor.gridY)) continue;
      
      const neighborKey = createCollisionKey(neighbor.gridX, neighbor.gridY);
      if (collisionMap.has(neighborKey) && neighborKey !== endKey) continue;
      
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
      
      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + gridDistance(neighbor, end));
        
        if (!openSet.some(n => createCollisionKey(n.gridX, n.gridY) === neighborKey)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return []; // No path found
}

// Alias for backward compatibility
export const getGridKey = createCollisionKey;
