'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useBuildStore } from '@/stores';
import { COLORS, MAP_WIDTH, MAP_HEIGHT } from '@/features/engine/constants';
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
  const serverHealth = metrics.find(m => m.metricName === 'server_health')?.status || 'healthy';

  // Build mode - show only minimap
  if (isBuildMode) {
    return (
      <div className="absolute inset-0 pointer-events-none z-40">
        <div
          className={`absolute pointer-events-auto ${isMobile ? 'bottom-16 right-2' : 'bottom-4 right-4'}`}
          style={{
            backgroundColor: COLORS.glass,
            border: `1px solid #eab308`,
            borderRadius: 8,
            backdropFilter: 'blur(10px)',
          }}
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
        <div
          className="absolute bottom-4 left-48 pointer-events-auto"
          style={{
            backgroundColor: COLORS.glass,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="p-2 space-y-1">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-mono" style={{ color: COLORS.accent }}>Controls</div>
              <button
                onClick={() => setShowControls(false)}
                className="p-0.5 rounded hover:bg-slate-700"
              >
                <Minimize2 size={10} style={{ color: '#64748b' }} />
              </button>
            </div>
            <div className="text-[10px]" style={{ color: COLORS.textMuted }}>
              <span className="inline-block w-14">Move:</span>
              <span style={{ color: COLORS.text }}>WASD / Arrows</span>
            </div>
            <div className="text-[10px]" style={{ color: COLORS.textMuted }}>
              <span className="inline-block w-14">Run:</span>
              <span style={{ color: COLORS.text }}>SHIFT ⚡</span>
            </div>
            <div className="text-[10px]" style={{ color: COLORS.textMuted }}>
              <span className="inline-block w-14">Interact:</span>
              <span style={{ color: COLORS.text }}>E / Click</span>
            </div>
            <div className="text-[10px]" style={{ color: COLORS.textMuted }}>
              <span className="inline-block w-14">Build:</span>
              <span style={{ color: COLORS.text }}>B</span>
            </div>
            
            {/* Player State */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px]" style={{ color: COLORS.textMuted }}>State:</span>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono"
                style={{
                  backgroundColor: playerState === 'running' ? COLORS.accent + '20' : 
                                  playerState === 'walking' ? COLORS.healthy + '20' : COLORS.border,
                  color: playerState === 'running' ? COLORS.accent : 
                         playerState === 'walking' ? COLORS.healthy : COLORS.textMuted,
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
          className="absolute bottom-4 left-48 p-2 rounded-lg pointer-events-auto"
          style={{
            backgroundColor: COLORS.glass,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Maximize2 size={14} style={{ color: COLORS.accent }} />
        </button>
      )}
      
      {/* Desktop: Top Right - Productivity Stats */}
      {!isMobile && !isTablet && (
        <div
          className="absolute top-14 right-44 w-40 pointer-events-auto"
          style={{
            backgroundColor: COLORS.glass,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="p-2 space-y-1.5">
            <div className="text-[10px] font-mono" style={{ color: COLORS.accent }}>
              Productivity
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={12} style={{ color: COLORS.healthy }} />
                <span className="text-[10px]" style={{ color: COLORS.textMuted }}>Tasks</span>
              </div>
              <span className="text-xs font-mono" style={{ color: COLORS.text }}>
                {tasksCompleted}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign size={12} style={{ color: COLORS.accent }} />
                <span className="text-[10px]" style={{ color: COLORS.textMuted }}>Sales</span>
              </div>
              <span className="text-xs font-mono" style={{ color: COLORS.text }}>
                ${salesToday}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot size={12} style={{ color: COLORS.npc }} />
                <span className="text-[10px]" style={{ color: COLORS.textMuted }}>Agents</span>
              </div>
              <span className="text-xs font-mono" style={{ color: COLORS.text }}>
                {npcs.length}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Minimap - Bottom Right */}
      <div
        className={`absolute pointer-events-auto ${isMobile ? 'bottom-16 right-2' : 'bottom-4 right-4'}`}
        style={{
          backgroundColor: COLORS.glass,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          backdropFilter: 'blur(10px)',
        }}
      >
        <MiniMap playerGridPos={playerGridPos} npcs={npcs} isRunning={isRunning} isMobile={isMobile} />
      </div>
      
      {/* Notifications - Desktop Only */}
      {!isMobile && !isTablet && (
        <div className="absolute top-14 left-48 space-y-2 pointer-events-auto">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className="px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse"
              style={{
                backgroundColor: COLORS.glass,
                border: `1px solid ${
                  notif.type === 'critical' ? COLORS.critical :
                  notif.type === 'warning' ? COLORS.warning : COLORS.accent
                }`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: 
                    notif.type === 'critical' ? COLORS.critical :
                    notif.type === 'warning' ? COLORS.warning : COLORS.accent,
                }}
              />
              <span className="text-xs" style={{ color: COLORS.text }}>
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
      <div
        className="relative"
        style={{
          width: MAP_WIDTH * mapScale,
          height: MAP_HEIGHT * mapScale,
          backgroundColor: COLORS.background,
          borderRadius: 4,
        }}
      >
        {/* Player position */}
        <div
          className="absolute w-1.5 h-1.5 rounded-full animate-pulse"
          style={{
            left: playerGridPos.gridX * mapScale - 1,
            top: playerGridPos.gridY * mapScale - 1,
            backgroundColor: isRunning ? COLORS.accent : COLORS.player,
            boxShadow: `0 0 4px ${isRunning ? COLORS.accent : COLORS.player}`,
            zIndex: 10,
          }}
        />
        
        {/* NPCs */}
        {npcs.map(npc => (
          <div
            key={npc.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: npc.gridX * mapScale,
              top: npc.gridY * mapScale,
              backgroundColor: COLORS.npc,
            }}
          />
        ))}
        
        {/* Key objects */}
        <div
          className="absolute w-1 h-1.5 rounded-sm"
          style={{
            left: 2 * mapScale,
            top: 2 * mapScale,
            backgroundColor: COLORS.healthy,
          }}
        />
        <div
          className="absolute w-1.5 h-1 rounded-sm"
          style={{
            left: 9 * mapScale,
            top: 12 * mapScale,
            backgroundColor: COLORS.accent,
          }}
        />
      </div>
      
      {!isMobile && (
        <div className="text-[8px] text-center mt-1 font-mono" style={{ color: COLORS.textMuted }}>
          ({playerGridPos.gridX}, {playerGridPos.gridY})
        </div>
      )}
    </div>
  );
}
