'use client'

import React, { useRef, useState, useCallback } from 'react'
import { useGameStore, GameWindow } from '@/stores/gameStore'
import { Button } from '@/components/ui/button'
import { X, Maximize2, Minimize2, GripHorizontal } from 'lucide-react'
import { DraggableWindow } from './DraggableWindow'

// Window content components
function DeskWindowContent({ data }: { data?: Record<string, unknown> }) {
  const { metrics } = useGameStore()
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <span className="text-2xl">💼</span>
        </div>
        <div>
          <h3 className="text-cyan-400 font-mono text-sm">Your Workspace</h3>
          <p className="text-slate-400 text-xs">Personal productivity hub</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-2xl font-bold text-cyan-400">{metrics.tasks}</div>
          <div className="text-xs text-slate-400">Tasks Done</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">{metrics.productivity}%</div>
          <div className="text-xs text-slate-400">Productivity</div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
        onClick={() => useGameStore.getState().updateMetrics({ tasks: metrics.tasks + 1 })}
      >
        Complete Task (+1)
      </Button>
    </div>
  )
}

function ServerWindowContent({ data }: { data?: Record<string, unknown> }) {
  const { metrics, updateMetrics } = useGameStore()
  
  const statusColors = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  }
  
  const statusBgColors = {
    healthy: 'bg-green-500/20',
    warning: 'bg-yellow-500/20',
    critical: 'bg-red-500/20',
  }
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-cyan-400 font-mono text-sm">Server Status</h3>
        <span className={`text-xs px-2 py-1 rounded ${statusBgColors[metrics.serverHealth]} ${statusColors[metrics.serverHealth]}`}>
          {metrics.serverHealth.toUpperCase()}
        </span>
      </div>
      
      {/* Server visualization */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i}
            className={`h-16 rounded border flex items-center justify-center font-mono text-xs ${
              metrics.serverHealth === 'healthy' 
                ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                : metrics.serverHealth === 'warning'
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                : 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse'
            }`}
          >
            NODE-{i}
          </div>
        ))}
      </div>
      
      {/* Metrics */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">CPU</span>
          <span className={statusColors[metrics.serverHealth]}>
            {metrics.serverHealth === 'healthy' ? '23%' : metrics.serverHealth === 'warning' ? '67%' : '94%'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Memory</span>
          <span className={statusColors[metrics.serverHealth]}>
            {metrics.serverHealth === 'healthy' ? '45%' : metrics.serverHealth === 'warning' ? '72%' : '89%'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Network</span>
          <span className="text-cyan-400">Active</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
          onClick={() => updateMetrics({ serverHealth: 'healthy' })}
        >
          Fix
        </Button>
        <Button 
          variant="outline"
          size="sm"
          className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
          onClick={() => updateMetrics({ serverHealth: 'warning' })}
        >
          Simulate Warning
        </Button>
        <Button 
          variant="outline"
          size="sm"
          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
          onClick={() => updateMetrics({ serverHealth: 'critical' })}
        >
          Simulate Critical
        </Button>
      </div>
    </div>
  )
}

function AnalyticsWindowContent({ data }: { data?: Record<string, unknown> }) {
  const { metrics } = useGameStore()
  
  // Generate fake chart data
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: Math.floor(Math.random() * 50) + 20,
  }))
  
  const maxValue = Math.max(...chartData.map(d => d.value))
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-cyan-400 font-mono text-sm">Weekly Analytics</h3>
      
      {/* Bar chart */}
      <div className="flex items-end justify-between h-32 gap-1">
        {chartData.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div 
              className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t"
              style={{ height: `${(d.value / maxValue) * 100}%` }}
            />
            <span className="text-[10px] text-slate-500">{d.day}</span>
          </div>
        ))}
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-slate-800/50 rounded p-2">
          <div className="text-slate-400">Total Tasks</div>
          <div className="text-lg text-cyan-400">{metrics.tasks}</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <div className="text-slate-400">Productivity</div>
          <div className="text-lg text-green-400">{metrics.productivity}%</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <div className="text-slate-400">Sales</div>
          <div className="text-lg text-magenta-400">${metrics.sales.toFixed(0)}</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <div className="text-slate-400">Server</div>
          <div className={`text-lg ${
            metrics.serverHealth === 'healthy' ? 'text-green-400' : 
            metrics.serverHealth === 'warning' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {metrics.serverHealth.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatWindowContent({ data }: { data?: Record<string, unknown> }) {
  const { chatMessages, addChatMessage, npcs, setNPCMessage } = useGameStore()
  const [input, setInput] = useState('')
  
  const handleSend = () => {
    if (!input.trim()) return
    
    addChatMessage({
      senderType: 'player',
      senderName: 'You',
      message: input,
    })
    
    // Simulate NPC response
    setTimeout(() => {
      const responses = [
        "I'm analyzing the latest metrics now.",
        "Server performance looks optimal today!",
        "Have you checked the task queue?",
        "Productivity levels are above average.",
        "I noticed some anomalies in the data.",
      ]
      setNPCMessage('office-manager', responses[Math.floor(Math.random() * responses.length)])
      addChatMessage({
        senderType: 'npc',
        senderName: 'ARIA',
        message: responses[Math.floor(Math.random() * responses.length)],
      })
    }, 500)
    
    setInput('')
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64">
        {chatMessages.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-4">
            Start a conversation with ARIA
          </div>
        ) : (
          chatMessages.map(msg => (
            <div 
              key={msg.id}
              className={`text-xs ${msg.senderType === 'player' ? 'text-right' : 'text-left'}`}
            >
              <span className={`inline-block px-2 py-1 rounded ${
                msg.senderType === 'player' 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'bg-fuchsia-500/20 text-fuchsia-400'
              }`}>
                {msg.message}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* Input */}
      <div className="p-2 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <Button 
          size="sm"
          onClick={handleSend}
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
        >
          Send
        </Button>
      </div>
    </div>
  )
}

function TasksWindowContent({ data }: { data?: Record<string, unknown> }) {
  const { metrics, updateMetrics } = useGameStore()
  
  const tasks = [
    { id: 1, title: 'Review pull requests', priority: 'high' },
    { id: 2, title: 'Update documentation', priority: 'medium' },
    { id: 3, title: 'Fix bug #421', priority: 'high' },
    { id: 4, title: 'Team sync meeting', priority: 'low' },
  ]
  
  const priorityColors = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  }
  
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-cyan-400 font-mono text-sm">Active Tasks</h3>
        <span className="text-xs text-slate-400">{metrics.tasks} completed</span>
      </div>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id}
            className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${
              task.priority === 'high' ? 'bg-red-400' :
              task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <span className="text-xs text-slate-300 flex-1">{task.title}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-cyan-400 hover:bg-cyan-500/20"
              onClick={() => updateMetrics({ tasks: metrics.tasks + 1 })}
            >
              Done
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Map window types to content components
const WINDOW_CONTENTS: Record<string, React.FC<{ data?: Record<string, unknown> }>> = {
  desk: DeskWindowContent,
  server: ServerWindowContent,
  analytics: AnalyticsWindowContent,
  chat: ChatWindowContent,
  tasks: TasksWindowContent,
  settings: () => (
    <div className="p-4 text-slate-400 text-xs">
      Settings panel coming soon...
    </div>
  ),
}

export function WindowManager() {
  const { windows, closeWindow, focusWindow, updateWindowPosition } = useGameStore()
  
  if (windows.length === 0) return null
  
  return (
    <>
      {windows.map(window => {
        const ContentComponent = WINDOW_CONTENTS[window.type || 'settings']
        
        return (
          <DraggableWindow
            key={window.id}
            window={window}
            onClose={() => closeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            onMove={(x, y) => updateWindowPosition(window.id, x, y)}
          >
            {ContentComponent && <ContentComponent data={window.data} />}
          </DraggableWindow>
        )
      })}
    </>
  )
}
