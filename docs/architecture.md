# Super Space RPG - Architecture Overview

## System Architecture

Super Space RPG is built with a modular, layered architecture designed for scalability and maintainability.

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Game Page  │  │    HUDs     │  │   Modals    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                        COMPONENT LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ GameCanvas  │  │BuildPanel   │  │LifeAspects  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                         FEATURE LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Engine    │  │    World    │  │   Agents    │              │
│  │ - collision │  │ - rendering │  │ - AI chat   │              │
│  │ - movement  │  │ - sprites   │  │ - pathfind  │              │
│  │ - grid      │  │ - particles │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                          STATE LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ lifeStore   │  │ buildStore  │  │ gameStore   │              │
│  │ - 10 aspects│  │ - furniture │  │ - player    │              │
│  │ - points    │  │ - placement │  │ - npcs      │              │
│  │ - achievements│  │ - rotation │  │ - windows   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                          DATA LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Furniture   │  │   Maps      │  │ LocalStorage│              │
│  │ Catalog     │  │   Config    │  │ Persistence │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Client-Side Rendering
- Game canvas uses dynamic imports with `ssr: false`
- Hydration providers handle SSR/CSR consistency
- State persisted to localStorage via Zustand

### 2. State Management Pattern
```typescript
// Zustand with persist middleware
export const useLifeStore = create<LifeState>()(
  persist(
    (set, get) => ({
      // State and actions
    }),
    {
      name: 'superspace-life',
      partialize: (state) => ({ /* persisted fields */ }),
    }
  )
);
```

### 3. Component Composition
- Features are organized by domain (engine, world, agents)
- UI components are reusable and decoupled
- Game logic separated from rendering

### 4. Grid-Based World
- 20x20 grid for the condo
- Cell size: 48x48 pixels
- Objects placed on grid coordinates
- Collision detection per cell

## Data Flow

```
User Input → GameCanvas → gameStore → Render
                    ↓
              lifeStore → HUD Update
                    ↓
              buildStore → Build Panel
```

## Key Modules

### Engine Module (`/features/engine`)
- **collision.ts** - Grid-based collision detection
- **movement.ts** - Player movement handling
- **grid.ts** - Grid coordinate utilities
- **constants.ts** - Game constants

### World Module (`/features/world`)
- **GameCanvas.tsx** - Main game renderer
- **HUD.tsx** - Heads-up display
- **NPCCreator.tsx** - NPC management
- **sprites.ts** - Sprite rendering

### Stores (`/stores`)
- **lifeStore.ts** - 10 Life Aspects system
- **buildStore.ts** - Build mode and furniture
- **gameStore.ts** - Game state and windows

## Performance Considerations

1. **Canvas Rendering** - RequestAnimationFrame for smooth 60fps
2. **State Updates** - Batched updates via Zustand
3. **Asset Loading** - Dynamic imports for code splitting
4. **Memoization** - React.memo for expensive components

## Future Architecture Goals

- WebSocket for real-time multiplayer
- Server-side state sync
- Plugin system for custom furniture
- Mobile touch controls
