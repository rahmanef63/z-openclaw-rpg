'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useGameLoop } from '@/hooks/useGameLoop'
import { useKeyboardInput } from '@/features/character/input'
import { 
  CELL_SIZE, 
} from '@/features/engine/grid'
import {
  createCollisionMap,
  addBlockedTiles,
  isBlocked,
  addInteractiveObject,
  getInteractiveAt,
} from '@/features/engine/collision'
import {
  createMovementState,
  tryMove,
  updateMovement,
  getFacingPosition,
  Direction,
  MovementState,
} from '@/features/engine/movement'
import {
  createCameraState,
  updateCamera,
  getCameraTransform,
  CameraState,
} from '@/features/world/camera'
import {
  createParticleSystem,
  updateParticles,
  spawnParticles,
  Particle,
} from '@/features/world/particles'
import {
  getSpriteStyles,
  getFloorTileStyles,
  getObjectSpriteStyles,
  getDirectionIndicatorStyles,
  getPatternOverlay,
  getNPCSpriteStyles,
} from '@/features/world/sprites'
import { workspaceMap, getCollisionPositions, MapObject } from '@/data/maps/workspace'

// Render state that triggers re-renders
interface RenderState {
  playerX: number
  playerY: number
  playerDirection: 'up' | 'down' | 'left' | 'right'
  playerIsMoving: boolean
  cameraX: number
  cameraY: number
  particles: Particle[]
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Refs for game state (no React re-renders during game loop)
  const collisionMapRef = useRef(createCollisionMap())
  const movementRef = useRef<MovementState | null>(null)
  const cameraRef = useRef<CameraState | null>(null)
  const particlesRef = useRef(createParticleSystem())
  const lastSyncRef = useRef(0)
  
  // Render state - triggers React re-renders
  const [renderState, setRenderState] = useState<RenderState>({
    playerX: 10 * CELL_SIZE,
    playerY: 10 * CELL_SIZE,
    playerDirection: 'down',
    playerIsMoving: false,
    cameraX: 0,
    cameraY: 0,
    particles: [],
  })
  
  // Store actions
  const { 
    openWindow, 
    updatePlayerState, 
    setHoveredObject,
    setInteractionHint,
    npcs,
    metrics,
    hoveredObject,
  } = useGameStore()
  
  // Initialize game state
  useEffect(() => {
    // Initialize movement state
    const spawn = workspaceMap.spawnPoint
    movementRef.current = createMovementState(spawn.x, spawn.y)
    
    // Initialize camera state
    cameraRef.current = createCameraState(
      typeof window !== 'undefined' ? window.innerWidth : 800,
      typeof window !== 'undefined' ? window.innerHeight : 600,
      workspaceMap.width,
      workspaceMap.height
    )
    
    // Initialize collision map
    const map = collisionMapRef.current
    const blockedPositions = getCollisionPositions(workspaceMap.objects)
    addBlockedTiles(map, blockedPositions)
    
    workspaceMap.objects.forEach(obj => {
      if (obj.isInteractive) {
        const width = obj.width || 1
        const height = obj.height || 1
        for (let dx = 0; dx < width; dx++) {
          for (let dy = 0; dy < height; dy++) {
            addInteractiveObject(map, obj.id, obj.x + dx, obj.y + dy, false)
          }
        }
      }
    })
    
    // Center camera on player
    if (cameraRef.current && movementRef.current) {
      cameraRef.current.targetX = spawn.x * CELL_SIZE - cameraRef.current.viewportWidth / 2 + CELL_SIZE / 2
      cameraRef.current.targetY = spawn.y * CELL_SIZE - cameraRef.current.viewportHeight / 2 + CELL_SIZE / 2
      cameraRef.current.x = cameraRef.current.targetX
      cameraRef.current.y = cameraRef.current.targetY
    }
    // Note: Render state is already initialized with correct spawn values in useState
  }, [])
  
  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        cameraRef.current.viewportWidth = rect.width
        cameraRef.current.viewportHeight = rect.height
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Handle interaction
  const handleInteract = useCallback(() => {
    if (!movementRef.current) return
    
    const facing = getFacingPosition(movementRef.current)
    const objectId = getInteractiveAt(collisionMapRef.current, facing.x, facing.y)
    
    if (objectId) {
      const obj = workspaceMap.objects.find(o => o.id === objectId)
      if (obj && obj.interactionType === 'open_window') {
        let windowType: 'desk' | 'server' | 'tasks' | 'analytics' | 'settings' | 'chat' | null = null
        
        if (obj.type === 'desk') windowType = 'desk'
        else if (obj.type === 'server_rack') windowType = 'server'
        else if (obj.type === 'terminal') windowType = 'analytics'
        
        if (windowType) {
          openWindow(windowType, { objectId: obj.id })
          
          const centerX = obj.x * CELL_SIZE + (obj.width || 1) * CELL_SIZE / 2
          const centerY = obj.y * CELL_SIZE + (obj.height || 1) * CELL_SIZE / 2
          spawnParticles(particlesRef.current, centerX, centerY, 'success', 5)
        }
      }
    }
  }, [openWindow])
  
