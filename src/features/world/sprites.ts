/**
 * Sprite Rendering System
 * CSS-based pixel art sprites for cyber-pixel aesthetic
 */

import { CELL_SIZE } from '../engine/grid'

export type SpriteType = 
  | 'player' 
  | 'wall' 
  | 'floor' 
  | 'desk' 
  | 'chair' 
  | 'server_rack' 
  | 'plant' 
  | 'terminal'
  | 'bookshelf'
  | 'door'
  | 'npc'

export type Direction = 'up' | 'down' | 'left' | 'right'
export type VisualState = 'healthy' | 'warning' | 'critical' | 'normal' | 'blooming' | 'active' | 'default'

interface SpriteConfig {
  width: number
  height: number
  color: string
  accentColor?: string
  glowColor?: string
  pattern?: 'solid' | 'grid' | 'striped' | 'circuit'
}

const SPRITE_CONFIGS: Record<string, SpriteConfig> = {
  player: { width: 1, height: 1, color: '#00ffff', accentColor: '#ffffff', glowColor: '#00ffff', pattern: 'solid' },
  npc: { width: 1, height: 1, color: '#ff00ff', accentColor: '#ffffff', glowColor: '#ff00ff', pattern: 'solid' },
  wall: { width: 1, height: 1, color: '#1e293b', accentColor: '#334155', pattern: 'grid' },
  floor: { width: 1, height: 1, color: '#0f172a', accentColor: '#1e293b', pattern: 'grid' },
  desk: { width: 1, height: 1, color: '#334155', accentColor: '#475569', glowColor: '#00ffff', pattern: 'solid' },
  chair: { width: 1, height: 1, color: '#475569', accentColor: '#64748b', pattern: 'solid' },
  server_rack: { width: 1, height: 1, color: '#1e293b', accentColor: '#334155', glowColor: '#22c55e', pattern: 'circuit' },
  server_rack_warning: { width: 1, height: 1, color: '#1e293b', accentColor: '#f59e0b', glowColor: '#f59e0b', pattern: 'circuit' },
  server_rack_critical: { width: 1, height: 1, color: '#1e293b', accentColor: '#ef4444', glowColor: '#ef4444', pattern: 'circuit' },
  plant: { width: 1, height: 1, color: '#166534', accentColor: '#22c55e', pattern: 'solid' },
  plant_blooming: { width: 1, height: 1, color: '#166534', accentColor: '#ec4899', glowColor: '#ec4899', pattern: 'solid' },
  terminal: { width: 1, height: 1, color: '#0f172a', accentColor: '#00ffff', glowColor: '#00ffff', pattern: 'circuit' },
  bookshelf: { width: 1, height: 1, color: '#78350f', accentColor: '#92400e', pattern: 'striped' },
  door: { width: 1, height: 1, color: '#1e293b', accentColor: '#00ffff', glowColor: '#00ffff', pattern: 'solid' },
}

/**
 * Generate CSS styles for a sprite
 */
export function getSpriteStyles(
  type: SpriteType,
  visualState: VisualState = 'default',
  direction: Direction = 'down',
  isMoving: boolean = false
): React.CSSProperties {
  const stateKey = visualState !== 'default' && visualState !== 'normal' ? `${type}_${visualState}` : type
  const config = SPRITE_CONFIGS[stateKey] || SPRITE_CONFIGS[type] || SPRITE_CONFIGS.floor
  
  const width = config.width * CELL_SIZE
  const height = config.height * CELL_SIZE
  
  return {
    width,
    height,
    backgroundColor: config.color,
    borderRadius: type === 'player' || type === 'npc' ? '50%' : '2px',
    boxShadow: config.glowColor 
      ? `0 0 ${isMoving ? 15 : 10}px ${config.glowColor}, inset 0 0 10px ${config.accentColor || config.color}`
      : `inset 0 0 8px ${config.accentColor || config.color}`,
    border: `1px solid ${config.accentColor || config.color}`,
    transition: isMoving ? 'none' : 'box-shadow 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
  }
}

/**
 * Generate pattern overlay for sprites
 */
export function getPatternOverlay(type: SpriteType, visualState: VisualState = 'default'): React.CSSProperties | null {
  const config = SPRITE_CONFIGS[type]
  if (!config || config.pattern === 'solid') return null
  
  const accent = config.accentColor || config.color
  
  switch (config.pattern) {
    case 'grid':
      return {
        backgroundImage: `
          linear-gradient(${accent}20 1px, transparent 1px),
          linear-gradient(90deg, ${accent}20 1px, transparent 1px)
        `,
        backgroundSize: '8px 8px',
      }
    case 'striped':
      return {
        backgroundImage: `repeating-linear-gradient(
          0deg,
          ${accent}40,
          ${accent}40 2px,
          transparent 2px,
          transparent 8px
        )`,
      }
    case 'circuit':
      return {
        backgroundImage: `
          linear-gradient(45deg, ${accent}30 25%, transparent 25%),
          linear-gradient(-45deg, ${accent}30 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${accent}30 75%),
          linear-gradient(-45deg, transparent 75%, ${accent}30 75%)
        `,
        backgroundSize: '4px 4px',
      }
    default:
      return null
  }
}

/**
 * Get player sprite with direction indicator
 */
export function getPlayerSpriteStyles(direction: Direction, isMoving: boolean): React.CSSProperties {
  const base = getSpriteStyles('player', 'default', direction, isMoving)
  
  // Add directional indicator
  return {
    ...base,
    position: 'relative' as const,
  }
}

/**
 * Get NPC sprite styles
 */
export function getNPCSpriteStyles(isMoving: boolean): React.CSSProperties {
  return getSpriteStyles('npc', 'default', 'down', isMoving)
}

/**
 * Get object sprite styles based on type and state
 */
export function getObjectSpriteStyles(
  type: string,
  visualState: VisualState = 'default',
  width: number = 1,
  height: number = 1,
  isHovered: boolean = false
): React.CSSProperties {
  const spriteType = type as SpriteType
  const styles = getSpriteStyles(spriteType, visualState)
  
  // Adjust dimensions
  styles.width = width * CELL_SIZE
  styles.height = height * CELL_SIZE
  
  // Add hover effect
  if (isHovered) {
    styles.filter = 'brightness(1.2)'
    styles.transform = 'scale(1.02)'
    styles.zIndex = 10
  }
  
  return styles
}

/**
 * Get indicator/arrow styles for showing direction
 */
export function getDirectionIndicatorStyles(direction: Direction): React.CSSProperties {
  const indicatorSize = 6
  
  const positions: Record<Direction, React.CSSProperties> = {
    up: { top: -indicatorSize, left: '50%', transform: 'translateX(-50%)' },
    down: { bottom: -indicatorSize, left: '50%', transform: 'translateX(-50%) rotate(180deg)' },
    left: { left: -indicatorSize, top: '50%', transform: 'translateY(-50%) rotate(-90deg)' },
    right: { right: -indicatorSize, top: '50%', transform: 'translateY(-50%) rotate(90deg)' },
  }
  
  return {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: `${indicatorSize}px solid transparent`,
    borderRight: `${indicatorSize}px solid transparent`,
    borderBottom: `${indicatorSize * 1.5}px solid #00ffff`,
    ...positions[direction],
  }
}

/**
 * Get floor tile styles
 */
export function getFloorTileStyles(x: number, y: number): React.CSSProperties {
  // Subtle variation based on position
  const isEvenTile = (x + y) % 2 === 0
  
  return {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: isEvenTile ? '#0f172a' : '#0c1222',
    borderRight: '1px solid #1e293b20',
    borderBottom: '1px solid #1e293b20',
  }
}
