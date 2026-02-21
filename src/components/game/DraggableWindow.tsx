'use client'

import React, { useRef, useState, useCallback } from 'react'
import { GameWindow } from '@/stores/gameStore'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DraggableWindowProps {
  window: GameWindow
  children: React.ReactNode
  onClose: () => void
  onFocus: () => void
  onMove: (x: number, y: number) => void
}

export function DraggableWindow({
  window: win,
  children,
  onClose,
  onFocus,
  onMove,
}: DraggableWindowProps) {
  const dragRef = useRef<{ startX: number; startY: number; windowStartX: number; windowStartY: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    
    onFocus()
    setIsDragging(true)
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      windowStartX: win.x,
      windowStartY: win.y,
    }
    
    // Add global mouse move and up listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      
      const deltaX = e.clientX - dragRef.current.startX
      const deltaY = e.clientY - dragRef.current.startY
      
      const newX = Math.max(0, dragRef.current.windowStartX + deltaX)
      const newY = Math.max(0, dragRef.current.windowStartY + deltaY)
      
      onMove(newX, newY)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      dragRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [win.x, win.y, onFocus, onMove])
  
  return (
    <div
      style={{
        position: 'fixed',
        left: win.x,
        top: win.y,
        width: win.width,
        zIndex: win.zIndex,
        userSelect: isDragging ? 'none' : 'auto',
      }}
      className={`
        bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700
        shadow-2xl shadow-black/50
        ${isDragging ? 'cursor-grabbing' : ''}
      `}
      onClick={onFocus}
    >
      {/* Title bar */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 
          bg-slate-800/80 rounded-t-lg border-b border-slate-700
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_6px_#00ffff]" />
          <span className="text-xs font-mono text-cyan-400">{win.title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-slate-400 hover:text-cyan-400"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-slate-400 hover:text-red-400"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      {!isMinimized && (
        <div className="overflow-hidden" style={{ height: isMinimized ? 0 : win.height - 40 }}>
          {children}
        </div>
      )}
    </div>
  )
}
