/**
 * Input Manager
 * Handles keyboard input for player movement
 */

import { useEffect, useRef, useCallback } from 'react'

export type KeyDirection = 'up' | 'down' | 'left' | 'right' | null

interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  interact: boolean
}

/**
 * Hook for handling keyboard input
 * Returns the current direction being pressed
 */
export function useKeyboardInput(
  onDirection: (direction: KeyDirection) => void,
  onInteract: () => void
) {
  const keysRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
  })
  
  const lastDirectionRef = useRef<KeyDirection>(null)
  const interactPressedRef = useRef(false)
  
  const getActiveDirection = useCallback((): KeyDirection => {
    const keys = keysRef.current
    if (keys.up) return 'up'
    if (keys.down) return 'down'
    if (keys.left) return 'left'
    if (keys.right) return 'right'
    return null
  }, [])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'e'].includes(e.key)) {
        e.preventDefault()
      }
      
      let directionChanged = false
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (!keysRef.current.up) {
            keysRef.current.up = true
            directionChanged = true
          }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (!keysRef.current.down) {
            keysRef.current.down = true
            directionChanged = true
          }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (!keysRef.current.left) {
            keysRef.current.left = true
            directionChanged = true
          }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (!keysRef.current.right) {
            keysRef.current.right = true
            directionChanged = true
          }
          break
        case ' ':
        case 'e':
        case 'E':
          if (!keysRef.current.interact) {
            keysRef.current.interact = true
            interactPressedRef.current = true
            onInteract()
          }
          break
      }
      
      if (directionChanged) {
        const direction = getActiveDirection()
        if (direction !== lastDirectionRef.current) {
          lastDirectionRef.current = direction
          onDirection(direction)
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      let directionChanged = false
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          keysRef.current.up = false
          directionChanged = true
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          keysRef.current.down = false
          directionChanged = true
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keysRef.current.left = false
          directionChanged = true
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          keysRef.current.right = false
          directionChanged = true
          break
        case ' ':
        case 'e':
        case 'E':
          keysRef.current.interact = false
          interactPressedRef.current = false
          break
      }
      
      if (directionChanged) {
        const direction = getActiveDirection()
        if (direction !== lastDirectionRef.current) {
          lastDirectionRef.current = direction
          onDirection(direction)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onDirection, onInteract, getActiveDirection])
  
  return {
    getActiveDirection,
    isInteractPressed: () => interactPressedRef.current,
  }
}

/**
 * Get the opposite direction
 */
export function getOppositeDirection(direction: KeyDirection): KeyDirection {
  switch (direction) {
    case 'up': return 'down'
    case 'down': return 'up'
    case 'left': return 'right'
    case 'right': return 'left'
    default: return null
  }
}