  // Handle direction change from keyboard
  const handleDirectionChange = useCallback((direction: 'up' | 'down' | 'left' | 'right' | null) => {
    if (direction && movementRef.current && cameraRef.current) {
      tryMove(
        movementRef.current,
        direction as Direction,
        collisionMapRef.current,
        workspaceMap.width,
        workspaceMap.height,
        isBlocked
      )
    }
  }, [])
  
  // Keyboard input
  useKeyboardInput(handleDirectionChange, handleInteract)
  
  // Game loop update function
  const gameUpdate = useCallback((deltaTime: number) => {
    if (!movementRef.current || !cameraRef.current) return
    
    const movement = movementRef.current
    const camera = cameraRef.current
    
    // Update movement
    const movementCompleted = updateMovement(movement, deltaTime)
    
    // Update camera target to follow player
    camera.targetX = movement.pixelX - camera.viewportWidth / 2 + CELL_SIZE / 2
    camera.targetY = movement.pixelY - camera.viewportHeight / 2 + CELL_SIZE / 2
    
    // Update camera position
    updateCamera(camera, deltaTime)
    
    // Update particles
    updateParticles(particlesRef.current, deltaTime)
    
    // Sync to React state (debounced)
    const now = Date.now()
    if (now - lastSyncRef.current > 16) { // ~60fps for render
      lastSyncRef.current = now
      
      // Update Zustand store
      updatePlayerState(
        movement.gridX,
        movement.gridY,
        movement.direction,
        movement.isMoving
      )
      
      // Update local render state
      setRenderState({
        playerX: movement.pixelX,
        playerY: movement.pixelY,
        playerDirection: movement.direction,
        playerIsMoving: movement.isMoving,
        cameraX: camera.x,
        cameraY: camera.y,
        particles: [...particlesRef.current.particles],
      })
    }
  }, [updatePlayerState])
  
  // Run game loop
  useGameLoop({ onUpdate: gameUpdate })
  
  // Render floor tiles
  const renderFloor = useCallback(() => {
    const tiles = []
    for (let y = 0; y < workspaceMap.height; y++) {
      for (let x = 0; x < workspaceMap.width; x++) {
        tiles.push(
          <div
            key={`floor-${x}-${y}`}
            style={{
              position: 'absolute',
              left: x * CELL_SIZE,
              top: y * CELL_SIZE,
              ...getFloorTileStyles(x, y),
            }}
          />
        )
      }
    }
    return tiles
  }, [])
  
