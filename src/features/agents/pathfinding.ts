/**
 * NPC Pathfinding System
 * Simple A* pathfinding for NPC movement
 */

import { getGridKey, gridDistance } from '../engine/grid'

interface PathNode {
  x: number
  y: number
  g: number // Cost from start
  h: number // Heuristic to goal
  f: number // g + h
  parent: PathNode | null
}

/**
 * Simple A* pathfinding
 */
export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  isBlocked: (x: number, y: number) => boolean,
  maxIterations: number = 100
): Array<{ x: number; y: number }> {
  // Already at destination
  if (startX === endX && startY === endY) {
    return []
  }
  
  const openSet: PathNode[] = []
  const closedSet = new Set<string>()
  
  const startNode: PathNode = {
    x: startX,
    y: startY,
    g: 0,
    h: gridDistance(startX, startY, endX, endY),
    f: gridDistance(startX, startY, endX, endY),
    parent: null,
  }
  
  openSet.push(startNode)
  
  let iterations = 0
  
  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++
    
    // Get node with lowest f
    openSet.sort((a, b) => a.f - b.f)
    const current = openSet.shift()!
    
    // Check if reached goal
    if (current.x === endX && current.y === endY) {
      const path: Array<{ x: number; y: number }> = []
      let node: PathNode | null = current
      
      while (node?.parent) {
        path.unshift({ x: node.x, y: node.y })
        node = node.parent
      }
      
      return path
    }
    
    closedSet.add(getGridKey(current.x, current.y))
    
    // Check neighbors
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
    ]
    
    for (const neighbor of neighbors) {
      const key = getGridKey(neighbor.x, neighbor.y)
      
      // Skip if blocked or already visited
      if (isBlocked(neighbor.x, neighbor.y) || closedSet.has(key)) {
        continue
      }
      
      const g = current.g + 1
      const h = gridDistance(neighbor.x, neighbor.y, endX, endY)
      const f = g + h
      
      // Check if already in open set with better path
      const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)
      if (existing && existing.g <= g) {
        continue
      }
      
      const neighborNode: PathNode = {
        x: neighbor.x,
        y: neighbor.y,
        g,
        h,
        f,
        parent: current,
      }
      
      if (existing) {
        Object.assign(existing, neighborNode)
      } else {
        openSet.push(neighborNode)
      }
    }
  }
  
  // No path found
  return []
}

/**
 * Get next step in path
 */
export function getNextStep(
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  isBlocked: (x: number, y: number) => boolean
): { x: number; y: number; direction: 'up' | 'down' | 'left' | 'right' } | null {
  const path = findPath(currentX, currentY, targetX, targetY, isBlocked, 50)
  
  if (path.length === 0) {
    return null
  }
  
  const next = path[0]
  let direction: 'up' | 'down' | 'left' | 'right'
  
  if (next.y < currentY) direction = 'up'
  else if (next.y > currentY) direction = 'down'
  else if (next.x < currentX) direction = 'left'
  else direction = 'right'
  
  return { x: next.x, y: next.y, direction }
}

/**
 * Simple wander behavior - pick a random nearby walkable tile
 */
export function getWanderTarget(
  currentX: number,
  currentY: number,
  isBlocked: (x: number, y: number) => boolean,
  range: number = 5
): { x: number; y: number } | null {
  const candidates: Array<{ x: number; y: number }> = []
  
  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      if (dx === 0 && dy === 0) continue
      
      const x = currentX + dx
      const y = currentY + dy
      
      if (!isBlocked(x, y)) {
        candidates.push({ x, y })
      }
    }
  }
  
  if (candidates.length === 0) return null
  
  return candidates[Math.floor(Math.random() * candidates.length)]
}
