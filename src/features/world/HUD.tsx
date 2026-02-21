'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useBuildStore } from '@/stores';
import { MAP_WIDTH, MAP_HEIGHT } from '@/features/engine/constants';
import { CheckCircle, DollarSign, Bot, Minimize2, Maximize2, Footprints, Zap } from 'lucide-react';

export default function HUD() {
  const { 
    playerGridPos, 
    playerState,
    isRunning,
    metrics, 
    notifications, 
    npcs,
  } = useGameStore();
  
  const { isBuildMode } = useBuildStore();
  
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768 || 'ontouchstart' in window;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const tasksCompleted = metrics.find(m => m.metricName === 'tasks_completed')?.value || 0;
  const salesToday = metrics.find(m => m.metricName === 'sales_today')?.value || 0;

  // Build mode - show only minimap
  if (isBuildMode) {
    return (
      <div className="absolute inset-0 pointer-events-none z-40">
        <div
          className={`absolute pointer-events-auto ${isMobile ? 'bottom-16 right-2' : 'bottom-4 right-4'} pixel-minimap`}
        >
          <MiniMap playerGridPos={playerGridPos} npcs={npcs} isRunning={isRunning} isMobile={isMobile} />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Desktop: Bottom Left - Controls Panel */}
      {!isMobile && !isTablet && showControls && (
        <div className="absolute bottom-4 left-48 pointer-events-auto pixel-panel p-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-2 pb-2 border-b-2" style={{ borderColor: 'var(--pixel-border-dark)' }}>
              <div className="pixel-text text-[var(--pixel-gold)]">Controls</div>
              <button
                onClick={() => setShowControls(false)}
                className="pixel-btn p-1"
              >
                <Minimize2 size={10} style={{ color: 'var(--pixel-border-light)' }} />
              </button>
            </div>
            <div className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="inline-block w-14">Move:</span>
              <span className="text-[var(--foreground)]">WASD / Arrows</span>
            </div>
            <div className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="inline-block w-14">Run:</span>
              <span className="text-[var(--foreground)]">SHIFT ⚡</span>
            </div>
            <div className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="inline-block w-14">Interact:</span>
              <span className="text-[var(--foreground)]">E / Click</span>
            </div>
            <div className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="inline-block w-14">Build:</span>
              <span className="text-[var(--foreground)]">B</span>
            </div>
            
            {/* Player State */}
            <div className="mt-3 flex items-center gap-2 pt-2 border-t-2" style={{ borderColor: 'var(--pixel-border-dark)' }}>
              <span className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>State:</span>
              <div
                className="flex items-center gap-1.5 px-2 py-1 pixel-border-inset pixel-text-xs"
                style={{
                  backgroundColor: playerState === 'running' ? 'var(--pixel-gold)' : 
                                  playerState === 'walking' ? 'var(--pixel-grass)' : 'var(--muted)',
                  color: 'var(--pixel-border-dark)',
                }}
              >
                {playerState === 'running' ? <Zap size={10} /> : 
                 playerState === 'walking' ? <Footprints size={10} /> : null}
                {playerState || 'idle'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Minimized Controls Button */}
      {!isMobile && !isTablet && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute bottom-4 left-48 p-2 pointer-events-auto pixel-btn"
        >
          <Maximize2 size={14} style={{ color: 'var(--pixel-gold)' }} />
        </button>
      )}
      
      {/* Desktop: Top Right - Productivity Stats */}
      {!isMobile && !isTablet && (
        <div className="absolute top-14 right-44 w-44 pointer-events-auto pixel-panel p-3">
          <div className="space-y-2">
            <div className="pixel-panel-header -m-3 mb-3">
              <span className="pixel-text-xs">Productivity</span>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} style={{ color: 'var(--pixel-grass)' }} />
                <span className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>Tasks</span>
              </div>
              <span className="pixel-text text-[var(--pixel-gold)]">
                {tasksCompleted}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={14} style={{ color: 'var(--pixel-gold)' }} />
                <span className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>Sales</span>
              </div>
              <span className="pixel-text text-[var(--pixel-gold)]">
                ${salesToday}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={14} style={{ color: 'var(--pixel-magic)' }} />
                <span className="pixel-text-xs" style={{ color: 'var(--muted-foreground)' }}>Agents</span>
              </div>
              <span className="pixel-text text-[var(--pixel-gold)]">
                {npcs.length}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Minimap - Bottom Right */}
      <div
        className={`absolute pointer-events-auto ${isMobile ? 'bottom-16 right-2' : 'bottom-4 right-4'} pixel-minimap`}
      >
        <MiniMap playerGridPos={playerGridPos} npcs={npcs} isRunning={isRunning} isMobile={isMobile} />
      </div>
      
      {/* Notifications - Desktop Only */}
      {!isMobile && !isTablet && (
        <div className="absolute top-14 left-48 space-y-2 pointer-events-auto">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className="px-4 py-2 flex items-center gap-2 pixel-panel animate-pulse"
            >
              <div
                className="w-3 h-3"
                style={{
                  backgroundColor: 
                    notif.type === 'critical' ? 'var(--pixel-blood)' :
                    notif.type === 'warning' ? 'var(--pixel-gold)' : 'var(--pixel-grass)',
                  boxShadow: `0 0 4px ${
                    notif.type === 'critical' ? 'var(--pixel-blood)' :
                    notif.type === 'warning' ? 'var(--pixel-gold)' : 'var(--pixel-grass)'
                  }`,
                }}
              />
              <span className="pixel-text-xs text-[var(--foreground)]">
                {notif.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// MiniMap Component
function MiniMap({ playerGridPos, npcs, isRunning, isMobile }: { 
  playerGridPos: { gridX: number; gridY: number }; 
  npcs: any[];
  isRunning: boolean;
  isMobile: boolean;
}) {
  const mapScale = isMobile ? 2 : 3;
  
  return (
    <div className="p-1">
      <div className="pixel-text-xs text-center mb-1 text-[var(--pixel-gold)] pixel-text-shadow">MAP</div>
      <div
        className="relative pixel-border-inset"
        style={{
          width: MAP_WIDTH * mapScale,
          height: MAP_HEIGHT * mapScale,
          backgroundColor: 'var(--background)',
        }}
      >
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--pixel-border-light) 1px, transparent 1px),
              linear-gradient(90deg, var(--pixel-border-light) 1px, transparent 1px)
            `,
            backgroundSize: `${mapScale * 2}px ${mapScale * 2}px`,
          }}
        />
        
        {/* Player position - pixel art style */}
        <div
          className="absolute"
          style={{
            left: playerGridPos.gridX * mapScale - 2,
            top: playerGridPos.gridY * mapScale - 2,
            width: 4,
            height: 4,
            backgroundColor: isRunning ? 'var(--pixel-gold)' : 'var(--pixel-grass)',
            boxShadow: isRunning 
              ? '0 0 4px var(--pixel-gold), inset -1px -1px 0 var(--pixel-gold-dark)'
              : '0 0 4px var(--pixel-grass), inset -1px -1px 0 rgba(0,0,0,0.3)',
            zIndex: 10,
          }}
        />
        
        {/* NPCs - pixel dots */}
        {npcs.map(npc => (
          <div
            key={npc.id}
            className="absolute"
            style={{
              left: npc.gridX * mapScale,
              top: npc.gridY * mapScale,
              width: 3,
              height: 3,
              backgroundColor: 'var(--pixel-magic)',
              boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.3)',
            }}
          />
        ))}
        
        {/* Key objects - pixel style */}
        <div
          className="absolute"
          style={{
            left: 2 * mapScale,
            top: 2 * mapScale,
            width: 3,
            height: 4,
            backgroundColor: 'var(--pixel-grass)',
            boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.3)',
          }}
        />
        <div
          className="absolute"
          style={{
            left: 9 * mapScale,
            top: 12 * mapScale,
            width: 4,
            height: 3,
            backgroundColor: 'var(--pixel-gold)',
            boxShadow: 'inset -1px -1px 0 var(--pixel-gold-dark)',
          }}
        />
      </div>
      
      {!isMobile && (
        <div className="pixel-text-xs text-center mt-1 text-[var(--muted-foreground)]">
          ({playerGridPos.gridX}, {playerGridPos.gridY})
        </div>
      )}
    </div>
  );
}
