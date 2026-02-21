// Type definitions for Super Space RPG

export type Direction = 'up' | 'down' | 'left' | 'right';
export type PlayerState = 'idle' | 'walking' | 'running' | 'interacting';
export type VisualState = 'healthy' | 'warning' | 'critical';
export type ObjectType = 'floor' | 'wall' | 'furniture' | 'npc' | 'interactive';

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  gridX: number;
  gridY: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Player {
  position: Position;
  gridPosition: GridPosition;
  velocity: Velocity;
  direction: Direction;
  state: PlayerState;
  isMoving: boolean;
  movementProgress: number;
  targetPosition: Position | null;
}

export interface WorldObject {
  id: string;
  type: ObjectType;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  canCollide: boolean;
  interactionType?: string;
  visualState: VisualState;
  linkedMetric?: string;
  label?: string;
}

export interface Scene {
  id: string;
  name: string;
  width: number;
  height: number;
  objects: WorldObject[];
  spawnPoint: GridPosition;
}

export interface NPC {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  targetGridX: number | null;
  targetGridY: number | null;
  isMoving: boolean;
  message?: string;
  state: 'idle' | 'walking' | 'alerting';
}

export interface BusinessMetric {
  id: string;
  metricName: string;
  value: number;
  status: VisualState;
  timestamp: number;
}

export interface GameWindow {
  id: string;
  title: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  data?: Record<string, unknown>;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
}

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}
