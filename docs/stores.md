# State Management - Stores

Super Space RPG uses **Zustand** for state management with localStorage persistence.

## Store Overview

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `lifeStore` | 10 Life Aspects, achievements, activities | ✅ LocalStorage |
| `buildStore` | Furniture placement, build mode | ✅ LocalStorage |
| `gameStore` | Player position, NPCs, windows | ❌ Session only |

---

## Life Store (`lifeStore.ts`)

Manages the 10 Life Aspects system, achievements, and activity tracking.

### State

```typescript
interface LifeState {
  // 10 Aspect Metrics
  metricsData: Array<[LifeAspect, LifeMetric]>;
  
  // Overall stats
  energy: number;      // 0-100
  focus: number;       // 0-100
  mood: number;        // 0-100
  
  // Activity tracking
  activityLog: ActivityLog[];
  totalPoints: number;
  dailyStreak: number;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: string[];
  
  // Room presets
  presets: RoomPreset[];
  
  // Environment
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
}
```

### Key Actions

```typescript
// Update aspect score
updateAspect(aspect: LifeAspect, delta: number): void

// Record activity and earn points
recordActivity(
  aspect: LifeAspect, 
  action: string, 
  points: number, 
  furnitureId?: string
): void

// Save room preset
savePreset(
  name: string, 
  nameEn: string, 
  description: string, 
  objects: RoomPreset['objects']
): void

// Check and unlock achievements
checkAchievements(): void
```

### Usage Example

```typescript
import { useLifeStore } from '@/stores';

function MyComponent() {
  const { metricsData, updateAspect, recordActivity } = useLifeStore();
  
  const handleExercise = () => {
    recordActivity('physical', 'Completed morning workout', 10);
    updateAspect('physical', 5);
  };
  
  return <button onClick={handleExercise}>Exercise</button>;
}
```

---

## Build Store (`buildStore.ts`)

Manages furniture placement, build mode, and room configuration.

### State

```typescript
interface BuildState {
  // Mode
  isBuildMode: boolean;
  
  // Selection
  selectedAssetId: string | null;
  selectedPlacedId: string | null;
  
  // Furniture
  placedFurniture: PlacedFurniture[];
  rotation: 0 | 90 | 180 | 270;
  
  // Grid
  gridWidth: number;   // 20
  gridHeight: number;  // 20
  
  // Preview
  showPreview: boolean;
  validPlacement: boolean;
}
```

### Key Actions

```typescript
// Toggle build mode
toggleBuildMode(): void

// Place furniture on grid
placeFurniture(asset: {
  assetId: string;
  gridX: number;
  gridY: number;
  aspectCategory: LifeAspect;
  name: string;
  width: number;
  height: number;
}): boolean

// Rotate furniture
rotateClockwise(): void

// Check if cell is occupied
isCellOccupied(gridX: number, gridY: number, excludeId?: string): boolean
```

### Usage Example

```typescript
import { useBuildStore, getFurnitureById } from '@/stores';

function FurnitureItem({ id }: { id: string }) {
  const { selectAsset, selectedAssetId, placeFurniture } = useBuildStore();
  const furniture = getFurnitureById(id);
  
  return (
    <div 
      onClick={() => selectAsset(id)}
      style={{ 
        border: selectedAssetId === id ? '2px solid cyan' : 'none' 
      }}
    >
      {furniture?.name}
    </div>
  );
}
```

---

## Game Store (`gameStore.ts`)

Manages player state, NPCs, windows, and business metrics.

### State

```typescript
interface GameState {
  // Player
  playerGridPos: GridPosition;
  playerDirection: 'up' | 'down' | 'left' | 'right';
  playerState: 'idle' | 'walking' | 'running' | 'interacting';
  
  // Click-to-move
  moveTarget: GridPosition | null;
  currentPath: PathNode[];
  
  // NPCs
  npcs: NPC[];
  
  // Windows
  windows: GameWindow[];
  activeWindowId: string | null;
  
  // Business metrics
  metrics: BusinessMetric[];
  
  // UI
  isPaused: boolean;
  showMinimap: boolean;
  showNPCCreator: boolean;
}
```

### Key Actions

```typescript
// Player movement
setPlayerPosition(pos: GridPosition): void
setMoveTarget(target: GridPosition | null): void

// NPC management
addNPC(npc: Omit<NPC, 'id'>): void
setNPCMessage(npcId: string, message: string): void

// Window management
openWindow(window: Omit<GameWindow, 'id' | 'zIndex'>): void
closeWindow(id: string): void
focusWindow(id: string): void

// Metrics
updateMetric(name: string, value: number, status: VisualState): void
```

---

## Persistence Strategy

Data is automatically persisted to localStorage using Zustand's persist middleware:

```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'superspace-life',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      // Only persist these fields
      metricsData: state.metricsData,
      energy: state.energy,
      // ...
    }),
  }
)
```

### Storage Keys

| Key | Store | Description |
|-----|-------|-------------|
| `superspace-life` | lifeStore | Life aspects, achievements, presets |
| `superspace-furniture` | buildStore | Placed furniture, build mode |

---

## Hydration Handling

The app handles SSR/CSR hydration to prevent mismatches:

```typescript
// In HydrationProvider
useEffect(() => {
  const frame = requestAnimationFrame(() => {
    setIsHydrated(true);
  });
  return () => cancelAnimationFrame(frame);
}, []);

// In components
const { isReady } = useHydration();
if (!isReady) return <LoadingScreen />;
```

---

## Best Practices

1. **Use Selectors** - Only subscribe to needed state
   ```typescript
   // Good
   const energy = useLifeStore(state => state.energy);
   
   // Avoid
   const state = useLifeStore();
   ```

2. **Batch Updates** - Multiple updates in sequence
   ```typescript
   // Zustand automatically batches
   updateAspect('physical', 5);
   updateEnergy(10);
   ```

3. **Access Outside Components**
   ```typescript
   // Use getState() for non-React code
   useLifeStore.getState().recordActivity('career', 'Task', 5);
   ```
