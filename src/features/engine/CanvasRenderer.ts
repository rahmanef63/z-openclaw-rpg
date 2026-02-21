// Canvas-based renderer for Super Space RPG
// Replaces DOM-based rendering for better performance

import { TILE_SIZE, COLORS, MAP_WIDTH, MAP_HEIGHT } from './constants';
import type { Position, GridPosition, Direction, WorldObject, VisualState } from './types';

export interface RenderConfig {
  showGrid: boolean;
  isBuildMode: boolean;
}

export interface PlayerRenderState {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  isRunning: boolean;
}

export interface FurnitureRenderData {
  id: string;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  color: string;
  icon: string;
  label: string;
  isSelected: boolean;
  visualState: 'default' | 'warning' | 'critical' | 'positive';
}

export interface NPCRenderData {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  message?: string;
}

/**
 * CanvasRenderer handles all game rendering using HTML Canvas
 * This replaces the DOM-based approach for significant performance gains
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 0;
  private height: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private config: RenderConfig = {
    showGrid: false,
    isBuildMode: false,
  };
  
  // Cached floor pattern
  private floorPattern: CanvasPattern | null = null;
  
  // Sprite cache
  private spriteCache: Map<string, HTMLImageElement> = new Map();
  
  // Animation frame tracking
  private animationFrame: number = 0;
  private lastFrameTime: number = 0;

  /**
   * Initialize the renderer with a canvas element
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: false, // Better performance when no transparency needed for background
    });
    
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
    }
    
    this.createFloorPattern();
  }

  /**
   * Update canvas dimensions
   */
  resize(width: number, height: number): void {
    if (!this.canvas) return;
    
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Recreate floor pattern for new size
    this.createFloorPattern();
  }

  /**
   * Update camera position
   */
  setCamera(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
  }

  /**
   * Update render configuration
   */
  setConfig(config: Partial<RenderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create a cached floor pattern
   */
  private createFloorPattern(): void {
    if (!this.ctx) return;
    
    // Create a small pattern canvas
    const patternCanvas = document.createElement('canvas');
    const patternSize = TILE_SIZE * 2;
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    
    const patternCtx = patternCanvas.getContext('2d');
    if (!patternCtx) return;
    
    // Draw checkerboard pattern
    patternCtx.fillStyle = this.config.isBuildMode ? '#1a2744' : COLORS.floor;
    patternCtx.fillRect(0, 0, patternSize, patternSize);
    
    patternCtx.fillStyle = this.config.isBuildMode ? '#152238' : COLORS.floorAlt;
    patternCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    patternCtx.fillRect(TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_SIZE);
    
    this.floorPattern = this.ctx.createPattern(patternCanvas, 'repeat');
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    if (!this.ctx) return;
    
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Render the floor layer
   */
  renderFloor(): void {
    if (!this.ctx || !this.floorPattern) return;
    
    // Calculate visible area
    const startX = Math.floor(this.cameraX / TILE_SIZE);
    const startY = Math.floor(this.cameraY / TILE_SIZE);
    const endX = Math.ceil((this.cameraX + this.width) / TILE_SIZE);
    const endY = Math.ceil((this.cameraY + this.height) / TILE_SIZE);
    
    // Draw floor pattern with camera offset
    this.ctx.save();
    this.ctx.translate(-this.cameraX % (TILE_SIZE * 2), -this.cameraY % (TILE_SIZE * 2));
    this.ctx.fillStyle = this.floorPattern;
    this.ctx.fillRect(
      this.cameraX - (this.cameraX % (TILE_SIZE * 2)),
      this.cameraY - (this.cameraY % (TILE_SIZE * 2)),
      this.width + TILE_SIZE * 2,
      this.height + TILE_SIZE * 2
    );
    this.ctx.restore();
  }

  /**
   * Render grid lines (build mode only)
   */
  renderGrid(): void {
    if (!this.ctx || !this.config.showGrid) return;
    
    this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    this.ctx.lineWidth = 1;
    
    // Calculate visible grid range
    const startX = Math.floor(this.cameraX / TILE_SIZE);
    const startY = Math.floor(this.cameraY / TILE_SIZE);
    const endX = Math.ceil((this.cameraX + this.width) / TILE_SIZE);
    const endY = Math.ceil((this.cameraY + this.height) / TILE_SIZE);
    
    // Vertical lines
    for (let x = startX; x <= endX; x++) {
      const screenX = x * TILE_SIZE - this.cameraX;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, 0);
      this.ctx.lineTo(screenX, this.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y++) {
      const screenY = y * TILE_SIZE - this.cameraY;
      this.ctx.beginPath();
      this.ctx.moveTo(0, screenY);
      this.ctx.lineTo(this.width, screenY);
      this.ctx.stroke();
    }
  }

  /**
   * Render a world object
   */
  renderObject(obj: WorldObject, visualState: VisualState): void {
    if (!this.ctx) return;
    
    const screenX = obj.gridX * TILE_SIZE - this.cameraX;
    const screenY = obj.gridY * TILE_SIZE - this.cameraY;
    const width = obj.width * TILE_SIZE;
    const height = obj.height * TILE_SIZE;
    
    // Skip if off-screen
    if (screenX + width < 0 || screenX > this.width ||
        screenY + height < 0 || screenY > this.height) {
      return;
    }
    
    // Get color based on type and state
    let color: string;
    let glowColor: string | null = null;
    
    switch (obj.type) {
      case 'wall':
        color = COLORS.wall;
        break;
      case 'furniture':
        color = '#475569';
        break;
      case 'interactive':
        switch (visualState) {
          case 'warning':
            color = COLORS.warning;
            glowColor = 'rgba(234, 179, 8, 0.5)';
            break;
          case 'critical':
            color = COLORS.critical;
            glowColor = 'rgba(239, 68, 68, 0.7)';
            break;
          default:
            color = COLORS.healthy;
            glowColor = 'rgba(34, 197, 94, 0.3)';
        }
        break;
      default:
        return; // Don't render floor type
    }
    
    // Draw glow for interactive objects
    if (glowColor) {
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 15;
    }
    
    // Draw object
    this.ctx.fillStyle = color;
    this.ctx.fillRect(screenX, screenY, width, height);
    
    // Draw border for interactive objects
    if (obj.interactionType) {
      this.ctx.strokeStyle = glowColor || 'transparent';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenX, screenY, width, height);
    }
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    
    // Draw label
    if (obj.label) {
      this.ctx.font = '10px monospace';
      this.ctx.fillStyle = COLORS.textMuted;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(obj.label, screenX + width / 2, screenY + height + 12);
    }
  }

  /**
   * Render placed furniture
   */
  renderFurniture(furniture: FurnitureRenderData): void {
    if (!this.ctx) return;
    
    const screenX = furniture.gridX * TILE_SIZE - this.cameraX;
    const screenY = furniture.gridY * TILE_SIZE - this.cameraY;
    const width = furniture.width * TILE_SIZE;
    const height = furniture.height * TILE_SIZE;
    
    // Skip if off-screen
    if (screenX + width < 0 || screenX > this.width ||
        screenY + height < 0 || screenY > this.height) {
      return;
    }
    
    // Get state color
    let stateColor = furniture.color;
    switch (furniture.visualState) {
      case 'warning':
        stateColor = COLORS.warning;
        break;
      case 'critical':
        stateColor = COLORS.critical;
        break;
      case 'positive':
        stateColor = COLORS.healthy;
        break;
    }
    
    // Draw background
    this.ctx.fillStyle = stateColor + '40'; // 25% opacity
    this.ctx.fillRect(screenX, screenY, width, height);
    
    // Draw border
    this.ctx.strokeStyle = furniture.isSelected ? COLORS.accent : stateColor;
    this.ctx.lineWidth = furniture.isSelected ? 3 : 2;
    this.ctx.strokeRect(screenX, screenY, width, height);
    
    // Draw selection glow
    if (furniture.isSelected) {
      this.ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
      this.ctx.shadowBlur = 15;
      this.ctx.strokeRect(screenX, screenY, width, height);
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
    }
    
    // Draw icon
    const fontSize = Math.min(width, height) * 0.4;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(furniture.icon, screenX + width / 2, screenY + height / 2);
    
    // Draw label
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = furniture.isSelected ? COLORS.accent : COLORS.textMuted;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(furniture.label, screenX + width / 2, screenY + height + 2);
  }

  /**
   * Render furniture preview (build mode)
   */
  renderFurniturePreview(
    gridX: number,
    gridY: number,
    width: number,
    height: number,
    color: string,
    icon: string,
    isValid: boolean
  ): void {
    if (!this.ctx) return;
    
    const screenX = gridX * TILE_SIZE - this.cameraX;
    const screenY = gridY * TILE_SIZE - this.cameraY;
    const w = width * TILE_SIZE;
    const h = height * TILE_SIZE;
    
    // Pulsing animation
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    
    // Draw background
    this.ctx.fillStyle = isValid 
      ? `rgba(0, 255, 255, ${0.3 * pulse})` 
      : 'rgba(239, 68, 68, 0.3)';
    this.ctx.fillRect(screenX, screenY, w, h);
    
    // Draw border
    this.ctx.strokeStyle = isValid ? color : '#ef4444';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(screenX, screenY, w, h);
    this.ctx.setLineDash([]);
    
    // Draw icon
    const fontSize = Math.min(w, h) * 0.4;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(icon, screenX + w / 2, screenY + h / 2);
  }

  /**
   * Render the player
   */
  renderPlayer(player: PlayerRenderState): void {
    if (!this.ctx) return;
    
    const screenX = player.x - this.cameraX;
    const screenY = player.y - this.cameraY;
    
    // Skip if off-screen
    if (screenX + TILE_SIZE < 0 || screenX > this.width ||
        screenY + TILE_SIZE < 0 || screenY > this.height) {
      return;
    }
    
    // Draw player glow
    const glowRadius = player.isRunning ? 15 : 10;
    const gradient = this.ctx.createRadialGradient(
      screenX + TILE_SIZE / 2,
      screenY + TILE_SIZE / 2,
      0,
      screenX + TILE_SIZE / 2,
      screenY + TILE_SIZE / 2,
      TILE_SIZE
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      screenX - glowRadius,
      screenY - glowRadius,
      TILE_SIZE + glowRadius * 2,
      TILE_SIZE + glowRadius * 2
    );
    
    // Draw player body
    this.ctx.fillStyle = COLORS.player;
    this.ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    
    // Draw direction indicator
    this.ctx.fillStyle = '#ffffff';
    const indicatorSize = 6;
    switch (player.direction) {
      case 'up':
        this.ctx.fillRect(screenX + TILE_SIZE / 2 - indicatorSize / 2, screenY + 2, indicatorSize, indicatorSize);
        break;
      case 'down':
        this.ctx.fillRect(screenX + TILE_SIZE / 2 - indicatorSize / 2, screenY + TILE_SIZE - 8, indicatorSize, indicatorSize);
        break;
      case 'left':
        this.ctx.fillRect(screenX + 2, screenY + TILE_SIZE / 2 - indicatorSize / 2, indicatorSize, indicatorSize);
        break;
      case 'right':
        this.ctx.fillRect(screenX + TILE_SIZE - 8, screenY + TILE_SIZE / 2 - indicatorSize / 2, indicatorSize, indicatorSize);
        break;
    }
    
    // Running indicator
    if (player.isRunning) {
      this.ctx.font = '12px monospace';
      this.ctx.fillStyle = COLORS.accent;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('⚡', screenX + TILE_SIZE / 2, screenY + TILE_SIZE + 8);
    }
  }

  /**
   * Render an NPC
   */
  renderNPC(npc: NPCRenderData): void {
    if (!this.ctx) return;
    
    const screenX = npc.gridX * TILE_SIZE - this.cameraX;
    const screenY = npc.gridY * TILE_SIZE - this.cameraY;
    
    // Skip if off-screen
    if (screenX + TILE_SIZE < 0 || screenX > this.width ||
        screenY + TILE_SIZE < 0 || screenY > this.height) {
      return;
    }
    
    // Draw NPC glow
    const gradient = this.ctx.createRadialGradient(
      screenX + TILE_SIZE / 2,
      screenY + TILE_SIZE / 2,
      0,
      screenX + TILE_SIZE / 2,
      screenY + TILE_SIZE / 2,
      TILE_SIZE
    );
    gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(screenX - 10, screenY - 10, TILE_SIZE + 20, TILE_SIZE + 20);
    
    // Draw NPC body
    this.ctx.fillStyle = COLORS.npc;
    this.ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    
    // Draw name
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = COLORS.npc;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(npc.name, screenX + TILE_SIZE / 2, screenY + TILE_SIZE + 12);
    
    // Draw message bubble
    if (npc.message) {
      const bubbleWidth = Math.min(npc.message.length * 7 + 16, 150);
      const bubbleHeight = 24;
      const bubbleX = screenX + TILE_SIZE / 2 - bubbleWidth / 2;
      const bubbleY = screenY - 30;
      
      // Draw bubble
      this.ctx.fillStyle = COLORS.glass;
      this.ctx.strokeStyle = COLORS.npc;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw text
      this.ctx.font = '12px sans-serif';
      this.ctx.fillStyle = COLORS.text;
      this.ctx.fillText(npc.message, screenX + TILE_SIZE / 2, bubbleY + 16);
    }
  }

  /**
   * Load and cache a sprite image
   */
  async loadSprite(key: string, src: string): Promise<HTMLImageElement | null> {
    if (this.spriteCache.has(key)) {
      return this.spriteCache.get(key)!;
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.spriteCache.set(key, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /**
   * Render a cached sprite
   */
  renderSprite(key: string, x: number, y: number, width?: number, height?: number): void {
    if (!this.ctx) return;
    
    const sprite = this.spriteCache.get(key);
    if (!sprite) return;
    
    const screenX = x - this.cameraX;
    const screenY = y - this.cameraY;
    
    this.ctx.drawImage(
      sprite,
      screenX,
      screenY,
      width || sprite.width,
      height || sprite.height
    );
  }

  /**
   * Dispose the renderer
   */
  dispose(): void {
    this.spriteCache.clear();
    this.floorPattern = null;
    this.ctx = null;
    this.canvas = null;
  }
}

// Singleton instance
let rendererInstance: CanvasRenderer | null = null;

export function getRenderer(): CanvasRenderer {
  if (!rendererInstance) {
    rendererInstance = new CanvasRenderer();
  }
  return rendererInstance;
}

export function disposeRenderer(): void {
  if (rendererInstance) {
    rendererInstance.dispose();
    rendererInstance = null;
  }
}
