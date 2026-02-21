# API Reference

## Hooks

### useHydration

Access hydration state for SSR/CSR handling.

```typescript
import { useHydration } from '@/providers';

function MyComponent() {
  const { 
    isHydrated,   // boolean - localStorage available
    isMounted,    // boolean - component mounted
    isReady,      // boolean - both hydrated and mounted
    forceReady    // () => void - force ready state
  } = useHydration();
  
  if (!isReady) return <Loading />;
  return <Content />;
}
```

---

### useLifeStore

Manage 10 Life Aspects state.

```typescript
import { useLifeStore } from '@/stores';

// Get specific values (recommended)
const energy = useLifeStore(state => state.energy);
const metricsData = useLifeStore(state => state.metricsData);

// Actions
const updateAspect = useLifeStore(state => state.updateAspect);
const recordActivity = useLifeStore(state => state.recordActivity);

// Usage
recordActivity('physical', 'Morning workout', 10);
updateAspect('physical', 5);
```

---

### useBuildStore

Manage build mode and furniture placement.

```typescript
import { useBuildStore } from '@/stores';

// Get specific values
const isBuildMode = useBuildStore(state => state.isBuildMode);
const placedFurniture = useBuildStore(state => state.placedFurniture);

// Actions
const toggleBuildMode = useBuildStore(state => state.toggleBuildMode);
const placeFurniture = useBuildStore(state => state.placeFurniture);

// Usage
toggleBuildMode(); // Toggle build mode
placeFurniture({
  assetId: 'desk',
  gridX: 5,
  gridY: 5,
  aspectCategory: 'career',
  name: 'Meja Kerja',
  width: 3,
  height: 2,
}); // Returns boolean (success/failure)
```

---

### useGameStore

Manage player, NPCs, and windows.

```typescript
import { useGameStore } from '@/stores';

// Player state
const playerGridPos = useGameStore(state => state.playerGridPos);
const playerDirection = useGameStore(state => state.playerDirection);

// NPCs
const npcs = useGameStore(state => state.npcs);
const addNPC = useGameStore(state => state.addNPC);

// Windows
const windows = useGameStore(state => state.windows);
const openWindow = useGameStore(state => state.openWindow);

// Usage
addNPC({
  name: 'Helper Bot',
  gridX: 10,
  gridY: 10,
  role: 'assistant',
});

openWindow({
  title: 'Settings',
  type: 'settings',
  x: 100,
  y: 100,
  width: 400,
  height: 300,
});
```

---

## Utility Functions

### Furniture Catalog

```typescript
import { 
  getFurnitureById, 
  getFurnitureByCategory,
  getGroupedFurniture,
  FURNITURE_CATALOG 
} from '@/stores';

// Get single furniture
const desk = getFurnitureById('main-desk');
// { id: 'main-desk', name: 'Meja Kerja Utama', width: 3, height: 2, ... }

// Get by category
const careerFurniture = getFurnitureByCategory('career');
// Array of furniture items

// Get grouped
const grouped = getGroupedFurniture();
// { personal: [...], career: [...], ... }

// Access full catalog
console.log(FURNITURE_CATALOG);
```

---

### Aspect Utilities

```typescript
import { ASPECT_NAMES, type LifeAspect } from '@/stores';

// Get aspect info
const careerInfo = ASPECT_NAMES.career;
// { name: 'Karir & Bisnis', nameEn: 'Career & Business', icon: 'Briefcase', color: '#3b82f6' }

// Type usage
const aspect: LifeAspect = 'physical';
```

---

## Types

### LifeAspect

```typescript
type LifeAspect = 
  | 'personal'      // Pengembangan Pribadi
  | 'career'        // Karir & Bisnis
  | 'finance'       // Keuangan
  | 'physical'      // Kesehatan Fisik
  | 'mental'        // Kesehatan Mental
  | 'social'        // Sosial & Hubungan
  | 'spiritual'     // Spiritual
  | 'intellectual'  // Intelektual
  | 'recreation'    // Rekreasi
  | 'environment';  // Lingkungan
```

### LifeMetric

```typescript
interface LifeMetric {
  aspect: LifeAspect;
  score: number;          // 0-100
  lastActivity: number | null;
  streak: number;
  tasksCompleted: number;
  trend: 'up' | 'down' | 'stable';
  weeklyProgress: number[];
}
```

### PlacedFurniture

```typescript
interface PlacedFurniture {
  id: string;
  assetId: string;
  gridX: number;
  gridY: number;
  rotation: 0 | 90 | 180 | 270;
  aspectCategory: LifeAspect;
  binding?: FurnitureBinding;
  visualState: 'default' | 'warning' | 'critical' | 'positive';
  name: string;
  nameEn: string;
  width: number;
  height: number;
  interactable: boolean;
}
```

### NPC

```typescript
interface NPC {
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
```

### ActivityLog

```typescript
interface ActivityLog {
  id: string;
  timestamp: number;
  aspect: LifeAspect;
  action: string;
  points: number;
  furnitureId?: string;
  category: string;
}
```

---

## External Store Access

For non-React code (event handlers, timers, etc.):

```typescript
import { useLifeStore, useBuildStore, useGameStore } from '@/stores';

// Get current state
const lifeState = useLifeStore.getState();
const buildState = useBuildStore.getState();
const gameState = useGameStore.getState();

// Call actions
useLifeStore.getState().recordActivity('career', 'Task completed', 5);
useBuildStore.getState().toggleBuildMode();
useGameStore.getState().setPlayerPosition({ gridX: 10, gridY: 10 });

// Subscribe to changes
const unsubscribe = useLifeStore.subscribe((state, prevState) => {
  if (state.energy !== prevState.energy) {
    console.log('Energy changed:', state.energy);
  }
});

// Later: unsubscribe();
```

---

## Constants

```typescript
// Grid
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 48; // pixels

// Game
const PLAYER_SPEED = 4;
const NPC_SPEED = 2;

// Colors
const ASPECT_COLORS: Record<LifeAspect, string> = {
  personal: '#a78bfa',
  career: '#3b82f6',
  // ...
};
```
