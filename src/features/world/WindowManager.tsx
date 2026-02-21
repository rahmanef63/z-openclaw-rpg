'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { X, Minus, Maximize2, GripVertical } from 'lucide-react';
import { COLORS } from '@/features/engine/constants';

export default function WindowManager() {
  const { windows, activeWindowId, closeWindow, focusWindow, updateWindowPosition } = useGameStore();
  const dragRef = useRef<{
    windowId: string;
    startX: number;
    startY: number;
    windowStartX: number;
    windowStartY: number;
  } | null>(null);
  
  const handleMouseDown = useCallback((e: React.MouseEvent, windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (!win) return;
    
    focusWindow(windowId);
    
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      dragRef.current = {
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        windowStartX: win.x,
        windowStartY: win.y,
      };
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return;
        
        const deltaX = moveEvent.clientX - dragRef.current.startX;
        const deltaY = moveEvent.clientY - dragRef.current.startY;
        
        updateWindowPosition(
          windowId,
          Math.max(0, dragRef.current.windowStartX + deltaX),
          Math.max(0, dragRef.current.windowStartY + deltaY)
        );
      };
      
      const handleMouseUp = () => {
        dragRef.current = null;
        globalThis.window.removeEventListener('mousemove', handleMouseMove);
        globalThis.window.removeEventListener('mouseup', handleMouseUp);
      };
      
      globalThis.window.addEventListener('mousemove', handleMouseMove);
      globalThis.window.addEventListener('mouseup', handleMouseUp);
    }
  }, [windows, focusWindow, updateWindowPosition]);
  
  if (windows.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {windows.filter(w => !w.isMinimized).map(window => (
        <div
          key={window.id}
          className="absolute pointer-events-auto rounded-lg overflow-hidden"
          style={{
            left: window.x,
            top: window.y,
            width: window.width,
            height: window.height,
            zIndex: window.zIndex,
            backgroundColor: COLORS.glass,
            border: `1px solid ${activeWindowId === window.id ? COLORS.accent : COLORS.border}`,
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 ${activeWindowId === window.id ? 20 : 5}px ${COLORS.accent}30`,
          }}
          onMouseDown={(e) => handleMouseDown(e, window.id)}
        >
          {/* Title Bar */}
          <div
            data-drag-handle
            className="flex items-center justify-between h-8 px-2 cursor-move select-none"
            style={{
              backgroundColor: COLORS.background,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center gap-2">
              <GripVertical size={14} style={{ color: COLORS.textMuted }} />
              <span
                className="text-sm font-mono"
                style={{ color: COLORS.accent }}
              >
                {window.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => closeWindow(window.id)}
                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                style={{ color: COLORS.critical }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3 overflow-auto" style={{ height: window.height - 32 }}>
            <WindowContent type={window.type} data={window.data} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Window content renderer
function WindowContent({ type, data }: { type: string; data?: Record<string, unknown> }) {
  switch (type) {
    case 'tasks':
      return <TasksContent />;
    case 'server-status':
      return <ServerStatusContent />;
    case 'analytics':
      return <AnalyticsContent />;
    case 'terminal':
      return <TerminalContent />;
    case 'meetings':
      return <MeetingsContent />;
    case 'break-timer':
      return <BreakTimerContent />;
    default:
      return (
        <div className="text-center text-sm" style={{ color: COLORS.textMuted }}>
          Unknown window type: {type}
        </div>
      );
  }
}

// Tasks Window Content
function TasksContent() {
  const tasks = [
    { id: 1, title: 'Review PR #142', status: 'pending', priority: 'high' },
    { id: 2, title: 'Update documentation', status: 'in_progress', priority: 'medium' },
    { id: 3, title: 'Fix login bug', status: 'completed', priority: 'high' },
    { id: 4, title: 'Team standup notes', status: 'pending', priority: 'low' },
  ];
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-mono text-sm" style={{ color: COLORS.accent }}>Active Tasks</h3>
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: COLORS.accent + '20', color: COLORS.accent }}>
          {tasks.filter(t => t.status !== 'completed').length} remaining
        </span>
      </div>
      {tasks.map(task => (
        <div
          key={task.id}
          className="flex items-center gap-2 p-2 rounded"
          style={{
            backgroundColor: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            opacity: task.status === 'completed' ? 0.5 : 1,
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: task.priority === 'high' ? COLORS.critical :
                             task.priority === 'medium' ? COLORS.warning : COLORS.healthy,
            }}
          />
          <span className="flex-1 text-sm" style={{ color: COLORS.text }}>
            {task.title}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: task.status === 'completed' ? COLORS.healthy + '20' :
                             task.status === 'in_progress' ? COLORS.accent + '20' : COLORS.border,
              color: task.status === 'completed' ? COLORS.healthy :
                    task.status === 'in_progress' ? COLORS.accent : COLORS.textMuted,
            }}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>
      ))}
    </div>
  );
}

// Server Status Content
function ServerStatusContent() {
  const metrics = useGameStore(state => state.metrics);
  const serverMetric = metrics.find(m => m.metricName === 'server_health');
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-mono text-sm" style={{ color: COLORS.accent }}>Server Health</h3>
        <span
          className="text-xs px-2 py-0.5 rounded animate-pulse"
          style={{
            backgroundColor: serverMetric?.status === 'healthy' ? COLORS.healthy + '20' :
                           serverMetric?.status === 'warning' ? COLORS.warning + '20' : COLORS.critical + '20',
            color: serverMetric?.status === 'healthy' ? COLORS.healthy :
                  serverMetric?.status === 'warning' ? COLORS.warning : COLORS.critical,
          }}
        >
          {serverMetric?.status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>
      
      {/* CPU Usage */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: COLORS.textMuted }}>
          <span>CPU Usage</span>
          <span style={{ color: COLORS.accent }}>42%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: '42%', backgroundColor: COLORS.accent }}
          />
        </div>
      </div>
      
      {/* Memory */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: COLORS.textMuted }}>
          <span>Memory</span>
          <span style={{ color: COLORS.accent }}>68%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: '68%', backgroundColor: COLORS.warning }}
          />
        </div>
      </div>
      
      {/* Disk */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: COLORS.textMuted }}>
          <span>Disk Space</span>
          <span style={{ color: COLORS.healthy }}>35%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: '35%', backgroundColor: COLORS.healthy }}
          />
        </div>
      </div>
      
      {/* Network */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded" style={{ backgroundColor: COLORS.background }}>
          <div style={{ color: COLORS.textMuted }}>Upload</div>
          <div style={{ color: COLORS.accent }}>1.2 MB/s</div>
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: COLORS.background }}>
          <div style={{ color: COLORS.textMuted }}>Download</div>
          <div style={{ color: COLORS.accent }}>3.8 MB/s</div>
        </div>
      </div>
    </div>
  );
}

// Analytics Content
function AnalyticsContent() {
  const metrics = useGameStore(state => state.metrics);
  const tasksCompleted = metrics.find(m => m.metricName === 'tasks_completed');
  const salesToday = metrics.find(m => m.metricName === 'sales_today');
  
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-sm" style={{ color: COLORS.accent }}>Analytics Dashboard</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div
          className="p-3 rounded-lg text-center"
          style={{ backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}` }}
        >
          <div className="text-2xl font-bold" style={{ color: COLORS.accent }}>
            {tasksCompleted?.value || 0}
          </div>
          <div className="text-xs" style={{ color: COLORS.textMuted }}>Tasks Done</div>
        </div>
        <div
          className="p-3 rounded-lg text-center"
          style={{ backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}` }}
        >
          <div className="text-2xl font-bold" style={{ color: COLORS.accent }}>
            ${salesToday?.value || 0}
          </div>
          <div className="text-xs" style={{ color: COLORS.textMuted }}>Sales Today</div>
        </div>
      </div>
      
      {/* Mini chart placeholder */}
      <div
        className="h-24 rounded-lg flex items-end justify-around p-2 gap-1"
        style={{ backgroundColor: COLORS.background }}
      >
        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${h}%`,
              backgroundColor: COLORS.accent,
              opacity: 0.5 + (i / 24),
            }}
          />
        ))}
      </div>
      <div className="text-xs text-center" style={{ color: COLORS.textMuted }}>
        Weekly Activity
      </div>
    </div>
  );
}

