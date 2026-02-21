import type { Scene, WorldObject } from '@/features/engine/types';

// Personal Workspace Scene - 20x20 grid
export const workspaceScene: Scene = {
  id: 'workspace',
  name: 'Personal Workspace',
  width: 20,
  height: 20,
  spawnPoint: { gridX: 10, gridY: 15 },
  objects: [
    // Walls (perimeter)
    // Top wall
    ...Array.from({ length: 20 }, (_, i): WorldObject => ({
      id: `wall-top-${i}`,
      type: 'wall',
      gridX: i,
      gridY: 0,
      width: 1,
      height: 1,
      canCollide: true,
      visualState: 'healthy',
    })),
    // Bottom wall
    ...Array.from({ length: 20 }, (_, i): WorldObject => ({
      id: `wall-bottom-${i}`,
      type: 'wall',
      gridX: i,
      gridY: 19,
      width: 1,
      height: 1,
      canCollide: true,
      visualState: 'healthy',
    })),
    // Left wall
    ...Array.from({ length: 18 }, (_, i): WorldObject => ({
      id: `wall-left-${i}`,
      type: 'wall',
      gridX: 0,
      gridY: i + 1,
      width: 1,
      height: 1,
      canCollide: true,
      visualState: 'healthy',
    })),
    // Right wall
    ...Array.from({ length: 18 }, (_, i): WorldObject => ({
      id: `wall-right-${i}`,
      type: 'wall',
      gridX: 19,
      gridY: i + 1,
      width: 1,
      height: 1,
      canCollide: true,
      visualState: 'healthy',
    })),
    
    // Player Desk (interactive)
    {
      id: 'player-desk',
      type: 'furniture',
      gridX: 9,
      gridY: 12,
      width: 2,
      height: 1,
      canCollide: true,
      interactionType: 'window:tasks',
      visualState: 'healthy',
      label: 'Work Desk',
    },
    
    // Desk Chair
    {
      id: 'player-chair',
      type: 'furniture',
      gridX: 9,
      gridY: 13,
      width: 1,
      height: 1,
      canCollide: false,
      visualState: 'healthy',
    },
    
    // Server Rack (data-driven)
    {
      id: 'server-rack',
      type: 'interactive',
      gridX: 2,
      gridY: 2,
      width: 1,
      height: 2,
      canCollide: true,
      interactionType: 'window:server-status',
      visualState: 'healthy',
      linkedMetric: 'server_health',
      label: 'Server Rack',
    },
    
    // Office Plants (visual state based on tasks)
    {
      id: 'plant-1',
      type: 'furniture',
      gridX: 16,
      gridY: 2,
      width: 1,
      height: 1,
      canCollide: true,
      interactionType: 'window:analytics',
      visualState: 'healthy',
      linkedMetric: 'tasks_completed',
      label: 'Office Plant',
    },
    {
      id: 'plant-2',
      type: 'furniture',
      gridX: 17,
      gridY: 2,
      width: 1,
      height: 1,
      canCollide: true,
      visualState: 'healthy',
      linkedMetric: 'tasks_completed',
      label: 'Office Plant',
    },
    
    // Bookshelf
    {
      id: 'bookshelf',
      type: 'furniture',
      gridX: 16,
      gridY: 5,
      width: 2,
      height: 1,
      canCollide: true,
      visualState: 'healthy',
      label: 'Knowledge Base',
    },
    
    // Coffee Machine
    {
      id: 'coffee-machine',
      type: 'interactive',
      gridX: 2,
      gridY: 10,
      width: 1,
      height: 1,
      canCollide: true,
      interactionType: 'window:break-timer',
      visualState: 'healthy',
      label: 'Coffee Station',
    },
    
    // Meeting Table
    {
      id: 'meeting-table',
      type: 'furniture',
      gridX: 8,
      gridY: 4,
      width: 4,
      height: 2,
      canCollide: true,
      interactionType: 'window:meetings',
      visualState: 'healthy',
      label: 'Meeting Table',
    },
    
    // Chairs around meeting table
    {
      id: 'meeting-chair-1',
      type: 'furniture',
      gridX: 9,
      gridY: 6,
      width: 1,
      height: 1,
      canCollide: false,
      visualState: 'healthy',
    },
    {
      id: 'meeting-chair-2',
      type: 'furniture',
      gridX: 9,
      gridY: 3,
      width: 1,
      height: 1,
      canCollide: false,
      visualState: 'healthy',
    },
    
    // Terminal/Computer Station
    {
      id: 'terminal',
      type: 'interactive',
      gridX: 15,
      gridY: 15,
      width: 2,
      height: 1,
      canCollide: true,
      interactionType: 'window:terminal',
      visualState: 'healthy',
      label: 'Terminal',
    },
    
    // Storage Cabinet
    {
      id: 'cabinet',
      type: 'furniture',
      gridX: 2,
      gridY: 15,
      width: 2,
      height: 1,
      canCollide: true,
      visualState: 'healthy',
      label: 'Archive',
    },
    
    // Decorative Elements
    {
      id: 'rug-main',
      type: 'floor',
      gridX: 7,
      gridY: 10,
      width: 6,
      height: 4,
      canCollide: false,
      visualState: 'healthy',
    },
  ],
};

// Generate collision map from scene
export function generateCollisionMap(scene: Scene): Set<string> {
  const collisionMap = new Set<string>();
  
  for (const obj of scene.objects) {
    if (obj.canCollide) {
      for (let x = 0; x < obj.width; x++) {
        for (let y = 0; y < obj.height; y++) {
          collisionMap.add(`${obj.gridX + x},${obj.gridY + y}`);
        }
      }
    }
  }
  
  return collisionMap;
}

// Get object at grid position
export function getObjectAtPosition(
  scene: Scene,
  gridX: number,
  gridY: number
): WorldObject | undefined {
  return scene.objects.find(obj =>
    gridX >= obj.gridX &&
    gridX < obj.gridX + obj.width &&
    gridY >= obj.gridY &&
    gridY < obj.gridY + obj.height
  );
}
