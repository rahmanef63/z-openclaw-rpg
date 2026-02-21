'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, useBuildStore, useQuestStore } from '@/stores';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { MAP_WIDTH, MAP_HEIGHT } from '@/features/engine/constants';
import { 
  Hammer, 
  RotateCw, 
  X, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Scroll,
} from 'lucide-react';

// ===========================================
// TOUCH CONTROLS
// ===========================================

interface TouchControlsProps {
  isVisible?: boolean;
}

function TouchControlsContent({ isVisible = true }: TouchControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { setPlayerPosition, playerGridPos } = useGameStore();
  const { 
    isBuildMode, 
    toggleBuildMode, 
    rotateClockwise, 
    selectedAssetId, 
    selectAsset,
    selectedPlacedId,
    removeFurniture,
    isCellOccupied,
  } = useBuildStore();
  const { toggleQuestPanel, activeQuests } = useQuestStore();
  
  // Simple collision map for touch controls
  // In a real implementation, this should come from the game engine
  const getCollisionMap = useCallback(() => {
    const collisionSet = new Set<string>();
    
    // Add walls (perimeter)
    for (let i = 0; i < MAP_WIDTH; i++) {
      collisionSet.add(`${i},0`);
      collisionSet.add(`${i},${MAP_HEIGHT - 1}`);
    }
    for (let i = 1; i < MAP_HEIGHT - 1; i++) {
      collisionSet.add(`0,${i}`);
      collisionSet.add(`${MAP_WIDTH - 1},${i}`);
    }
    
    // Add placed furniture collision (only in play mode)
    if (!isBuildMode) {
      // Check build store for placed furniture
      const { placedFurniture } = useBuildStore.getState();
      placedFurniture.forEach(f => {
        for (let dx = 0; dx < f.width; dx++) {
          for (let dy = 0; dy < f.height; dy++) {
            collisionSet.add(`${f.gridX + dx},${f.gridY + dy}`);
          }
        }
      });
    }
    
    return collisionSet;
  }, [isBuildMode]);
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!isVisible || !isMobile) return null;
  
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Don't move in build mode
    if (isBuildMode) return;
    
    const collisionMap = getCollisionMap();
    const newPos = { ...playerGridPos };
    
    // Calculate target position based on direction
    switch (direction) {
      case 'up':
        newPos.gridY = playerGridPos.gridY - 1;
        break;
      case 'down':
        newPos.gridY = playerGridPos.gridY + 1;
        break;
      case 'left':
        newPos.gridX = playerGridPos.gridX - 1;
        break;
      case 'right':
        newPos.gridX = playerGridPos.gridX + 1;
        break;
    }
    
    // Check bounds
    if (newPos.gridX < 0 || newPos.gridX >= MAP_WIDTH ||
        newPos.gridY < 0 || newPos.gridY >= MAP_HEIGHT) {
      return; // Out of bounds
    }
    
    // Check collision
    const collisionKey = `${newPos.gridX},${newPos.gridY}`;
    if (collisionMap.has(collisionKey)) {
      return; // Collision detected
    }
    
    // Check placed furniture collision
    if (isCellOccupied(newPos.gridX, newPos.gridY)) {
      return; // Furniture collision
    }
    
    // Valid move - update position
    setPlayerPosition(newPos);
  };
  
  return (
    <>
      {/* ========== D-PAD (Bottom Left) ========== */}
      <div
        className="fixed left-2 bottom-16 z-[150]"
        style={{ touchAction: 'none' }}
      >
        <div className="relative w-20 h-20">
          {/* Up */}
          <button
            onTouchStart={() => handleMove('up')}
            onClick={() => handleMove('up')}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg flex items-center justify-center active:scale-95"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid #475569',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            aria-label="Move up"
          >
            <ChevronUp size={16} style={{ color: '#f8fafc' }} />
          </button>
          
          {/* Down */}
          <button
            onTouchStart={() => handleMove('down')}
            onClick={() => handleMove('down')}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg flex items-center justify-center active:scale-95"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid #475569',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            aria-label="Move down"
          >
            <ChevronDown size={16} style={{ color: '#f8fafc' }} />
          </button>
          
          {/* Left */}
          <button
            onTouchStart={() => handleMove('left')}
            onClick={() => handleMove('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center active:scale-95"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid #475569',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            aria-label="Move left"
          >
            <ChevronLeft size={16} style={{ color: '#f8fafc' }} />
          </button>
          
          {/* Right */}
          <button
            onTouchStart={() => handleMove('right')}
            onClick={() => handleMove('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center active:scale-95"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid #475569',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            aria-label="Move right"
          >
            <ChevronRight size={16} style={{ color: '#f8fafc' }} />
          </button>
          
          {/* Center */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
            style={{ backgroundColor: '#1e293b', border: '1px solid #64748b' }}
          />
        </div>
      </div>
      
      {/* ========== ACTION BUTTONS (Bottom Right) ========== */}
      <div
        className="fixed right-2 bottom-16 z-[150] flex flex-col gap-1.5"
        style={{ touchAction: 'none' }}
      >
        {/* Build Mode Toggle */}
        <button
          onTouchStart={toggleBuildMode}
          onClick={toggleBuildMode}
          className="w-11 h-11 rounded-xl flex items-center justify-center active:scale-95"
          style={{
            backgroundColor: isBuildMode ? '#eab308' : 'rgba(30, 41, 59, 0.95)',
            border: `1px solid ${isBuildMode ? '#fbbf24' : '#475569'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
          aria-label={isBuildMode ? 'Exit build mode' : 'Enter build mode'}
        >
          <Hammer size={18} style={{ color: isBuildMode ? '#0f172a' : '#f8fafc' }} />
        </button>
        
        {/* Rotate (in build mode) */}
        {isBuildMode && (
          <button
            onTouchStart={rotateClockwise}
            onClick={rotateClockwise}
            className="w-11 h-11 rounded-xl flex items-center justify-center active:scale-95"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid #475569',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            aria-label="Rotate furniture"
          >
            <RotateCw size={18} style={{ color: '#f8fafc' }} />
          </button>
        )}
        
        {/* Delete (when furniture selected in build mode) */}
        {isBuildMode && selectedPlacedId && (
          <button
            onTouchStart={() => removeFurniture(selectedPlacedId)}
            onClick={() => removeFurniture(selectedPlacedId)}
            className="w-11 h-11 rounded-xl flex items-center justify-center active:scale-95"
            style={{ 
              backgroundColor: '#ef4444', 
              border: '1px solid #f87171',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            aria-label="Delete selected furniture"
          >
            <X size={18} style={{ color: '#ffffff' }} />
          </button>
        )}
        
        {/* Cancel selection (when asset selected) */}
        {isBuildMode && selectedAssetId && (
          <button
            onTouchStart={() => selectAsset(null)}
            onClick={() => selectAsset(null)}
            className="w-11 h-11 rounded-xl flex items-center justify-center active:scale-95"
            style={{ 
              backgroundColor: '#ef4444', 
              border: '1px solid #f87171',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            aria-label="Cancel selection"
          >
            <X size={18} style={{ color: '#ffffff' }} />
          </button>
        )}
      </div>
      
      {/* ========== QUEST BUTTON (Top Right) ========== */}
      <button
        onTouchStart={toggleQuestPanel}
        onClick={toggleQuestPanel}
        className="fixed right-2 top-12 z-[150] flex items-center justify-center active:scale-95"
        style={{ 
          backgroundColor: activeQuests.length > 0 ? '#eab308' : 'rgba(30, 41, 59, 0.95)', 
          border: `1px solid ${activeQuests.length > 0 ? '#fbbf24' : '#475569'}`,
          borderRadius: 8,
          width: 36,
          height: 36,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
        aria-label={`Quests (${activeQuests.length} active)`}
      >
        <Scroll size={16} style={{ color: activeQuests.length > 0 ? '#0f172a' : '#f8fafc' }} />
        {activeQuests.length > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
            style={{ backgroundColor: '#0f172a', color: '#eab308' }}
          >
            {activeQuests.length}
          </span>
        )}
      </button>
      
      {/* ========== BUILD MODE STATUS BANNER ========== */}
      {isBuildMode && (
        <div
          className="fixed top-12 left-1/2 -translate-x-1/2 z-[140] px-3 py-1 rounded-full font-mono text-[10px]"
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.95)',
            color: '#0f172a',
            boxShadow: '0 2px 8px rgba(234, 179, 8, 0.3)',
          }}
          role="status"
        >
          🔨 Build Mode
        </div>
      )}
    </>
  );
}

export default function TouchControls(props: TouchControlsProps) {
  return (
    <ErrorBoundary componentName="TouchControls">
      <TouchControlsContent {...props} />
    </ErrorBoundary>
  );
}

// ===========================================
// SWIPE HANDLER HOOK
// ===========================================

export function useSwipeHandler(
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void,
  threshold: number = 50
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        onSwipe(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        onSwipe(deltaY > 0 ? 'down' : 'up');
      }
    }
    
    touchStart.current = null;
  }, [onSwipe, threshold]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

// ===========================================
// PINCH TO ZOOM HANDLER
// ===========================================

export function usePinchZoom(
  onZoom: (scale: number) => void
) {
  const initialDistance = useRef<number | null>(null);
  
  const getDistance = (touches: React.TouchList): number => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialDistance.current;
      onZoom(scale);
    }
  }, [onZoom]);
  
  const handleTouchEnd = useCallback(() => {
    initialDistance.current = null;
  }, []);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