// Terminal Content
function TerminalContent() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    '> system.status',
    'OK: All systems operational',
    '> metrics.check',
    'Server Health: 98%',
    'Tasks Completed: 15',
    '> _',
  ]);
  
  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      setHistory([...history, `> ${input}`, 'Command executed...', '> _']);
      setInput('');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 p-2 rounded font-mono text-xs overflow-auto"
        style={{ backgroundColor: '#000', color: COLORS.accent }}
      >
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleCommand}
        placeholder="Enter command..."
        className="mt-2 w-full px-2 py-1 rounded text-sm font-mono"
        style={{
          backgroundColor: '#000',
          border: `1px solid ${COLORS.accent}`,
          color: COLORS.accent,
        }}
      />
    </div>
  );
}

// Meetings Content
function MeetingsContent() {
  const meetings = [
    { time: '09:00', title: 'Daily Standup', attendees: 5 },
    { time: '14:00', title: 'Sprint Planning', attendees: 8 },
    { time: '16:30', title: 'Design Review', attendees: 3 },
  ];
  
  return (
    <div className="space-y-2">
      <h3 className="font-mono text-sm mb-3" style={{ color: COLORS.accent }}>Today's Meetings</h3>
      {meetings.map((meeting, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded"
          style={{ backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}` }}
        >
          <span
            className="text-xs font-mono w-12"
            style={{ color: COLORS.accent }}
          >
            {meeting.time}
          </span>
          <div className="flex-1">
            <div className="text-sm" style={{ color: COLORS.text }}>{meeting.title}</div>
            <div className="text-xs" style={{ color: COLORS.textMuted }}>
              {meeting.attendees} attendees
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Break Timer Content
function BreakTimerContent() {
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="text-center space-y-4">
      <h3 className="font-mono text-sm" style={{ color: COLORS.accent }}>☕ Break Timer</h3>
      <div
        className="text-4xl font-mono"
        style={{ color: COLORS.accent }}
      >
        {formatTime(timer)}
      </div>
      <div className="text-xs" style={{ color: COLORS.textMuted }}>
        Time for a coffee break!
      </div>
      <button
        onClick={() => setTimer(300)}
        className="px-4 py-1 rounded text-sm"
        style={{
          backgroundColor: COLORS.accent + '20',
          border: `1px solid ${COLORS.accent}`,
          color: COLORS.accent,
        }}
      >
        Reset Timer
      </button>
    </div>
  );
}
