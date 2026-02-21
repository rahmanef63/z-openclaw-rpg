# Components Guide

## Component Structure

```
src/components/
├── game/                    # Game-specific components
│   ├── BuildModePanel.tsx   # Build mode UI
│   └── LifeAspectsHUD.tsx   # Life aspects display
│
└── ui/                      # Reusable UI components
    └── ErrorBoundary.tsx    # Error handling wrapper
```

---

## Game Components

### BuildModePanel

The build mode interface for placing and managing furniture.

**Location:** `src/components/game/BuildModePanel.tsx`

**Props:** None (uses global state)

**Features:**
- Furniture catalog grouped by category
- Rotation controls
- Selected item preview
- Clear all confirmation

**Usage:**
```tsx
import BuildModePanel from '@/components/game/BuildModePanel';

function Game() {
  return (
    <>
      <GameCanvas />
      <BuildModePanel />
    </>
  );
}
```

**State Dependencies:**
- `useBuildStore` - Build mode state
- `getGroupedFurniture` - Furniture catalog
- `ASPECT_NAMES` - Category display names

---

### LifeAspectsHUD

Displays the 10 Life Aspects with progress bars and recent activities.

**Location:** `src/components/game/LifeAspectsHUD.tsx`

**Props:** None (uses global state)

**Features:**
- Top bar with overall score, points, streak
- Left sidebar with 10 aspect progress bars
- Recent activities list
- Stat badges (Energy, Focus, Mood)

**Usage:**
```tsx
import LifeAspectsHUD from '@/components/game/LifeAspectsHUD';

function Game() {
  return (
    <>
      <GameCanvas />
      <LifeAspectsHUD />
    </>
  );
}
```

**State Dependencies:**
- `useLifeStore` - Life aspects and activities
- `useBuildStore` - Build mode toggle
- `useHydration` - SSR/CSR handling

---

## UI Components

### ErrorBoundary

Catches JavaScript errors in child components and displays a fallback UI.

**Location:** `src/components/ui/ErrorBoundary.tsx`

**Props:**
```typescript
interface Props {
  children: ReactNode;
  fallback?: ReactNode;        // Custom fallback UI
  componentName?: string;      // For error logging
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary componentName="App" fallback={<ErrorPage />}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

**Higher-Order Component:**
```tsx
import { withErrorBoundary } from '@/components/ui/ErrorBoundary';

const SafeComponent = withErrorBoundary(
  RiskyComponent,
  'RiskyComponent',
  <FallbackUI />
);
```

---

## Feature Components

Located in `src/features/`, these are domain-specific components.

### GameCanvas

Main game renderer with player, NPCs, and furniture.

**Location:** `src/features/world/GameCanvas.tsx`

**Features:**
- 60fps rendering loop
- Player sprite with animations
- NPC rendering with pathfinding
- Furniture rendering with states
- Click-to-move navigation

### HUD

Original heads-up display with minimap and controls.

**Location:** `src/features/world/HUD.tsx`

### NPCCreator

Modal for creating and managing AI agents.

**Location:** `src/features/world/NPCCreator.tsx`

### WindowManager

Manages draggable windows in the game.

**Location:** `src/features/world/WindowManager.tsx`

---

## Provider Components

### HydrationProvider

Handles SSR/CSR hydration to prevent mismatches.

**Location:** `src/providers/HydrationProvider.tsx`

**Usage:**
```tsx
import { HydrationProvider, useHydration } from '@/providers';

function App() {
  return (
    <HydrationProvider timeout={5000}>
      <Game />
    </HydrationProvider>
  );
}

function Game() {
  const { isReady } = useHydration();
  if (!isReady) return <LoadingScreen />;
  return <GameContent />;
}
```

### AppProviders

Combines all providers into a single wrapper.

**Location:** `src/providers/index.tsx`

**Usage:**
```tsx
import { AppProviders } from '@/providers';

export default function App() {
  return (
    <AppProviders>
      <GameContent />
    </AppProviders>
  );
}
```

---

## Component Patterns

### 1. Error Boundary Wrapper

All major components should be wrapped with ErrorBoundary:

```tsx
export default function MyComponent() {
  return (
    <ErrorBoundary componentName="MyComponent">
      <MyComponentContent />
    </ErrorBoundary>
  );
}
```

### 2. Hydration Check

Components using persisted state should check hydration:

```tsx
function MyComponent() {
  const { isReady } = useHydration();
  
  if (!isReady) {
    return <LoadingState />;
  }
  
  return <Content />;
}
```

### 3. State Selector Pattern

Use selectors for optimal re-renders:

```tsx
// Good - only re-renders when energy changes
const energy = useLifeStore(state => state.energy);

// Avoid - re-renders on any store change
const { energy, focus, mood } = useLifeStore();
```

---

## Creating New Components

1. **Create file** in appropriate folder
2. **Add 'use client'** directive for client components
3. **Wrap with ErrorBoundary** for error handling
4. **Use providers** for hydration and state
5. **Export from index** if needed

**Template:**
```tsx
'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useHydration } from '@/providers';

interface Props {
  // Props
}

function MyComponentContent({ }: Props) {
  const { isReady } = useHydration();
  
  if (!isReady) return null;
  
  return (
    <div>
      {/* Content */}
    </div>
  );
}

export default function MyComponent(props: Props) {
  return (
    <ErrorBoundary componentName="MyComponent">
      <MyComponentContent {...props} />
    </ErrorBoundary>
  );
}
```
