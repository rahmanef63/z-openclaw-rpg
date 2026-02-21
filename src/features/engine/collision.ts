import { getGridKey, isInBounds } from './grid'

/**
 * Collision System
 * Uses a Set of grid keys for O(1) collision lookups
 */

export interface CollisionMap {
  blocked: Set<string>
  interactive: Map<string, string> // gridKey -> objectId
  triggers: Map<string, string> // gridKey -> triggerType
}

/**
 * Create an empty collision map
 */
export function createCollisionMap(): CollisionMap {
  return {
    blocked: new Set(),
    interactive: new Map(),
    triggers: new Map(),
  }
}

/**
 * Add a blocked tile
 */
export function addBlockedTile(map: CollisionMap, gridX: number, gridY: number): void {
  map.blocked.add(getGridKey(gridX, gridY))
}

/**
 * Add multiple blocked tiles (for walls, furniture, etc.)
 */
export function addBlockedTiles(map: CollisionMap, positions: Array<{ x: number; y: number }>): void {
  positions.forEach(({ x, y }) => {
    map.blocked.add(getGridKey(x, y))
  })
}

/**
 * Check if a tile is blocked
 */
export function isBlocked(map: CollisionMap, gridX: number, gridY: number, mapWidth: number, mapHeight: number): boolean {
  // Check bounds
  if (!isInBounds(gridX, gridY, mapWidth, mapHeight)) {
    return true
  }
  
  // Check blocked set
  return map.blocked.has(getGridKey(gridX, gridY))
}

/**
 * Add an interactive object
 */
export function addInteractiveObject(
  map: CollisionMap, 
  objectId: string, 
  gridX: number, 
  gridY: number,
  isBlocking: boolean = true
): void {
  const key = getGridKey(gridX, gridY)
  map.interactive.set(key, objectId)
  if (isBlocking) {
    map.blocked.add(key)
  }
}

/**
 * Get interactive object at position
 */
export function getInteractiveAt(map: CollisionMap, gridX: number, gridY: number): string | undefined {
  return map.interactive.get(getGridKey(gridX, gridY))
}

/**
 * Add a trigger zone
 */
export function addTrigger(map: CollisionMap, triggerType: string, gridX: number, gridY: number): void {
  map.triggers.set(getGridKey(gridX, gridY), triggerType)
}

/**
 * Get trigger at position
 */
export function getTriggerAt(map: CollisionMap, gridX: number, gridY: number): string | undefined {
  return map.triggers.get(getGridKey(gridX, gridY))
}

/**
 * Build collision map from map data
 */
export interface MapTile {
  x: number
  y: number
  type: string
  objectId?: string
  canCollide?: boolean
  isInteractive?: boolean
}

export function buildCollisionMap(tiles: MapTile[], mapWidth: number, mapHeight: number): CollisionMap {
  const map = createCollisionMap()
  
  tiles.forEach(tile => {
    const key = getGridKey(tile.x, tile.y)
    
    if (tile.canCollide) {
      map.blocked.add(key)
    }
    
    if (tile.isInteractive && tile.objectId) {
      map.interactive.set(key, tile.objectId)
    }
  })
  
  // Add boundary walls
  for (let x = 0; x < mapWidth; x++) {
    map.blocked.add(getGridKey(x, -1))
    map.blocked.add(getGridKey(x, mapHeight))
  }
  for (let y = 0; y < mapHeight; y++) {
    map.blocked.add(getGridKey(-1, y))
    map.blocked.add(getGridKey(mapWidth, y))
  }
  
  return map
}
