'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { GameConfig, GameState } from '../schemas/game.schema';
import defaultGameConfig from '../defaults/game-default.json';

// ==========================================
// GAME CONFIG CONTEXT
// ==========================================

interface GameConfigContextValue {
  // Current config
  config: GameConfig;
  configId: string;
  
  // Game state
  state: GameState;
  setState: (updates: Partial<GameState>) => void;
  
  // Config actions
  loadConfig: (gameConfig: GameConfig) => void;
  resetConfig: () => void;
  updateConfig: <K extends keyof GameConfig>(section: K, updates: Partial<GameConfig[K]>) => void;
  
  // Config getters
  getGridConfig: () => GameConfig['grid'];
  getPlayerConfig: () => GameConfig['player'];
  getCameraConfig: () => GameConfig['camera'];
  getUIConfig: () => GameConfig['ui'];
  getBuildModeConfig: () => GameConfig['buildMode'];
  getInteractionConfig: () => GameConfig['interaction'];
  
  // Helpers
  isPaused: boolean;
  isLoading: boolean;
  pause: () => void;
  resume: () => void;
  setLoading: (loading: boolean) => void;
}

const GameConfigContext = createContext<GameConfigContextValue | null>(null);

// ==========================================
// INITIAL STATE
// ==========================================

const initialGameState: GameState = {
  isPaused: false,
  isLoading: true,
  currentScene: 'main',
  lastSaveTime: 0,
  playTime: 0,
};

// ==========================================
// GAME CONFIG PROVIDER
// ==========================================

interface GameConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: GameConfig;
  storageKey?: string;
}

export function GameConfigProvider({ 
  children, 
  initialConfig,
  storageKey = 'super-space-rpg-config'
}: GameConfigProviderProps) {
  // Initialize config
  const [config, setConfig] = useState<GameConfig>(() => {
    if (initialConfig) return initialConfig;
    
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.grid) {
            return parsed as GameConfig;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    return defaultGameConfig as GameConfig;
  });
  
  // Game state
  const [state, setStateInternal] = useState<GameState>(initialGameState);
  
  const configId = config.id;
  
  // Store config when it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // Ignore storage errors
    }
  }, [config, storageKey]);
  
  // Load a new config
  const loadConfig = useCallback((gameConfig: GameConfig) => {
    setConfig(gameConfig);
  }, []);
  
  // Reset to default config
  const resetConfig = useCallback(() => {
    setConfig(defaultGameConfig as GameConfig);
  }, []);
  
  // Update a section of the config
  const updateConfig = useCallback(<K extends keyof GameConfig>(
    section: K, 
    updates: Partial<GameConfig[K]>
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        ...updates,
      },
    }));
  }, []);
  
  // Update game state
  const setState = useCallback((updates: Partial<GameState>) => {
    setStateInternal(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Pause/resume helpers
  const pause = useCallback(() => setState({ isPaused: true }), [setState]);
  const resume = useCallback(() => setState({ isPaused: false }), [setState]);
  const setLoading = useCallback((loading: boolean) => setState({ isLoading: loading }), [setState]);
  
  // Config getters with memoization
  const getGridConfig = useCallback(() => config.grid, [config.grid]);
  const getPlayerConfig = useCallback(() => config.player, [config.player]);
  const getCameraConfig = useCallback(() => config.camera, [config.camera]);
  const getUIConfig = useCallback(() => config.ui, [config.ui]);
  const getBuildModeConfig = useCallback(() => config.buildMode, [config.buildMode]);
  const getInteractionConfig = useCallback(() => config.interaction, [config.interaction]);
  
  const value: GameConfigContextValue = useMemo(() => ({
    config,
    configId,
    state,
    setState,
    loadConfig,
    resetConfig,
    updateConfig,
    getGridConfig,
    getPlayerConfig,
    getCameraConfig,
    getUIConfig,
    getBuildModeConfig,
    getInteractionConfig,
    isPaused: state.isPaused,
    isLoading: state.isLoading,
    pause,
    resume,
    setLoading,
  }), [
    config,
    configId,
    state,
    setState,
    loadConfig,
    resetConfig,
    updateConfig,
    getGridConfig,
    getPlayerConfig,
    getCameraConfig,
    getUIConfig,
    getBuildModeConfig,
    getInteractionConfig,
    pause,
    resume,
    setLoading,
  ]);
  
  return (
    <GameConfigContext.Provider value={value}>
      {children}
    </GameConfigContext.Provider>
  );
}

// ==========================================
// USE GAME CONFIG HOOK
// ==========================================

export function useGameConfig(): GameConfigContextValue {
  const context = useContext(GameConfigContext);
  if (!context) {
    throw new Error('useGameConfig must be used within a GameConfigProvider');
  }
  return context;
}

// ==========================================
// CONVENIENCE HOOKS
// ==========================================

export function useGridConfig() {
  const { getGridConfig } = useGameConfig();
  return getGridConfig();
}

export function usePlayerConfig() {
  const { getPlayerConfig } = useGameConfig();
  return getPlayerConfig();
}

export function useCameraConfig() {
  const { getCameraConfig } = useGameConfig();
  return getCameraConfig();
}

export function useUIConfig() {
  const { getUIConfig } = useGameConfig();
  return getUIConfig();
}

export function useBuildModeConfig() {
  const { getBuildModeConfig } = useGameConfig();
  return getBuildModeConfig();
}

export function useInteractionConfig() {
  const { getInteractionConfig } = useGameConfig();
  return getInteractionConfig();
}

export { GameConfigContext };
