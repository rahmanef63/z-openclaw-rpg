'use client';

import { create } from 'zustand';
import type { GridPosition, GameWindow, NPC, BusinessMetric, VisualState } from '@/features/engine/types';

// Path finding node
interface PathNode {
  gridX: number;
  gridY: number;
}

interface GameState {
  // Player state
  playerGridPos: GridPosition;
  playerDirection: 'up' | 'down' | 'left' | 'right';
  playerState: 'idle' | 'walking' | 'running' | 'interacting';
  isRunning: boolean;
  
  // Click-to-move target
  moveTarget: GridPosition | null;
  currentPath: PathNode[];
  
  // Scene state
  currentScene: string;
  
  // Windows
  windows: GameWindow[];
  activeWindowId: string | null;
  nextZIndex: number;
  
  // NPCs
  npcs: NPC[];
  
  // Business metrics
  metrics: BusinessMetric[];
  
  // UI state
  isPaused: boolean;
  showMinimap: boolean;
  showNPCCreator: boolean;
  notifications: Array<{ id: string; message: string; type: 'info' | 'warning' | 'critical' }>;
  
  // Actions
  setPlayerPosition: (pos: GridPosition) => void;
  setPlayerDirection: (dir: 'up' | 'down' | 'left' | 'right') => void;
  setPlayerState: (state: 'idle' | 'walking' | 'running' | 'interacting') => void;
  setIsRunning: (running: boolean) => void;
  
  // Pathfinding
  setMoveTarget: (target: GridPosition | null) => void;
  setCurrentPath: (path: PathNode[]) => void;
  advancePath: () => void;
  
  openWindow: (window: Omit<GameWindow, 'id' | 'zIndex'>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  minimizeWindow: (id: string) => void;
  
  addNotification: (message: string, type: 'info' | 'warning' | 'critical') => void;
  removeNotification: (id: string) => void;
  
  updateMetric: (name: string, value: number, status: VisualState) => void;
  
  // NPC management
  addNPC: (npc: Omit<NPC, 'id'>) => void;
  removeNPC: (id: string) => void;
  setNPCMessage: (npcId: string, message: string) => void;
  moveNPC: (npcId: string, gridX: number, gridY: number) => void;
  
  togglePause: () => void;
  toggleMinimap: () => void;
  toggleNPCCreator: () => void;
}

// Counter for unique IDs
let notificationCounter = 0;
let windowCounter = 0;
let npcCounter = 0;

export const useGameStore = create<GameState>((set, get) => ({
  // Initial player state
  playerGridPos: { gridX: 10, gridY: 10 },
  playerDirection: 'down',
  playerState: 'idle',
  isRunning: false,
  
  // Movement
  moveTarget: null,
  currentPath: [],
  
  // Initial scene
  currentScene: 'workspace',
  
  // Windows
  windows: [],
  activeWindowId: null,
  nextZIndex: 1,
  
  // NPCs
  npcs: [
    {
      id: 'office-manager',
      name: 'ARIA',
      gridX: 5,
      gridY: 5,
      targetGridX: null,
      targetGridY: null,
      isMoving: false,
      state: 'idle',
    },
  ],
  
  // Metrics
  metrics: [
    { id: 'server-health', metricName: 'server_health', value: 98, status: 'healthy', timestamp: Date.now() },
    { id: 'tasks-completed', metricName: 'tasks_completed', value: 15, status: 'healthy', timestamp: Date.now() },
    { id: 'sales-today', metricName: 'sales_today', value: 1250, status: 'healthy', timestamp: Date.now() },
  ],
  
  // UI
  isPaused: false,
  showMinimap: true,
  showNPCCreator: false,
  notifications: [],
  
  // Actions
  setPlayerPosition: (pos) => set({ playerGridPos: pos }),
  setPlayerDirection: (dir) => set({ playerDirection: dir }),
  setPlayerState: (state) => set({ playerState: state }),
  setIsRunning: (running) => set({ isRunning: running }),
  
  // Pathfinding
  setMoveTarget: (target) => set({ moveTarget: target }),
  setCurrentPath: (path) => set({ currentPath: path }),
  advancePath: () => {
    const { currentPath } = get();
    if (currentPath.length > 1) {
      set({ currentPath: currentPath.slice(1) });
    } else {
      set({ currentPath: [], moveTarget: null, playerState: 'idle' });
    }
  },
  
  openWindow: (window) => {
    const id = `window-${Date.now()}-${++windowCounter}`;
    const { nextZIndex } = get();
    set({
      windows: [...get().windows, { ...window, id, zIndex: nextZIndex }],
      activeWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },
  
  closeWindow: (id) => set({
    windows: get().windows.filter(w => w.id !== id),
    activeWindowId: get().activeWindowId === id ? null : get().activeWindowId,
  }),
  
  focusWindow: (id) => {
    const { nextZIndex, windows } = get();
    set({
      windows: windows.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w),
      activeWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },
  
  updateWindowPosition: (id, x, y) => set({
    windows: get().windows.map(w => w.id === id ? { ...w, x, y } : w),
  }),
  
  minimizeWindow: (id) => set({
    windows: get().windows.map(w => w.id === id ? { ...w, isMinimized: true } : w),
  }),
  
  addNotification: (message, type) => {
    const id = `notif-${Date.now()}-${++notificationCounter}`;
    set({ notifications: [...get().notifications, { id, message, type }] });
    // Auto-remove after 5 seconds
    setTimeout(() => get().removeNotification(id), 5000);
  },
  
  removeNotification: (id) => set({
    notifications: get().notifications.filter(n => n.id !== id),
  }),
  
  updateMetric: (name, value, status) => set({
    metrics: get().metrics.map(m =>
      m.metricName === name
        ? { ...m, value, status, timestamp: Date.now() }
        : m
    ),
  }),
  
  // NPC management
  addNPC: (npc) => {
    const id = `npc-${Date.now()}-${++npcCounter}`;
    set({ npcs: [...get().npcs, { ...npc, id }] });
    get().addNotification(`New agent spawned: ${npc.name}`, 'info');
  },
  
  removeNPC: (id) => {
    const npc = get().npcs.find(n => n.id === id);
    if (npc && npc.id !== 'office-manager') {
      set({ npcs: get().npcs.filter(n => n.id !== id) });
      get().addNotification(`Agent removed: ${npc.name}`, 'info');
    }
  },
  
  setNPCMessage: (npcId, message) => set({
    npcs: get().npcs.map(npc =>
      npc.id === npcId ? { ...npc, message } : npc
    ),
  }),
  
  moveNPC: (npcId, gridX, gridY) => set({
    npcs: get().npcs.map(npc =>
      npc.id === npcId ? { ...npc, gridX, gridY } : npc
    ),
  }),
  
  togglePause: () => set({ isPaused: !get().isPaused }),
  toggleMinimap: () => set({ showMinimap: !get().showMinimap }),
  toggleNPCCreator: () => set({ showNPCCreator: !get().showNPCCreator }),
}));
