'use client'

import React from 'react'
import { useGameStore } from '@/stores/gameStore'
import { CELL_SIZE } from '@/features/engine/grid'
import { workspaceMap } from '@/data/maps/workspace'

export function HUD() {
  const { 
    metrics, 
    playerGridX, 
    playerGridY, 
    playerDirection,
    interactionHint,
    openWindow,
    npcs,
  } = useGameStore()
  
  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-4 z-[300]">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <span className="text-sm font-mono text-cyan-400">SUPER SPACE RPG</span>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#22c55e]" />
            <span className="text-xs text-slate-400">Connected</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active Modules */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Engine v1.0</span>
            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">AI: Active</span>
          </div>
        </div>
      </div>
      
      {/* Top Right - Stats */}
      <div className="absolute top-14 right-4 z-[300]">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-3 space-y-2 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Tasks</span>
            <span className="text-sm font-mono text-cyan-400">{metrics.tasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Sales</span>
            <span className="text-sm font-mono text-green-400">${metrics.sales.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Productivity</span>
            <span className="text-sm font-mono text-fuchsia-400">{metrics.productivity}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Server</span>
            <span className={`text-sm font-mono ${
              metrics.serverHealth === 'healthy' ? 'text-green-400' :
              metrics.serverHealth === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {metrics.serverHealth.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Bottom Left - Quick Actions */}
      <div className="absolute bottom-4 left-4 z-[300]">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => openWindow('desk')}
            className="w-12 h-12 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 flex items-center justify-center text-xl hover:border-cyan-500 hover:bg-slate-800 transition-colors"
            title="Desk"
          >
            💼
          </button>
          <button
            onClick={() => openWindow('server')}
            className="w-12 h-12 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 flex items-center justify-center text-xl hover:border-cyan-500 hover:bg-slate-800 transition-colors"
            title="Server"
          >
            🖥️
          </button>
          <button
            onClick={() => openWindow('analytics')}
            className="w-12 h-12 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 flex items-center justify-center text-xl hover:border-cyan-500 hover:bg-slate-800 transition-colors"
            title="Analytics"
          >
            📊
          </button>
          <button
            onClick={() => openWindow('chat')}
            className="w-12 h-12 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 flex items-center justify-center text-xl hover:border-cyan-500 hover:bg-slate-800 transition-colors"
            title="Chat"
          >
            💬
          </button>
        </div>
      </div>
      
      {/* Bottom Right - Minimap */}
      <div className="absolute bottom-4 right-4 z-[300]">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-2">
          <div 
            className="relative bg-slate-800 rounded"
            style={{
              width: workspaceMap.width * 6,
              height: workspaceMap.height * 6,
            }}
          >
            {/* Map objects */}
            {workspaceMap.objects.map(obj => {
              const width = (obj.width || 1) * 6
              const height = (obj.height || 1) * 6
              
              return (
                <div
                  key={obj.id}
                  className={`absolute ${
                    obj.type === 'wall' ? 'bg-slate-600' :
                    obj.type === 'desk' ? 'bg-cyan-500/50' :
                    obj.type === 'server_rack' ? 'bg-green-500/50' :
                    obj.type === 'terminal' ? 'bg-fuchsia-500/50' :
                    obj.type === 'plant' ? 'bg-green-600/50' :
                    obj.type === 'door' ? 'bg-slate-500/50' :
                    'bg-slate-500/30'
                  }`}
                  style={{
                    left: obj.x * 6,
                    top: obj.y * 6,
                    width,
                    height,
                  }}
                />
              )
            })}
            
            {/* NPCs on minimap */}
            {npcs.map(npc => (
              <div
                key={npc.id}
                className="absolute w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_4px_#ff00ff]"
                style={{
                  left: npc.gridX * 6,
                  top: npc.gridY * 6,
                }}
              />
            ))}
            
            {/* Player position */}
            <div
              className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_4px_#00ffff]"
              style={{
                left: playerGridX * 6,
                top: playerGridY * 6,
              }}
            />
            
            {/* Player direction indicator */}
            <div
              className="absolute w-1 h-1 bg-cyan-400"
              style={{
                left: playerGridX * 6 + (playerDirection === 'right' ? 3 : playerDirection === 'left' ? -1 : 1),
                top: playerGridY * 6 + (playerDirection === 'down' ? 3 : playerDirection === 'up' ? -1 : 1),
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Interaction Hint (bottom center) */}
      {interactionHint && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[300]">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg border border-cyan-500/50 px-4 py-2 text-xs text-cyan-400 font-mono shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <span className="text-slate-400 mr-2">[E]</span>
            {interactionHint}
          </div>
        </div>
      )}
      
      {/* Controls Help (bottom center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[300]">
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
          <span>WASD/Arrows - Move</span>
          <span>E/Space - Interact</span>
        </div>
      </div>
    </>
  )
}