  // Render objects
  const renderObjects = useCallback(() => {
    return workspaceMap.objects.map(obj => {
      const width = obj.width || 1
      const height = obj.height || 1
      const isHovered = hoveredObject === obj.id
      const visualState = obj.type === 'server_rack' 
        ? (metrics.serverHealth === 'healthy' ? 'healthy' : metrics.serverHealth)
        : (obj.visualState || 'default')
      
      const styles = getObjectSpriteStyles(obj.type, visualState as any, width, height, isHovered)
      const pattern = getPatternOverlay(obj.type as any, visualState as any)
      
      return (
        <div
          key={obj.id}
          style={{
            position: 'absolute',
            left: obj.x * CELL_SIZE,
            top: obj.y * CELL_SIZE,
            ...styles,
            ...(pattern || {}),
            cursor: obj.isInteractive ? 'pointer' : 'default',
          }}
          onMouseEnter={() => {
            if (obj.isInteractive) {
              setHoveredObject(obj.id)
              setInteractionHint(obj.description || null)
            }
          }}
          onMouseLeave={() => {
            setHoveredObject(null)
            setInteractionHint(null)
          }}
          onClick={() => {
            if (obj.isInteractive && obj.interactionType === 'open_window') {
              handleInteract()
            }
          }}
        >
          {/* Glow effect for interactive objects */}
          {obj.isInteractive && (
            <div
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: '4px',
                border: isHovered ? '2px solid #00ffff' : '1px solid transparent',
                transition: 'border-color 0.2s ease',
                pointerEvents: 'none',
              }}
            />
          )}
          
          {/* Label for certain objects */}
          {obj.type === 'server_rack' && (
            <div
              style={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                fontFamily: 'monospace',
              }}
            >
              SERVER
            </div>
          )}
        </div>
      )
    })
  }, [hoveredObject, metrics.serverHealth, setHoveredObject, setInteractionHint, handleInteract])
  
  // Render NPCs
  const renderNPCs = useCallback(() => {
    return npcs.map(npc => {
      const styles = getNPCSpriteStyles(npc.isMoving)
      
      return (
        <div
          key={npc.id}
          style={{
            position: 'absolute',
            left: npc.gridX * CELL_SIZE,
            top: npc.gridY * CELL_SIZE,
            ...styles,
            zIndex: 100,
          }}
        >
          {/* NPC label */}
          <div
            style={{
              position: 'absolute',
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: '#ff00ff',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              textShadow: '0 0 4px #ff00ff',
            }}
          >
            {npc.name}
          </div>
          
          {/* Speech bubble */}
          {npc.message && (
            <div
              style={{
                position: 'absolute',
                top: -48,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid #ff00ff',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
                maxWidth: '200px',
                boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)',
                fontFamily: 'monospace',
              }}
            >
              {npc.message}
            </div>
          )}
        </div>
      )
    })
  }, [npcs])
  
  // Render player - uses renderState instead of refs
  const renderPlayer = useCallback(() => {
    const styles = getSpriteStyles('player', 'default', renderState.playerDirection, renderState.playerIsMoving)
    
    return (
      <div
        style={{
          position: 'absolute',
          left: renderState.playerX,
          top: renderState.playerY,
          ...styles,
          zIndex: 200,
        }}
      >
        {/* Direction indicator */}
        {renderState.playerIsMoving && (
          <div style={getDirectionIndicatorStyles(renderState.playerDirection)} />
        )}
        
        {/* Player label */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#00ffff',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            textShadow: '0 0 4px #00ffff',
          }}
        >
          YOU
        </div>
      </div>
    )
  }, [renderState.playerX, renderState.playerY, renderState.playerDirection, renderState.playerIsMoving])
  
  // Render particles - uses renderState instead of refs
  const renderParticles = useCallback(() => {
    return renderState.particles.map(particle => (
      <div
        key={particle.id}
        style={{
          position: 'absolute',
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: '50%',
          opacity: particle.life,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          pointerEvents: 'none',
        }}
      />
    ))
  }, [renderState.particles])
  
  // Camera transform - uses renderState
  const cameraTransform = `translate3d(${-renderState.cameraX}px, ${-renderState.cameraY}px, 0)`
  
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#0f172a',
      }}
    >
      {/* Game World */}
      <div
        ref={canvasRef}
        style={{
          position: 'absolute',
          width: workspaceMap.width * CELL_SIZE,
          height: workspaceMap.height * CELL_SIZE,
          transform: cameraTransform,
          willChange: 'transform',
        }}
      >
        {/* Layer 1: Floor */}
        {renderFloor()}
        
        {/* Layer 2: Objects */}
        {renderObjects()}
        
        {/* Layer 3: Characters (NPCs) */}
        {renderNPCs()}
        
        {/* Layer 4: Player */}
        {renderPlayer()}
        
        {/* Layer 5: Particles */}
        {renderParticles()}
      </div>
    </div>
  )
}
