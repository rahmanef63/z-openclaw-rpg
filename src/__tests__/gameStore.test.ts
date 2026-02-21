import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/stores/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      playerGridPos: { gridX: 10, gridY: 10 },
      playerDirection: 'down',
      playerState: 'idle',
      isRunning: false,
      moveTarget: null,
      currentPath: [],
      windows: [],
      activeWindowId: null,
      nextZIndex: 1,
      notifications: [],
      isPaused: false,
      showMinimap: true,
      showNPCCreator: false,
    });
  });

  describe('Player State', () => {
    it('should set player position', () => {
      const { setPlayerPosition } = useGameStore.getState();
      setPlayerPosition({ gridX: 5, gridY: 8 });
      
      expect(useGameStore.getState().playerGridPos).toEqual({ gridX: 5, gridY: 8 });
    });

    it('should set player direction', () => {
      const { setPlayerDirection } = useGameStore.getState();
      setPlayerDirection('up');
      
      expect(useGameStore.getState().playerDirection).toBe('up');
    });

    it('should set player state', () => {
      const { setPlayerState } = useGameStore.getState();
      setPlayerState('running');
      
      expect(useGameStore.getState().playerState).toBe('running');
    });

    it('should toggle running state', () => {
      const { setIsRunning } = useGameStore.getState();
      
      setIsRunning(true);
      expect(useGameStore.getState().isRunning).toBe(true);
      
      setIsRunning(false);
      expect(useGameStore.getState().isRunning).toBe(false);
    });
  });

  describe('Pathfinding', () => {
    it('should set move target', () => {
      const { setMoveTarget } = useGameStore.getState();
      setMoveTarget({ gridX: 15, gridY: 15 });
      
      expect(useGameStore.getState().moveTarget).toEqual({ gridX: 15, gridY: 15 });
    });

    it('should set current path', () => {
      const { setCurrentPath } = useGameStore.getState();
      const path = [
        { gridX: 10, gridY: 10 },
        { gridX: 11, gridY: 10 },
        { gridX: 12, gridY: 10 },
      ];
      
      setCurrentPath(path);
      
      expect(useGameStore.getState().currentPath).toHaveLength(3);
    });

    it('should advance path correctly', () => {
      const { setCurrentPath, advancePath } = useGameStore.getState();
      const path = [
        { gridX: 10, gridY: 10 },
        { gridX: 11, gridY: 10 },
        { gridX: 12, gridY: 10 },
      ];
      
      setCurrentPath(path);
      advancePath();
      
      expect(useGameStore.getState().currentPath).toHaveLength(2);
      expect(useGameStore.getState().currentPath[0]).toEqual({ gridX: 11, gridY: 10 });
    });

    it('should clear path when advancing to end', () => {
      const { setCurrentPath, advancePath } = useGameStore.getState();
      
      setCurrentPath([{ gridX: 10, gridY: 10 }]);
      advancePath();
      
      expect(useGameStore.getState().currentPath).toHaveLength(0);
      expect(useGameStore.getState().moveTarget).toBeNull();
      expect(useGameStore.getState().playerState).toBe('idle');
    });
  });

  describe('Windows', () => {
    it('should open a window', () => {
      const { openWindow } = useGameStore.getState();
      openWindow({
        title: 'Test Window',
        type: 'test',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        isMinimized: false,
      });
      
      const { windows } = useGameStore.getState();
      expect(windows).toHaveLength(1);
      expect(windows[0].title).toBe('Test Window');
      expect(windows[0].zIndex).toBe(1);
    });

    it('should close a window', () => {
      const { openWindow, closeWindow } = useGameStore.getState();
      
      openWindow({
        title: 'Test Window',
        type: 'test',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        isMinimized: false,
      });
      
      const windowId = useGameStore.getState().windows[0].id;
      closeWindow(windowId);
      
      expect(useGameStore.getState().windows).toHaveLength(0);
    });

    it('should focus a window (increase zIndex)', () => {
      const { openWindow, focusWindow } = useGameStore.getState();
      
      openWindow({
        title: 'Test Window',
        type: 'test',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        isMinimized: false,
      });
      
      const windowId = useGameStore.getState().windows[0].id;
      focusWindow(windowId);
      
      expect(useGameStore.getState().windows[0].zIndex).toBe(2);
      expect(useGameStore.getState().activeWindowId).toBe(windowId);
    });

    it('should update window position', () => {
      const { openWindow, updateWindowPosition } = useGameStore.getState();
      
      openWindow({
        title: 'Test Window',
        type: 'test',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        isMinimized: false,
      });
      
      const windowId = useGameStore.getState().windows[0].id;
      updateWindowPosition(windowId, 200, 200);
      
      expect(useGameStore.getState().windows[0].x).toBe(200);
      expect(useGameStore.getState().windows[0].y).toBe(200);
    });

    it('should minimize a window', () => {
      const { openWindow, minimizeWindow } = useGameStore.getState();
      
      openWindow({
        title: 'Test Window',
        type: 'test',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        isMinimized: false,
      });
      
      const windowId = useGameStore.getState().windows[0].id;
      minimizeWindow(windowId);
      
      expect(useGameStore.getState().windows[0].isMinimized).toBe(true);
    });
  });

  describe('Notifications', () => {
    it('should add a notification', () => {
      const { addNotification } = useGameStore.getState();
      addNotification('Test notification', 'info');
      
      expect(useGameStore.getState().notifications).toHaveLength(1);
      expect(useGameStore.getState().notifications[0].message).toBe('Test notification');
    });

    it('should remove a notification', () => {
      const { addNotification, removeNotification } = useGameStore.getState();
      
      addNotification('Test notification', 'info');
      const notifId = useGameStore.getState().notifications[0].id;
      removeNotification(notifId);
      
      expect(useGameStore.getState().notifications).toHaveLength(0);
    });

    it('should auto-remove notification after timeout', () => {
      vi.useFakeTimers();
      
      const { addNotification } = useGameStore.getState();
      addNotification('Test notification', 'info');
      
      expect(useGameStore.getState().notifications).toHaveLength(1);
      
      vi.advanceTimersByTime(5000);
      
      expect(useGameStore.getState().notifications).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('Metrics', () => {
    it('should update a metric', () => {
      const { updateMetric } = useGameStore.getState();
      updateMetric('server_health', 50, 'warning');
      
      const metric = useGameStore.getState().metrics.find(m => m.metricName === 'server_health');
      expect(metric?.value).toBe(50);
      expect(metric?.status).toBe('warning');
    });
  });

  describe('NPC Management', () => {
    it('should add an NPC', () => {
      const initialNpcs = useGameStore.getState().npcs.length;
      const { addNPC } = useGameStore.getState();
      
      addNPC({
        name: 'Test NPC',
        gridX: 5,
        gridY: 5,
        targetGridX: null,
        targetGridY: null,
        isMoving: false,
        state: 'idle',
      });
      
      expect(useGameStore.getState().npcs.length).toBe(initialNpcs + 1);
    });

    it('should set NPC message', () => {
      const { setNPCMessage } = useGameStore.getState();
      setNPCMessage('office-manager', 'Hello!');
      
      const npc = useGameStore.getState().npcs.find(n => n.id === 'office-manager');
      expect(npc?.message).toBe('Hello!');
    });

    it('should move an NPC', () => {
      const { moveNPC } = useGameStore.getState();
      moveNPC('office-manager', 10, 10);
      
      const npc = useGameStore.getState().npcs.find(n => n.id === 'office-manager');
      expect(npc?.gridX).toBe(10);
      expect(npc?.gridY).toBe(10);
    });
  });

  describe('UI Toggles', () => {
    it('should toggle pause', () => {
      const { togglePause } = useGameStore.getState();
      
      expect(useGameStore.getState().isPaused).toBe(false);
      togglePause();
      expect(useGameStore.getState().isPaused).toBe(true);
      togglePause();
      expect(useGameStore.getState().isPaused).toBe(false);
    });

    it('should toggle minimap', () => {
      const { toggleMinimap } = useGameStore.getState();
      
      expect(useGameStore.getState().showMinimap).toBe(true);
      toggleMinimap();
      expect(useGameStore.getState().showMinimap).toBe(false);
    });

    it('should toggle NPC creator', () => {
      const { toggleNPCCreator } = useGameStore.getState();
      
      expect(useGameStore.getState().showNPCCreator).toBe(false);
      toggleNPCCreator();
      expect(useGameStore.getState().showNPCCreator).toBe(true);
    });
  });
});
