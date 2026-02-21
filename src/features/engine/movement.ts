import { lerp, CELL_SIZE, getGridKey, getDirection } from './grid'
import type { CollisionMap, isBlocked } from './collision'

/**
 * Movement System
 * Handles grid-based movement with smooth animation
 */

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface MovementState {
  // Current grid position
  gridX: number
  gridY: number
  
  // Target grid position (when moving)
  targetGridX: number
  targetGridY: number
  
  // Pixel position (for rendering)
  pixelX: number
  pixelY: number
  
  // Movement state
  isMoving: boolean
  direction: Direction
  
  // Animation progress (0-1)
  moveProgress: number
  
  // Movement speed (pixels per ms)
  moveSpeed: number // ~150-200ms for 32px = 0.16-0.21 px/ms
}

/**
 * Create initial movement state
 */
export function createMovementState(gridX: number, gridY: number): MovementState {
  return {
    gridX,
    gridY,
    targetGridX: gridX,
    targetGridY: gridY,
    pixelX: gridX * CELL_SIZE,
    pixelY: gridY * CELL_SIZE,
    isMoving: false,
    direction: 'down',
    moveProgress: 0,
    moveSpeed: 0.2, // 32px / 0.2px/ms = 160ms per tile
  }
}

/**
 * Attempt to start moving in a direction
 * Returns true if movement started
 */
export function tryMove(
  state: MovementState,
  direction: Direction,
  collisionMap: CollisionMap,
  mapWidth: number,
  mapHeight: number,
  checkBlocked: (map: CollisionMap, x: number, y: number, w: number, h: number) => boolean
): boolean {
  // Already moving
  if (state.isMoving) return false
  
  // Calculate target position
  let newGridX = state.gridX
  let newGridY = state.gridY
  
  switch (direction) {
    case 'up': newGridY--; break
    case 'down': newGridY++; break
    case 'left': newGridX--; break
    case 'right': newGridX++; break
  }
  
  // Check collision
  if (checkBlocked(collisionMap, newGridX, newGridY, mapWidth, mapHeight)) {
    // Update direction even if blocked
    state.direction = direction
    return false
  }
  
  // Start movement
  state.targetGridX = newGridX
  state.targetGridY = newGridY
  state.direction = direction
  state.isMoving = true
  state.moveProgress = 0
  
  return true
}

/**
 * Update movement state (called every frame)
 * Returns true if movement just completed
 */
export function updateMovement(state: MovementState, deltaTime: number): boolean {
  if (!state.isMoving) return false
  
  // Update progress
  const moveDistance = CELL_SIZE
  const progressIncrement = (state.moveSpeed * deltaTime) / moveDistance
  state.moveProgress += progressIncrement
  
  // Interpolate pixel position
  const startX = state.gridX * CELL_SIZE
  const startY = state.gridY * CELL_SIZE
  const endX = state.targetGridX * CELL_SIZE
  const endY = state.targetGridY * CELL_SIZE
  
  // Ease-out curve for smoother feel
  const t = 1 - Math.pow(1 - state.moveProgress, 3)
  
  state.pixelX = lerp(startX, endX, t)
  state.pixelY = lerp(startY, endY, t)
  
  // Check if movement complete
  if (state.moveProgress >= 1) {
    // Snap to grid
    state.gridX = state.targetGridX
    state.gridY = state.targetGridY
    state.pixelX = state.gridX * CELL_SIZE
    state.pixelY = state.gridY * CELL_SIZE
    state.isMoving = false
    state.moveProgress = 0
    
    return true // Movement completed
  }
  
  return false
}

/**
 * Get the grid position player is facing
 */
export function getFacingPosition(state: MovementState): { x: number; y: number } {
  let facingX = state.gridX
  let facingY = state.gridY
  
  switch (state.direction) {
    case 'up': facingY--; break
    case 'down': facingY++; break
    case 'left': facingX--; break
    case 'right': facingX++; break
  }
  
  return { x: facingX, y: facingY }
}

/**
 * Teleport to a position instantly
 */
export function teleportTo(state: MovementState, gridX: number, gridY: number): void {
  state.gridX = gridX
  state.gridY = gridY
  state.targetGridX = gridX
  state.targetGridY = gridY
  state.pixelX = gridX * CELL_SIZE
  state.pixelY = gridY * CELL_SIZE
  state.isMoving = false
  state.moveProgress = 0
}

/**
 * Cancel current movement and snap to current position
 */
export function cancelMovement(state: MovementState): void {
  state.targetGridX = state.gridX
  state.targetGridY = state.gridY
  state.pixelX = state.gridX * CELL_SIZE
  state.pixelY = state.gridY * CELL_SIZE
  state.isMoving = false
  state.moveProgress = 0
}
