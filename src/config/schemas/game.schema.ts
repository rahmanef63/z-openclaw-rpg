// ==========================================
// GAME CONFIGURATION SCHEMA
// ==========================================

export interface GameGridConfig {
  width: number;
  height: number;
  tileSize: number;
  showGrid: boolean;
  gridColor: string;
  gridOpacity: number;
}

export interface GameCameraConfig {
  followPlayer: boolean;
  smoothing: number;
  zoom: {
    min: number;
    max: number;
    default: number;
  };
  bounds: {
    enabled: boolean;
    padding: number;
  };
}

export interface GamePlayerConfig {
  startGridX: number;
  startGridY: number;
  walkSpeed: number;
  runSpeed: number;
  animationSpeed: number;
  spriteSheet?: string;
  frameCount: {
    idle: number;
    walk: number;
    run: number;
  };
}

export interface GameNPCConfig {
  defaultSpeed: number;
  wanderEnabled: boolean;
  wanderInterval: number;
  wanderRange: number;
  interactionDistance: number;
}

export interface GameTimePhase {
  start: number;
  end: number;
  ambientColor?: string;
}

export interface GameTimeConfig {
  syncWithRealTime: boolean;
  dayDuration: number;
  phases: {
    morning: GameTimePhase;
    afternoon: GameTimePhase;
    evening: GameTimePhase;
    night: GameTimePhase;
  };
  format: '12h' | '24h';
}

export interface GameUIConfig {
  showMinimap: boolean;
  showFPS: boolean;
  showControls: boolean;
  showCoordinates: boolean;
  minimapScale: number;
  minimapPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  controlsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface GameAudioConfig {
  enabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  sounds: {
    footstep: string;
    interact: string;
    place: string;
    error: string;
    notification: string;
    success: string;
  };
}

export interface GameBuildModeConfig {
  defaultRotation: number;
  snapToGrid: boolean;
  showPreview: boolean;
  showOverlap: boolean;
  previewOpacity: number;
  validColor: string;
  invalidColor: string;
  rotationStep: number;
}

export interface GameInteractionConfig {
  clickToMove: boolean;
  remoteInteraction: boolean;
  interactionRange: number;
  interactionCooldown: number;
  showInteractionHints: boolean;
}

export interface GameQuestConfig {
  maxActiveQuests: number;
  showNotifications: boolean;
  autoTrackNew: boolean;
  rewardAnimation: boolean;
}

export interface GameSaveConfig {
  autoSave: boolean;
  autoSaveInterval: number;
  maxSaves: number;
  storageKey: string;
}

export interface GameConfig {
  // Meta
  id: string;
  name: string;
  version: string;
  
  // Sections
  grid: GameGridConfig;
  camera: GameCameraConfig;
  player: GamePlayerConfig;
  npc: GameNPCConfig;
  time: GameTimeConfig;
  ui: GameUIConfig;
  audio: GameAudioConfig;
  buildMode: GameBuildModeConfig;
  interaction: GameInteractionConfig;
  quest: GameQuestConfig;
  save: GameSaveConfig;
}

// ==========================================
// GAME STATE INTERFACE
// ==========================================

export interface GameState {
  isPaused: boolean;
  isLoading: boolean;
  currentScene: string;
  lastSaveTime: number;
  playTime: number;
}
