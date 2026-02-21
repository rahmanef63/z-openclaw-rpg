'use client';

import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
import Image from 'next/image';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameStore } from '@/stores/gameStore';
import { useBuildStore, getFurnitureById, ASPECT_NAMES, type LifeAspect, type PlacedFurniture } from '@/stores';
import { workspaceScene, generateCollisionMap, getObjectAtPosition } from '@/data/maps/workspace';
import { 
  TILE_SIZE, 
  WALK_DURATION,
  RUN_DURATION,
  COLORS,
  DIRECTIONS,
  MAP_WIDTH,
  MAP_HEIGHT 
} from '@/features/engine/constants';
import { 
  gridToPixel, 
  pixelToGrid,
  lerp, 
  easeOutQuad, 
  createCollisionKey,
  findPath,
  isInBounds
} from '@/features/engine/grid';
import { 
  getPlayerSprite,
  getServerRackSprite,
  getPlantSprite,
  furnitureAssets,
  characterAssets,
  preloadAssets,
} from '@/features/world/assets';
import { getRotatedDimensions } from '@/lib/gameUtils';
import type { Direction, InputState, Position, GridPosition, WorldObject, NPC, BusinessMetric, VisualState } from '@/features/engine/types';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Player refs (no re-renders for performance)
  const playerPosRef = useRef<Position>(
    gridToPixel(workspaceScene.spawnPoint.gridX, workspaceScene.spawnPoint.gridY)
  );
  const playerTargetRef = useRef<Position | null>(null);
  const playerDirectionRef = useRef<Direction>('down');
  const isMovingRef = useRef(false);
  const movementStartRef = useRef<number>(0);
  const movementFromRef = useRef<Position>({ x: 0, y: 0 });
  const isRunningRef = useRef(false);
  
  // Input state ref
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
  });
  
  // Pathfinding state
  const currentPathRef = useRef<GridPosition[]>([]);
  const pathIndexRef = useRef<number>(0);
  
  // Collision map (computed once, then updated with furniture)
  const collisionMapRef = useRef<Set<string>>(generateCollisionMap(workspaceScene));
  
  // Store state
  const {
    playerGridPos,
    setPlayerPosition,
    setPlayerDirection,
    setPlayerState,
    setIsRunning,
    openWindow,
    windows,
    npcs,
    metrics,
  } = useGameStore();
  
  // Build mode state
  const {
    isBuildMode,
    selectedAssetId,
    selectedPlacedId,
    placedFurniture,
    rotation,
    selectAsset,
    selectPlaced,
    placeFurniture,
    removeFurniture,
    isCellOccupied,
    getFurnitureAt,
  } = useBuildStore();
  
  // Preview state for build mode
  const [previewCell, setPreviewCell] = useState<{ x: number; y: number } | null>(null);
  
  // Camera offset for centering player
  const cameraRef = useRef({ x: 0, y: 0 });
  
  // Preload assets on mount
  useEffect(() => {
    preloadAssets();
  }, []);
  
  // Update collision map when furniture changes
  useEffect(() => {
    // Reset collision map
    const baseMap = generateCollisionMap(workspaceScene);
    
    // Add placed furniture to collision map (only in play mode)
    if (!isBuildMode) {
      placedFurniture.forEach(f => {
        const dims = getRotatedDimensions(f.width, f.height, f.rotation);
        for (let dx = 0; dx < dims.width; dx++) {
          for (let dy = 0; dy < dims.height; dy++) {
            baseMap.add(createCollisionKey(f.gridX + dx, f.gridY + dy));
          }
        }
      });
    }
    
    collisionMapRef.current = baseMap;
  }, [placedFurniture, isBuildMode]);
  
  // Handle keyboard input (including Shift for running)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in build mode or windows open
      if (isBuildMode || windows.length > 0) return;
      
      // Shift for running
      if (e.shiftKey) {
        isRunningRef.current = true;
        setIsRunning(true);
      }
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.up = true;
          playerDirectionRef.current = 'up';
          currentPathRef.current = [];
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.down = true;
          playerDirectionRef.current = 'down';
          currentPathRef.current = [];
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = true;
          playerDirectionRef.current = 'left';
          currentPathRef.current = [];
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = true;
          playerDirectionRef.current = 'right';
          currentPathRef.current = [];
          break;
        case 'e':
        case ' ':
        case 'enter':
          inputRef.current.interact = true;
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Shift released
      if (e.key === 'Shift') {
        isRunningRef.current = false;
        setIsRunning(false);
      }
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.up = false;
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.down = false;
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = false;
          break;
        case 'e':
        case ' ':
        case 'enter':
          inputRef.current.interact = false;
          break;
      }
    };
    
    globalThis.window.addEventListener('keydown', handleKeyDown);
    globalThis.window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      globalThis.window.removeEventListener('keydown', handleKeyDown);
      globalThis.window.removeEventListener('keyup', handleKeyUp);
    };
  }, [windows.length, setIsRunning, isBuildMode]);
  
  // Handle canvas click - different behavior for build mode
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (windows.length > 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get click position relative to the game world
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + cameraRef.current.x;
    const clickY = e.clientY - rect.top + cameraRef.current.y;
    
    // Convert to grid position
    const targetGrid = pixelToGrid(clickX, clickY);
    
    // BUILD MODE: Place furniture
    if (isBuildMode) {
      // Check if clicked on existing furniture
      const clickedFurniture = getFurnitureAt(targetGrid.gridX, targetGrid.gridY);
      
      if (clickedFurniture) {
        // Select the furniture
        selectPlaced(clickedFurniture.id);
        return;
      }
      
      // If we have an asset selected, try to place it
      if (selectedAssetId) {
        const asset = getFurnitureById(selectedAssetId);
        if (asset) {
          const dims = getRotatedDimensions(asset.width, asset.height, rotation);
          
          // Check bounds
          if (targetGrid.gridX >= 0 && targetGrid.gridY >= 0 &&
              targetGrid.gridX + dims.width <= MAP_WIDTH &&
              targetGrid.gridY + dims.height <= MAP_HEIGHT) {
            
            // Check if cells are free
            let canPlace = true;
            for (let dx = 0; dx < dims.width; dx++) {
              for (let dy = 0; dy < dims.height; dy++) {
                if (isCellOccupied(targetGrid.gridX + dx, targetGrid.gridY + dy)) {
                  canPlace = false;
                  break;
                }
              }
              if (!canPlace) break;
            }
            
            if (canPlace) {
              placeFurniture({
                assetId: asset.id,
                gridX: targetGrid.gridX,
                gridY: targetGrid.gridY,
                aspectCategory: asset.category,
                name: asset.name,
                nameEn: asset.nameEn,
                width: asset.width,
                height: asset.height,
              });
            }
          }
        }
      } else {
        // Deselect if clicking on empty space without asset selected
        selectPlaced(null);
      }
      return;
    }
    
    // PLAY MODE: Click-to-move and interactions
    // Check if we clicked on an interactive object
    const clickedObject = getObjectAtPosition(workspaceScene, targetGrid.gridX, targetGrid.gridY);
    
    // If clicked on interactive object, activate it directly
    if (clickedObject?.interactionType) {
      const [, windowType] = clickedObject.interactionType.split(':');
      openWindow({
        title: clickedObject.label || windowType,
        type: windowType,
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 50,
        width: 400,
        height: 300,
        isMinimized: false,
        data: { objectId: clickedObject.id },
      });
      return;
    }
    
    // Otherwise, find path to target
    if (!isInBounds(targetGrid.gridX, targetGrid.gridY)) return;
    if (collisionMapRef.current.has(createCollisionKey(targetGrid.gridX, targetGrid.gridY))) {
      // Find nearest walkable tile
      const nearbyTiles = [
        { gridX: targetGrid.gridX, gridY: targetGrid.gridY - 1 },
        { gridX: targetGrid.gridX, gridY: targetGrid.gridY + 1 },
        { gridX: targetGrid.gridX - 1, gridY: targetGrid.gridY },
        { gridX: targetGrid.gridX + 1, gridY: targetGrid.gridY },
      ];
      
      for (const tile of nearbyTiles) {
        if (isInBounds(tile.gridX, tile.gridY) && 
            !collisionMapRef.current.has(createCollisionKey(tile.gridX, tile.gridY))) {
          targetGrid.gridX = tile.gridX;
          targetGrid.gridY = tile.gridY;
          break;
        }
      }
    }
    
    // Calculate path
    const currentGrid = {
      gridX: Math.round(playerPosRef.current.x / TILE_SIZE),
      gridY: Math.round(playerPosRef.current.y / TILE_SIZE),
    };
    const path = findPath(currentGrid, targetGrid, collisionMapRef.current);
    if (path.length > 1) {
      currentPathRef.current = path;
      pathIndexRef.current = 1;
    }
  }, [windows.length, openWindow, isBuildMode, selectedAssetId, rotation, getFurnitureAt, selectPlaced, isCellOccupied, placeFurniture]);
  
  // Handle mouse move for build mode preview
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isBuildMode || !selectedAssetId) {
      setPreviewCell(null);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + cameraRef.current.x;
    const mouseY = e.clientY - rect.top + cameraRef.current.y;
    
    const gridPos = pixelToGrid(mouseX, mouseY);
    setPreviewCell({ x: gridPos.gridX, y: gridPos.gridY });
  }, [isBuildMode, selectedAssetId]);
  
  // Handle right-click to cancel/remove
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isBuildMode) {
      if (selectedPlacedId) {
        removeFurniture(selectedPlacedId);
      } else if (selectedAssetId) {
        selectAsset(null);
      }
    }
  }, [isBuildMode, selectedPlacedId, selectedAssetId, removeFurniture, selectAsset]);
  
  // Try to start movement in a direction
  const tryMove = useCallback((dir: Direction) => {
    if (isMovingRef.current || isBuildMode) return;
    
    const currentGrid = {
      gridX: Math.round(playerPosRef.current.x / TILE_SIZE),
      gridY: Math.round(playerPosRef.current.y / TILE_SIZE),
    };
    
    const dirVector = DIRECTIONS[dir.toUpperCase() as keyof typeof DIRECTIONS];
    const targetGridX = currentGrid.gridX + dirVector.x;
    const targetGridY = currentGrid.gridY + dirVector.y;
    
    // Check collision
    const collisionKey = createCollisionKey(targetGridX, targetGridY);
    if (collisionMapRef.current.has(collisionKey)) {
      return;
    }
    
    // Check bounds
    if (targetGridX < 0 || targetGridX >= workspaceScene.width ||
        targetGridY < 0 || targetGridY >= workspaceScene.height) {
      return;
    }
    
    // Start movement
    const targetPixel = gridToPixel(targetGridX, targetGridY);
    playerTargetRef.current = targetPixel;
    movementFromRef.current = { ...playerPosRef.current };
    movementStartRef.current = performance.now();
    isMovingRef.current = true;
    
    setPlayerDirection(dir);
    setPlayerState(isRunningRef.current ? 'running' : 'walking');
  }, [setPlayerDirection, setPlayerState, isBuildMode]);
  
  // Move to next path node
  const moveAlongPath = useCallback(() => {
    if (currentPathRef.current.length === 0 || isBuildMode) return;
    if (isMovingRef.current) return;
    
    const nextNode = currentPathRef.current[pathIndexRef.current];
    if (!nextNode) {
      currentPathRef.current = [];
      pathIndexRef.current = 0;
      return;
    }
    
    const currentGrid = {
      gridX: Math.round(playerPosRef.current.x / TILE_SIZE),
      gridY: Math.round(playerPosRef.current.y / TILE_SIZE),
    };
    
    const dx = nextNode.gridX - currentGrid.gridX;
    const dy = nextNode.gridY - currentGrid.gridY;
    
    let dir: Direction;
    if (dx === 1) dir = 'right';
    else if (dx === -1) dir = 'left';
    else if (dy === 1) dir = 'down';
    else if (dy === -1) dir = 'up';
    else {
      pathIndexRef.current++;
      return;
    }
    
    playerDirectionRef.current = dir;
    
    const targetPixel = gridToPixel(nextNode.gridX, nextNode.gridY);
    playerTargetRef.current = targetPixel;
    movementFromRef.current = { ...playerPosRef.current };
    movementStartRef.current = performance.now();
    isMovingRef.current = true;
    
    setPlayerDirection(dir);
    setPlayerState(isRunningRef.current ? 'running' : 'walking');
    
    pathIndexRef.current++;
    
    if (pathIndexRef.current >= currentPathRef.current.length) {
      currentPathRef.current = [];
      pathIndexRef.current = 0;
    }
  }, [setPlayerDirection, setPlayerState, isBuildMode]);
  
  // Handle interaction with adjacent object
  const handleInteraction = useCallback(() => {
    if (isBuildMode) return;
    
    const currentGrid = {
      gridX: Math.round(playerPosRef.current.x / TILE_SIZE),
      gridY: Math.round(playerPosRef.current.y / TILE_SIZE),
    };
    
    const dirVector = DIRECTIONS[playerDirectionRef.current.toUpperCase() as keyof typeof DIRECTIONS];
    const targetGridX = currentGrid.gridX + dirVector.x;
    const targetGridY = currentGrid.gridY + dirVector.y;
    
    const obj = getObjectAtPosition(workspaceScene, targetGridX, targetGridY);
    
    if (obj?.interactionType) {
      const [, windowType] = obj.interactionType.split(':');
      openWindow({
        title: obj.label || windowType,
        type: windowType,
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 50,
        width: 400,
        height: 300,
        isMinimized: false,
        data: { objectId: obj.id },
      });
    }
  }, [openWindow, isBuildMode]);
  
  // Game loop
  const gameLoop = useCallback((deltaTime: number) => {
    // Skip movement in build mode
    if (!isBuildMode) {
      const hasKeyboardInput = inputRef.current.up || inputRef.current.down || 
                               inputRef.current.left || inputRef.current.right;
      
      if (!isMovingRef.current) {
        if (hasKeyboardInput) {
          if (inputRef.current.up) tryMove('up');
          else if (inputRef.current.down) tryMove('down');
          else if (inputRef.current.left) tryMove('left');
          else if (inputRef.current.right) tryMove('right');
        } else if (currentPathRef.current.length > 0) {
          moveAlongPath();
        }
      }
      
      if (inputRef.current.interact) {
        inputRef.current.interact = false;
        handleInteraction();
      }
      
      // Update movement animation
      if (isMovingRef.current && playerTargetRef.current) {
        const duration = isRunningRef.current ? RUN_DURATION : WALK_DURATION;
        const elapsed = performance.now() - movementStartRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        
        playerPosRef.current = {
          x: lerp(movementFromRef.current.x, playerTargetRef.current.x, easedProgress),
          y: lerp(movementFromRef.current.y, playerTargetRef.current.y, easedProgress),
        };
        
        if (progress >= 1) {
          playerPosRef.current = { ...playerTargetRef.current };
          playerTargetRef.current = null;
          isMovingRef.current = false;
          
          if (!hasKeyboardInput && currentPathRef.current.length === 0) {
            setPlayerState('idle');
          }
          
          const newGrid = {
            gridX: Math.round(playerPosRef.current.x / TILE_SIZE),
            gridY: Math.round(playerPosRef.current.y / TILE_SIZE),
          };
          setPlayerPosition(newGrid);
        }
      }
    }
    
    // Update camera (always, even in build mode)
    const viewportWidth = globalThis.window.innerWidth;
    const viewportHeight = globalThis.window.innerHeight;
    const mapPixelWidth = workspaceScene.width * TILE_SIZE;
    const mapPixelHeight = workspaceScene.height * TILE_SIZE;
    
    // Center camera on player (or allow free pan in build mode)
    let targetCameraX = playerPosRef.current.x - viewportWidth / 2 + TILE_SIZE / 2;
    let targetCameraY = playerPosRef.current.y - viewportHeight / 2 + TILE_SIZE / 2;
    
    // Clamp camera to map bounds
    targetCameraX = Math.max(0, Math.min(targetCameraX, mapPixelWidth - viewportWidth));
    targetCameraY = Math.max(0, Math.min(targetCameraY, mapPixelHeight - viewportHeight));
    
    // Smooth camera
    cameraRef.current.x = lerp(cameraRef.current.x, targetCameraX, 0.1);
    cameraRef.current.y = lerp(cameraRef.current.y, targetCameraY, 0.1);
    
    // Update DOM transforms
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate3d(${-cameraRef.current.x}px, ${-cameraRef.current.y}px, 0)`;
    }
  }, [tryMove, moveAlongPath, handleInteraction, setPlayerState, setPlayerPosition, isBuildMode]);
  
  useGameLoop(gameLoop, true);
  
  // Get selected asset for preview
  const selectedAsset = selectedAssetId ? getFurnitureById(selectedAssetId) : null;
  
  return (
    <div 
      ref={canvasRef}
      className={`absolute inset-0 overflow-hidden ${isBuildMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
      style={{ backgroundColor: COLORS.background }}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
    >
      {/* Game World Container */}
      <div
        className="absolute"
        style={{
          width: workspaceScene.width * TILE_SIZE,
          height: workspaceScene.height * TILE_SIZE,
          willChange: 'transform',
        }}
      >
        {/* Floor Layer */}
        <div className="absolute inset-0">
          {Array.from({ length: workspaceScene.width * workspaceScene.height }).map((_, i) => {
            const x = i % workspaceScene.width;
            const y = Math.floor(i / workspaceScene.width);
            const isAlt = (x + y) % 2 === 0;
            return (
              <div
                key={`floor-${x}-${y}`}
                className="absolute"
                style={{
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: isBuildMode 
                    ? (isAlt ? '#1a2744' : '#152238')
                    : (isAlt ? COLORS.floor : COLORS.floorAlt),
                }}
              />
            );
          })}
        </div>
        
        {/* Grid Lines (only in build mode) */}
        {isBuildMode && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: workspaceScene.width + 1 }).map((_, i) => (
              <div
                key={`grid-v-${i}`}
                className="absolute"
                style={{
                  left: i * TILE_SIZE - 0.5,
                  top: 0,
                  width: 1,
                  height: workspaceScene.height * TILE_SIZE,
                  backgroundColor: 'rgba(100, 116, 139, 0.3)',
                }}
              />
            ))}
            {Array.from({ length: workspaceScene.height + 1 }).map((_, i) => (
              <div
                key={`grid-h-${i}`}
                className="absolute"
                style={{
                  left: 0,
                  top: i * TILE_SIZE - 0.5,
                  width: workspaceScene.width * TILE_SIZE,
                  height: 1,
                  backgroundColor: 'rgba(100, 116, 139, 0.3)',
                }}
              />
            ))}
          </div>
        )}
        
        {/* Objects Layer */}
        {workspaceScene.objects.map((obj) => (
          <GameObject key={obj.id} object={obj} metrics={metrics} />
        ))}
        
        {/* Placed Furniture Layer */}
        {placedFurniture.map((furniture) => (
          <PlacedFurnitureSprite
            key={furniture.id}
            furniture={furniture}
            isSelected={selectedPlacedId === furniture.id}
            isBuildMode={isBuildMode}
          />
        ))}
        
        {/* Placement Preview (only in build mode with selected asset) */}
        {isBuildMode && selectedAsset && previewCell && (
          <FurniturePreview
            asset={selectedAsset}
            gridX={previewCell.x}
            gridY={previewCell.y}
            rotation={rotation}
            isValid={() => {
              const dims = getRotatedDimensions(selectedAsset.width, selectedAsset.height, rotation);
              if (previewCell.x < 0 || previewCell.y < 0 ||
                  previewCell.x + dims.width > MAP_WIDTH ||
                  previewCell.y + dims.height > MAP_HEIGHT) {
                return false;
              }
              for (let dx = 0; dx < dims.width; dx++) {
                for (let dy = 0; dy < dims.height; dy++) {
                  if (isCellOccupied(previewCell.x + dx, previewCell.y + dy)) {
                    return false;
                  }
                }
              }
              return true;
            }}
          />
        )}
        
        {/* NPCs Layer */}
        {npcs.map((npc) => (
          <NPCSprite key={npc.id} npc={npc} />
        ))}
        
        {/* Player */}
        <PlayerSprite
          posRef={playerPosRef}
          directionRef={playerDirectionRef}
          isMovingRef={isMovingRef}
          isRunningRef={isRunningRef}
        />
      </div>
    </div>
  );
}

