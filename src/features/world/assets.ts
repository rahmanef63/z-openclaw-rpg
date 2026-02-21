/**
 * Asset utility for loading and managing SVG sprites
 */

import type { VisualState, Direction } from '@/features/engine/types';

// Character assets
export const characterAssets = {
  player: {
    base: '/assets/characters/player.svg',
    idle: '/assets/characters/player-idle.svg',
    up: '/assets/characters/player-up.svg',
    down: '/assets/characters/player-down.svg',
    left: '/assets/characters/player-left.svg',
    right: '/assets/characters/player-right.svg',
  },
  npc: {
    aria: '/assets/characters/npc-aria.svg',
  },
} as const;

// Electronics assets
export const electronicsAssets = {
  serverRack: {
    healthy: '/assets/electronics/server-rack-healthy.svg',
    warning: '/assets/electronics/server-rack-warning.svg',
    critical: '/assets/electronics/server-rack-critical.svg',
  },
  terminal: '/assets/electronics/terminal.svg',
} as const;

// Furniture assets
export const furnitureAssets = {
  desk: '/assets/furniture/desk.svg',
  chair: '/assets/furniture/chair.svg',
  meetingTable: '/assets/furniture/meeting-table.svg',
  bookshelf: '/assets/furniture/bookshelf.svg',
} as const;

// Plant assets
export const plantAssets = {
  wilted: '/assets/plants/plant-wilted.svg',
  healthy: '/assets/plants/plant-healthy.svg',
  blooming: '/assets/plants/plant-blooming.svg',
} as const;

// Tile assets
export const tileAssets = {
  floor: {
    basic: '/assets/tiles/floor-basic.svg',
    alt: '/assets/tiles/floor-alt.svg',
  },
  wall: {
    basic: '/assets/tiles/wall-basic.svg',
  },
} as const;

// Effect assets
export const effectAssets = {
  spark: '/assets/effects/spark.svg',
  smoke: '/assets/effects/smoke.svg',
  glowRing: '/assets/effects/glow-ring.svg',
  alertIndicator: '/assets/effects/alert-indicator.svg',
} as const;

/**
 * Get player sprite based on direction
 */
export function getPlayerSprite(direction: Direction, isMoving: boolean): string {
  if (!isMoving) return characterAssets.player.idle;
  
  switch (direction) {
    case 'up': return characterAssets.player.up;
    case 'down': return characterAssets.player.down;
    case 'left': return characterAssets.player.left;
    case 'right': return characterAssets.player.right;
    default: return characterAssets.player.base;
  }
}

/**
 * Get server rack sprite based on state
 */
export function getServerRackSprite(state: VisualState): string {
  switch (state) {
    case 'warning': return electronicsAssets.serverRack.warning;
    case 'critical': return electronicsAssets.serverRack.critical;
    default: return electronicsAssets.serverRack.healthy;
  }
}

/**
 * Get plant sprite based on health state
 */
export function getPlantSprite(tasksCompleted: number): string {
  if (tasksCompleted > 20) return plantAssets.blooming;
  if (tasksCompleted > 5) return plantAssets.healthy;
  return plantAssets.wilted;
}

/**
 * Get plant state from tasks count
 */
export function getPlantState(tasksCompleted: number): VisualState {
  if (tasksCompleted > 20) return 'healthy'; // Blooming state
  if (tasksCompleted > 5) return 'healthy';
  return 'warning'; // Wilted
}

/**
 * Preload all assets for better performance
 */
export function preloadAssets(): Promise<void[]> {
  const allAssets = [
    ...Object.values(characterAssets.player),
    ...Object.values(characterAssets.npc),
    ...Object.values(electronicsAssets.serverRack),
    electronicsAssets.terminal,
    ...Object.values(furnitureAssets),
    ...Object.values(plantAssets),
    ...Object.values(tileAssets.floor),
    tileAssets.wall.basic,
    ...Object.values(effectAssets),
  ];
  
  return Promise.all(
    allAssets.map(src => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't fail on error
        img.src = src;
      });
    })
  );
}
