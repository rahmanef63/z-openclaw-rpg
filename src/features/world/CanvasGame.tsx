'use client';

import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
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
import { getRotatedDimensions } from '@/lib/gameUtils';
import { CanvasRenderer, getRenderer, disposeRenderer, type PlayerRenderState, type FurnitureRenderData, type NPCRenderData } from '@/features/engine/CanvasRenderer';
import type { Direction, InputState, Position, GridPosition, WorldObject, NPC, BusinessMetric, VisualState } from '@/features/engine/types';

// ===========================================
// CANVAS GAME COMPONENT
// ===========================================

export default function CanvasGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  
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
  
  // Camera
  const cameraRef = useRef({ x: 0, y: 0 });
  
  // Preview state for build mode
  const [previewCell, setPreviewCell] = useState<{ x: number; y: number } | null>(null);
  
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
  
  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    rendererRef.current = getRenderer();
    rendererRef.current.initialize(canvas);
    
    // Handle resize
    const handleResize = () => {
      if (containerRef.current && rendererRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        rendererRef.current.resize(clientWidth, clientHeight);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      disposeRenderer();
    };
  }, []);
  
  // Update collision map when furniture changes
  useEffect(() => {
    const baseMap = generateCollisionMap(workspaceScene);
    
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
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBuildMode || windows.length > 0) return;
      
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
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [windows.length, setIsRunning, isBuildMode]);
  
  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (windows.length > 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + cameraRef.current.x;
    const clickY = e.clientY - rect.top + cameraRef.current.y;
    
    const targetGrid = pixelToGrid(clickX, clickY);
    
    // BUILD MODE
    if (isBuildMode) {
      const clickedFurniture = getFurnitureAt(targetGrid.gridX, targetGrid.gridY);
      
      if (clickedFurniture) {
        selectPlaced(clickedFurniture.id);
        return;
      }
      
      if (selectedAssetId) {
        const asset = getFurnitureById(selectedAssetId);
        if (asset) {
          const dims = getRotatedDimensions(asset.width, asset.height, rotation);
          
          if (targetGrid.gridX >= 0 && targetGrid.gridY >= 0 &&
              targetGrid.gridX + dims.width <= MAP_WIDTH &&
              targetGrid.gridY + dims.height <= MAP_HEIGHT) {
            
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
        selectPlaced(null);
      }
      return;
    }
    
    // PLAY MODE - Click-to-move
    const clickedObject = getObjectAtPosition(workspaceScene, targetGrid.gridX, targetGrid.gridY);
    
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
    
    if (!isInBounds(targetGrid.gridX, targetGrid.gridY)) return;
    
    if (collisionMapRef.current.has(createCollisionKey(targetGrid.gridX, targetGrid.gridY))) {
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
  
  // Handle right-click
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
    
    const collisionKey = createCollisionKey(targetGridX, targetGridY);
    if (collisionMapRef.current.has(collisionKey)) return;
    
    if (targetGridX < 0 || targetGridX >= workspaceScene.width ||
        targetGridY < 0 || targetGridY >= workspaceScene.height) {
      return;
    }
    
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
  
  // Handle interaction
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
  
  // Main render function
  const render = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    
    // Update config
    renderer.setConfig({
      showGrid: isBuildMode,
      isBuildMode,
    });
    
    // Clear and render floor
    renderer.clear();
    renderer.renderFloor();
    renderer.renderGrid();
    
    // Render world objects
    workspaceScene.objects.forEach(obj => {
      let visualState: VisualState = obj.visualState || 'healthy';
      
      if (obj.linkedMetric) {
        const metric = metrics.find(m => m.metricName === obj.linkedMetric);
        if (metric) {
          visualState = metric.status;
        }
      }
      
      renderer.renderObject(obj, visualState);
    });
    
    // Render placed furniture
    placedFurniture.forEach(furniture => {
      const asset = getFurnitureById(furniture.assetId);
      const aspectInfo = ASPECT_NAMES[furniture.aspectCategory];
      const dims = getRotatedDimensions(furniture.width, furniture.height, furniture.rotation);
      
      const furnitureData: FurnitureRenderData = {
        id: furniture.id,
        gridX: furniture.gridX,
        gridY: furniture.gridY,
        width: dims.width,
        height: dims.height,
        color: aspectInfo?.color || '#64748b',
        icon: asset?.icon || '📦',
        label: furniture.name,
        isSelected: selectedPlacedId === furniture.id,
        visualState: furniture.visualState,
      };
      
      renderer.renderFurniture(furnitureData);
    });
    
    // Render preview
    if (isBuildMode && selectedAssetId && previewCell) {
      const asset = getFurnitureById(selectedAssetId);
      if (asset) {
        const dims = getRotatedDimensions(asset.width, asset.height, rotation);
        const aspectInfo = ASPECT_NAMES[asset.category];
        
        let isValid = true;
        if (previewCell.x < 0 || previewCell.y < 0 ||
            previewCell.x + dims.width > MAP_WIDTH ||
            previewCell.y + dims.height > MAP_HEIGHT) {
          isValid = false;
        } else {
          for (let dx = 0; dx < dims.width; dx++) {
            for (let dy = 0; dy < dims.height; dy++) {
              if (isCellOccupied(previewCell.x + dx, previewCell.y + dy)) {
                isValid = false;
                break;
              }
            }
            if (!isValid) break;
          }
        }
        
        renderer.renderFurniturePreview(
          previewCell.x,
          previewCell.y,
          dims.width,
          dims.height,
          aspectInfo?.color || '#00ffff',
          asset.icon,
          isValid
        );
      }
    }
    
    // Render NPCs
    npcs.forEach(npc => {
      const npcData: NPCRenderData = {
        id: npc.id,
        name: npc.name,
        gridX: npc.gridX,
        gridY: npc.gridY,
        message: npc.message,
      };
      renderer.renderNPC(npcData);
    });
    
    // Render player
    const playerState: PlayerRenderState = {
      x: playerPosRef.current.x,
      y: playerPosRef.current.y,
      direction: playerDirectionRef.current,
      isMoving: isMovingRef.current,
      isRunning: isRunningRef.current,
    };
    renderer.renderPlayer(playerState);
  }, [isBuildMode, metrics, placedFurniture, selectedPlacedId, selectedAssetId, previewCell, rotation, npcs, isCellOccupied]);
  
  // Game loop
  const gameLoop = useCallback((deltaTime: number) => {
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
    
    // Update camera
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const mapPixelWidth = workspaceScene.width * TILE_SIZE;
    const mapPixelHeight = workspaceScene.height * TILE_SIZE;
    
    let targetCameraX = playerPosRef.current.x - viewportWidth / 2 + TILE_SIZE / 2;
    let targetCameraY = playerPosRef.current.y - viewportHeight / 2 + TILE_SIZE / 2;
    
    targetCameraX = Math.max(0, Math.min(targetCameraX, mapPixelWidth - viewportWidth));
    targetCameraY = Math.max(0, Math.min(targetCameraY, mapPixelHeight - viewportHeight));
    
    cameraRef.current.x = lerp(cameraRef.current.x, targetCameraX, 0.1);
    cameraRef.current.y = lerp(cameraRef.current.y, targetCameraY, 0.1);
    
    // Update renderer camera
    if (rendererRef.current) {
      rendererRef.current.setCamera(cameraRef.current.x, cameraRef.current.y);
    }
    
    // Render
    render();
  }, [tryMove, moveAlongPath, handleInteraction, setPlayerState, setPlayerPosition, isBuildMode, render]);
  
  useGameLoop(gameLoop, true);
  
  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${isBuildMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
      style={{ backgroundColor: COLORS.background }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
        className="w-full h-full"
      />
    </div>
  );
}