// Furniture Preview Component
function FurniturePreview({ 
  asset, 
  gridX, 
  gridY, 
  rotation, 
  isValid 
}: { 
  asset: ReturnType<typeof getFurnitureById>;
  gridX: number;
  gridY: number;
  rotation: 0 | 90 | 180 | 270;
  isValid: () => boolean;
}) {
  if (!asset) return null;
  
  const dims = getRotatedDimensions(asset.width, asset.height, rotation);
  const valid = isValid();
  const aspectInfo = ASPECT_NAMES[asset.category];
  
  return (
    <div
      className="absolute pointer-events-none animate-pulse"
      style={{
        left: gridX * TILE_SIZE,
        top: gridY * TILE_SIZE,
        width: dims.width * TILE_SIZE,
        height: dims.height * TILE_SIZE,
        backgroundColor: valid ? `${aspectInfo?.color || '#00ffff'}40` : 'rgba(239, 68, 68, 0.3)',
        border: `2px dashed ${valid ? (aspectInfo?.color || '#00ffff') : '#ef4444'}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.min(dims.width, dims.height) * TILE_SIZE * 0.4}px`,
        zIndex: 50,
      }}
    >
      {asset.icon}
    </div>
  );
}

// Placed Furniture Sprite Component
function PlacedFurnitureSprite({ 
  furniture, 
  isSelected,
  isBuildMode,
}: { 
  furniture: PlacedFurniture;
  isSelected: boolean;
  isBuildMode: boolean;
}) {
  const dims = getRotatedDimensions(furniture.width, furniture.height, furniture.rotation);
  const aspectInfo = ASPECT_NAMES[furniture.aspectCategory];
  
  // Get visual state color
  const getStateColor = () => {
    switch (furniture.visualState) {
      case 'warning': return '#eab308';
      case 'critical': return '#ef4444';
      case 'positive': return '#22c55e';
      default: return aspectInfo?.color || '#64748b';
    }
  };
  
  return (
    <div
      className={`absolute transition-all ${isBuildMode ? 'cursor-pointer hover:brightness-125' : ''}`}
      style={{
        left: furniture.gridX * TILE_SIZE,
        top: furniture.gridY * TILE_SIZE,
        width: dims.width * TILE_SIZE,
        height: dims.height * TILE_SIZE,
        backgroundColor: `${getStateColor()}30`,
        border: `2px solid ${isSelected ? '#00ffff' : getStateColor()}`,
        borderRadius: '4px',
        boxShadow: isSelected 
          ? `0 0 15px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2)`
          : `0 0 8px ${getStateColor()}50`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.min(dims.width, dims.height) * TILE_SIZE * 0.4}px`,
        zIndex: isSelected ? 60 : 40,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Furniture icon */}
      <span style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}>
        {getFurnitureById(furniture.assetId)?.icon || '📦'}
      </span>
      
      {/* Label */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap"
        style={{
          top: dims.height * TILE_SIZE + 2,
          color: isSelected ? '#00ffff' : COLORS.textMuted,
          textShadow: `0 0 5px ${COLORS.background}`,
        }}
      >
        {furniture.name}
      </div>
      
      {/* Rotation indicator (in build mode) */}
      {isBuildMode && furniture.rotation !== 0 && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #64748b',
            color: '#94a3b8',
          }}
        >
          {furniture.rotation}
        </div>
      )}
    </div>
  );
}

// Player Sprite Component
function PlayerSprite({ 
  posRef, 
  directionRef, 
  isMovingRef,
  isRunningRef,
}: { 
  posRef: React.RefObject<Position | null>;
  directionRef: React.RefObject<Direction>;
  isMovingRef: React.RefObject<boolean>;
  isRunningRef: React.RefObject<boolean>;
}) {
  const [renderState, setRenderState] = useState({
    x: 0,
    y: 0,
    direction: 'down' as Direction,
    isMoving: false,
    isRunning: false,
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      const pos = posRef.current;
      const dir = directionRef.current;
      const moving = isMovingRef.current;
      const running = isRunningRef.current;
      
      if (pos) {
        setRenderState({
          x: pos.x,
          y: pos.y,
          direction: dir || 'down',
          isMoving: moving || false,
          isRunning: running || false,
        });
      }
    }, 16);
    return () => clearInterval(interval);
  }, [posRef, directionRef, isMovingRef, isRunningRef]);
  
  const spriteSrc = getPlayerSprite(renderState.direction, renderState.isMoving);
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: renderState.x,
        top: renderState.y,
        width: TILE_SIZE,
        height: TILE_SIZE,
        zIndex: 100,
      }}
    >
      <Image
        src={spriteSrc}
        alt="Player"
        width={TILE_SIZE}
        height={TILE_SIZE}
        className={`drop-shadow-[0_0_${renderState.isRunning ? 15 : 10}px_rgba(0,255,255,0.5)] ${renderState.isRunning ? 'animate-pulse' : ''}`}
        priority
      />
      {renderState.isRunning && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-mono" style={{ color: COLORS.accent }}>
          ⚡
        </div>
      )}
    </div>
  );
}

// Game Object Component - Using proper types
const GameObject = memo(function GameObject({ 
  object, 
  metrics 
}: { 
  object: WorldObject; 
  metrics: BusinessMetric[] 
}) {
  let visualState: VisualState = object.visualState || 'healthy';
  
  if (object.linkedMetric) {
    const metric = metrics.find(m => m.metricName === object.linkedMetric);
    if (metric) {
      visualState = metric.status;
    }
  }
  
  const isInteractive = !!object.interactionType;
  
  const getColor = () => {
    switch (object.type) {
      case 'wall': return COLORS.wall;
      case 'floor': return 'transparent';
      case 'furniture': return '#475569';
      case 'interactive':
        switch (visualState) {
          case 'warning': return COLORS.warning;
          case 'critical': return COLORS.critical;
          default: return COLORS.healthy;
        }
      default: return COLORS.wall;
    }
  };
  
  const getGlowColor = () => {
    if (object.type === 'interactive') {
      switch (visualState) {
        case 'warning': return 'rgba(234, 179, 8, 0.5)';
        case 'critical': return 'rgba(239, 68, 68, 0.7)';
        default: return 'rgba(34, 197, 94, 0.3)';
      }
    }
    return undefined;
  };
  
  if (object.id === 'server-rack') {
    return <ServerRack object={object} visualState={visualState} />;
  }
  
  if (object.id.startsWith('plant')) {
    return <Plant object={object} visualState={visualState} />;
  }
  
  if (object.id === 'player-desk') {
    return <Desk object={object} />;
  }
  
  return (
    <div
      className={`absolute ${isInteractive ? 'hover:brightness-125 cursor-pointer transition-all' : ''}`}
      style={{
        left: object.gridX * TILE_SIZE,
        top: object.gridY * TILE_SIZE,
        width: object.width * TILE_SIZE,
        height: object.height * TILE_SIZE,
        backgroundColor: getColor(),
        boxShadow: getGlowColor() ? `0 0 15px ${getGlowColor()}` : undefined,
        border: isInteractive ? `2px solid ${getGlowColor() || 'transparent'}` : undefined,
      }}
    >
      {object.label && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap"
          style={{
            top: object.height * TILE_SIZE + 2,
            color: COLORS.textMuted,
            textShadow: `0 0 5px ${COLORS.background}`,
          }}
        >
          {object.label}
        </div>
      )}
    </div>
  );
});

// Server Rack Component - Using proper types
const ServerRack = memo(function ServerRack({ 
  object, 
  visualState 
}: { 
  object: WorldObject; 
  visualState: VisualState 
}) {
  const spriteSrc = getServerRackSprite(visualState as 'healthy' | 'warning' | 'critical');
  
  const getGlowColor = () => {
    switch (visualState) {
      case 'warning': return 'rgba(234, 179, 8, 0.5)';
      case 'critical': return 'rgba(239, 68, 68, 0.7)';
      default: return 'rgba(34, 197, 94, 0.3)';
    }
  };
  
  return (
    <div
      className="absolute hover:brightness-125 cursor-pointer transition-all"
      style={{
        left: object.gridX * TILE_SIZE,
        top: object.gridY * TILE_SIZE,
        width: object.width * TILE_SIZE,
        height: object.height * TILE_SIZE,
      }}
    >
      <Image
        src={spriteSrc}
        alt="Server Rack"
        width={object.width * TILE_SIZE}
        height={object.height * TILE_SIZE}
        className="drop-shadow-lg"
        style={{ filter: `drop-shadow(0 0 10px ${getGlowColor()})` }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap"
        style={{
          top: object.height * TILE_SIZE + 2,
          color: COLORS.textMuted,
          textShadow: `0 0 5px ${COLORS.background}`,
        }}
      >
        {object.label}
      </div>
    </div>
  );
});

// Plant Component - Using proper types
const Plant = memo(function Plant({ 
  object, 
  visualState 
}: { 
  object: WorldObject; 
  visualState: VisualState 
}) {
  const metrics = useGameStore(state => state.metrics);
  const tasksCompleted = metrics.find(m => m.metricName === 'tasks_completed')?.value || 0;
  const spriteSrc = getPlantSprite(tasksCompleted);
  
  return (
    <div
      className="absolute hover:brightness-125 cursor-pointer transition-all"
      style={{
        left: object.gridX * TILE_SIZE,
        top: object.gridY * TILE_SIZE,
        width: object.width * TILE_SIZE,
        height: object.height * TILE_SIZE,
      }}
    >
      <Image
        src={spriteSrc}
        alt="Office Plant"
        width={object.width * TILE_SIZE}
        height={object.height * TILE_SIZE}
        className={tasksCompleted > 20 ? 'animate-pulse' : ''}
      />
    </div>
  );
});

// Desk Component - Using proper types
const Desk = memo(function Desk({ object }: { object: WorldObject }) {
  return (
    <div
      className="absolute hover:brightness-125 cursor-pointer transition-all"
      style={{
        left: object.gridX * TILE_SIZE,
        top: object.gridY * TILE_SIZE,
        width: object.width * TILE_SIZE,
        height: object.height * TILE_SIZE,
      }}
    >
      <Image
        src={furnitureAssets.desk}
        alt="Work Desk"
        width={object.width * TILE_SIZE}
        height={object.height * TILE_SIZE}
        className="drop-shadow-md"
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap"
        style={{
          top: object.height * TILE_SIZE + 2,
          color: COLORS.textMuted,
        }}
      >
        {object.label}
      </div>
    </div>
  );
});

// NPC Sprite Component - Using proper types
const NPCSprite = memo(function NPCSprite({ npc }: { npc: NPC }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: npc.gridX * TILE_SIZE,
        top: npc.gridY * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        zIndex: 99,
      }}
    >
      <Image
        src={characterAssets.npc.aria}
        alt={npc.name}
        width={TILE_SIZE}
        height={TILE_SIZE}
        className="drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]"
      />
      
      {npc.message && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-lg whitespace-nowrap text-sm"
          style={{
            backgroundColor: COLORS.glass,
            border: `1px solid ${COLORS.npc}`,
            color: COLORS.text,
          }}
        >
          {npc.message}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${COLORS.npc}`,
            }}
          />
        </div>
      )}
      
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-mono"
        style={{ color: COLORS.npc }}
      >
        {npc.name}
      </div>
    </div>
  );
});

export default GameCanvas;
