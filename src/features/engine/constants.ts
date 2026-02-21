// Core game constants for Super Space RPG

export const TILE_SIZE = 32; // Rendered tile size (16px base * 2x scale)
export const GRID_SIZE = 16; // Base grid size in pixels
export const MAP_WIDTH = 20; // Tiles wide
export const MAP_HEIGHT = 20; // Tiles tall

// Movement settings
export const WALK_DURATION = 150; // ms for walking animation
export const RUN_DURATION = 75; // ms for running animation
export const MOVEMENT_DURATION = 150; // ms for movement animation (legacy alias)
export const POSITION_SYNC_DEBOUNCE = 500; // ms between position syncs

// Game loop settings
export const TARGET_FPS = 60;
export const FRAME_DURATION = 1000 / TARGET_FPS;

// Life system settings
export const MAX_ASPECT_SCORE = 100;
export const MIN_ASPECT_SCORE = 0;
export const ACTIVITY_LOG_LIMIT = 100;
export const NOTIFICATION_DURATION = 5000; // ms

// Interaction settings
export const INTERACTION_COOLDOWN = 5000; // ms
export const MINI_GAME_DURATION = 30000; // ms

// Quest settings
export const MAX_ACTIVE_QUESTS = 5;

// Build mode settings
export const FURNITURE_ROTATIONS = [0, 90, 180, 270] as const;
export type FurnitureRotation = typeof FURNITURE_ROTATIONS[number];

// Colors (Cyber-Pixel theme)
export const COLORS = {
  background: '#0f172a',
  floor: '#1e293b',
  floorAlt: '#1e3a5f',
  wall: '#334155',
  wallHighlight: '#475569',
  player: '#00ffff',
  playerGlow: 'rgba(0, 255, 255, 0.5)',
  npc: '#ff00ff',
  npcGlow: 'rgba(255, 0, 255, 0.5)',
  accent: '#00ffff',
  accentSecondary: '#ff00ff',
  healthy: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  glass: 'rgba(15, 23, 42, 0.8)',
} as const;

// Player states
export const PLAYER_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  INTERACTING: 'interacting',
} as const;

// Directions
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

// Object types
export const OBJECT_TYPES = {
  FLOOR: 'floor',
  WALL: 'wall',
  FURNITURE: 'furniture',
  NPC: 'npc',
  INTERACTIVE: 'interactive',
} as const;

// Visual states for data-driven objects
export const VISUAL_STATES = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;
