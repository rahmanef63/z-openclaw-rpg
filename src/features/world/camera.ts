/**
 * Camera System
 * Follows the player with smooth scrolling
 */

import { lerp, CELL_SIZE } from '../engine/grid'

export interface CameraState {
  x: number
  y: number
  targetX: number
  targetY: number
  viewportWidth: number
  viewportHeight: number
  mapWidth: number
  mapHeight: number
}

/**
 * Create initial camera state
 */
export function createCameraState(
  viewportWidth: number,
  viewportHeight: number,
  mapWidth: number,
  mapHeight: number,
  initialTargetX: number = 0,
  initialTargetY: number = 0
): CameraState {
  return {
    x: initialTargetX,
    y: initialTargetY,
    targetX: initialTargetX,
    targetY: initialTargetY,
    viewportWidth,
    viewportHeight,
    mapWidth,
    mapHeight,
  }
}

/**
 * Set camera target (usually player position)
 */
export function setCameraTarget(camera: CameraState, targetX: number, targetY: number): void {
  camera.targetX = targetX
  camera.targetY = targetY
}

/**
 * Update camera position (smooth follow)
 */
export function updateCamera(camera: CameraState, deltaTime: number, smoothing: number = 0.1): void {
  // Smooth interpolation towards target
  camera.x = lerp(camera.x, camera.targetX, smoothing)
  camera.y = lerp(camera.y, camera.targetY, smoothing)
  
  // Clamp to map bounds
  const maxOffsetX = camera.mapWidth * CELL_SIZE - camera.viewportWidth
  const maxOffsetY = camera.mapHeight * CELL_SIZE - camera.viewportHeight
  
  if (maxOffsetX > 0) {
    camera.x = Math.max(0, Math.min(camera.x, maxOffsetX))
  } else {
    camera.x = (camera.viewportWidth - camera.mapWidth * CELL_SIZE) / 2
  }
  
  if (maxOffsetY > 0) {
    camera.y = Math.max(0, Math.min(camera.y, maxOffsetY))
  } else {
    camera.y = (camera.viewportHeight - camera.mapHeight * CELL_SIZE) / 2
  }
}

/**
 * Get camera transform for CSS transform property
 */
export function getCameraTransform(camera: CameraState): string {
  return `translate3d(${-camera.x}px, ${-camera.y}px, 0)`
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: CameraState
): { worldX: number; worldY: number } {
  return {
    worldX: screenX + camera.x,
    worldY: screenY + camera.y,
  }
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: CameraState
): { screenX: number; screenY: number } {
  return {
    screenX: worldX - camera.x,
    screenY: worldY - camera.y,
  }
}

/**
 * Check if a world position is visible on screen
 */
export function isOnScreen(
  worldX: number,
  worldY: number,
  camera: CameraState,
  margin: number = 0
): boolean {
  return (
    worldX >= camera.x - margin &&
    worldX <= camera.x + camera.viewportWidth + margin &&
    worldY >= camera.y - margin &&
    worldY <= camera.y + camera.viewportHeight + margin
  )
}
