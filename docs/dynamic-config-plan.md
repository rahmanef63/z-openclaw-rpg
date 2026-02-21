# Dynamic JSON-Based Configuration Plan

## Overview
Transform Super Space RPG into a fully dynamic, JSON-configurable game engine where all visual themes, game settings, furniture, NPCs, and UI elements can be customized through JSON files.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CONFIG LAYER (JSON)                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│  theme.json     │  game.json      │  furniture.json         │
│  - colors       │  - grid size    │  - furniture catalog    │
│  - fonts        │  - tile size    │  - interactions         │
│  - styles       │  - player speed │  - effects              │
│  - animations   │  - camera       │                         │
├─────────────────┴─────────────────┴─────────────────────────┤
│                    CONTEXT LAYER                             │
├─────────────────┬─────────────────┬─────────────────────────┤
│ ThemeContext    │ GameConfigCtx   │ FurnitureContext        │
│ - loadTheme()   │ - loadConfig()  │ - loadCatalog()         │
│ - getVar()      │ - getSetting()  │ - getFurniture()        │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Dynamic styled  │ Dynamic game    │ Dynamic furniture       │
│ UI components   │ canvas/mechanics│ placement               │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

## Phase 1: Theme Configuration System

### 1.1 Theme Schema (theme.json)

```typescript
interface ThemeConfig {
  // Meta
  name: string;
  version: string;
  author: string;
  
  // Typography
  fonts: {
    primary: string;      // Main pixel font
    secondary: string;    // Alternative font
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  
  // Color Palette
  colors: {
    // Base colors
    background: string;
    foreground: string;
    
    // UI colors
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    
    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Pixel art specific
    pixel: {
      gold: string;
      goldLight: string;
      goldDark: string;
      grass: string;
      blood: string;
      sky: string;
      magic: string;
      wood: string;
      stone: string;
      
      // 3D border colors
      borderLight: string;
      borderDark: string;
      highlight: string;
      shadow: string;
    };
    
    // Aspect colors (10 life aspects)
    aspects: {
      personal: string;
      career: string;
      finance: string;
      physical: string;
      mental: string;
      social: string;
      spiritual: string;
      intellectual: string;
      recreation: string;
      environment: string;
    };
    
    // Rarity colors
    rarity: {
      common: string;
      uncommon: string;
      rare: string;
      epic: string;
      legendary: string;
    };
  };
  
  // Border styles
  borders: {
    width: number;
    radius: number;       // 0 for pixel art
    style: 'solid' | 'pixel';
    bevel: boolean;       // 3D bevel effect
  };
  
  // Shadows
  shadows: {
    pixel: string;
    glow: string;
    soft: string;
  };
  
  // Animations
  animations: {
    bounce: { duration: number; timing: string };
    shake: { duration: number; timing: string };
    pulse: { duration: number; timing: string };
    blink: { duration: number };
  };
  
  // Effects
  effects: {
    scanlines: boolean;
    crt: boolean;
    pixelPerfect: boolean;
  };
}
```

### 1.2 Implementation Files

```
/src/config/
├── schemas/
│   └── theme.schema.ts       # TypeScript interfaces
├── defaults/
│   └── theme-pixel-art.json  # Default pixel art theme
├── contexts/
│   └── ThemeContext.tsx      # Theme provider
└── hooks/
    └── useTheme.ts           # Theme hook
```

---

## Phase 2: Game Configuration System

### 2.1 Game Config Schema (game.json)

```typescript
interface GameConfig {
  // Meta
  name: string;
  version: string;
  
  // Grid settings
  grid: {
    width: number;           // Grid columns
    height: number;          // Grid rows
    tileSize: number;        // Pixels per tile
    showGrid: boolean;       // Show grid lines
    gridColor: string;       // Grid line color
  };
  
  // Camera
  camera: {
    followPlayer: boolean;
    smoothing: number;       // 0-1
    zoom: {
      min: number;
      max: number;
      default: number;
    };
  };
  
  // Player
  player: {
    startGridX: number;
    startGridY: number;
    walkSpeed: number;       // Tiles per second
    runSpeed: number;        // Tiles per second
    animationSpeed: number;  // FPS for player animation
  };
  
  // NPCs
  npcs: {
    defaultSpeed: number;
    wanderEnabled: boolean;
    wanderInterval: number;  // Milliseconds
  };
  
  // Time
  time: {
    syncWithRealTime: boolean;
    dayDuration: number;     // Real seconds per game day
    phases: {
      morning: { start: number; end: number };
      afternoon: { start: number; end: number };
      evening: { start: number; end: number };
      night: { start: number; end: number };
    };
  };
  
  // UI
  ui: {
    showMinimap: boolean;
    showFPS: boolean;
    showControls: boolean;
    minimapScale: number;
  };
  
  // Audio
  audio: {
    enabled: boolean;
    musicVolume: number;     // 0-1
    sfxVolume: number;       // 0-1
  };
  
  // Build mode
  buildMode: {
    defaultRotation: number;
    snapToGrid: boolean;
    showPreview: boolean;
  };
}
```

### 2.2 Implementation Files

```
/src/config/
├── schemas/
│   └── game.schema.ts       # TypeScript interfaces
├── defaults/
│   └── game-default.json    # Default game config
├── contexts/
│   └── GameConfigContext.tsx # Game config provider
└── hooks/
    └── useGameConfig.ts     # Game config hook
```

---

## Phase 3: Furniture Catalog Configuration

### 3.1 Furniture Schema (furniture.json)

```typescript
interface FurnitureCatalogConfig {
  version: string;
  
  categories: {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    color: string;
  }[];
  
  furniture: {
    id: string;
    name: string;
    nameEn: string;
    category: string;
    width: number;
    height: number;
    icon: string;
    description: string;
    
    // Visual
    sprite?: string;         // Image path or base64
    animation?: {
      frames: string[];      // Frame paths
      fps: number;
      loop: boolean;
      pingPong: boolean;
    };
    
    // Interactions
    interactions: {
      id: string;
      name: string;
      type: string;
      duration: number;
      cooldown: number;
      energyCost: number;
      pointsReward: number;
      effects: {
        type: string;
        target: string;
        value: number;
      }[];
    }[];
    
    // Binding
    defaultBinding?: {
      moduleType: string;
      dataPath?: string;
      thresholds?: {
        warning: number;
        critical: number;
        positive: number;
      };
      alertsEnabled: boolean;
    };
    
    // Requirements
    requirements?: {
      level?: number;
      unlocked?: string[];   // Prerequisite IDs
    };
    
    // Economy
    cost: number;
    sellValue: number;
    rarity: string;
    isPremium: boolean;
    isUnlocked: boolean;
    
    // Tags
    tags: string[];
  }[];
}
```

---

## Phase 4: Complete Configuration System

### 4.1 NPCs Configuration (npcs.json)

```typescript
interface NPCConfig {
  npcs: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
    
    // Position
    gridX: number;
    gridY: number;
    
    // Personality
    personality: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    
    // Dialogue
    dialogues: {
      trigger: string;
      message: string;
    }[];
    
    // Schedule
    schedule?: {
      startTime: string;
      endTime: string;
      activity: string;
      targetGridX?: number;
      targetGridY?: number;
    }[];
    
    // Abilities
    abilities: {
      id: string;
      name: string;
      description: string;
      cooldown: number;
    }[];
  }[];
}
```

### 4.2 UI Layout Configuration (ui.json)

```typescript
interface UIConfig {
  layout: {
    panels: {
      id: string;
      position: 'left' | 'right' | 'top' | 'bottom';
      width: number | string;
      collapsible: boolean;
      defaultOpen: boolean;
      mobile: {
        hidden: boolean;
        width: number | string;
      };
    }[];
    
    hud: {
      showTopBar: boolean;
      showLeftPanel: boolean;
      showRightPanel: boolean;
      showMinimap: boolean;
      showQuickActions: boolean;
    };
    
    components: {
      // Component-specific configs
      buildMode: {
        showHelp: boolean;
        showRotation: boolean;
        defaultCategory: string;
      };
      
      questPanel: {
        maxVisible: number;
        showRewards: boolean;
      };
      
      lifeAspects: {
        displayStyle: 'bars' | 'icons' | 'radar';
        showTrend: boolean;
        showActivities: boolean;
      };
    };
  };
}
```

---

## Implementation Strategy

### Step 1: Create Configuration Infrastructure
1. Create `/src/config/` directory structure
2. Define TypeScript interfaces for all schemas
3. Create default JSON configuration files
4. Create configuration loading utilities

### Step 2: Create Context Providers
1. `ThemeContext` - Theme loading and CSS variable injection
2. `GameConfigContext` - Game settings access
3. `FurnitureContext` - Furniture catalog access
4. `NPCContext` - NPC configuration access
5. `UIContext` - UI layout configuration

### Step 3: Update Components (Incremental)
1. Update CSS to use CSS variables from ThemeContext
2. Update game engine to use GameConfigContext
3. Update furniture system to use FurnitureContext
4. Update UI components to use UIContext

### Step 4: Create Configuration Editor (Future)
1. Theme editor UI
2. Game settings UI
3. Furniture catalog editor
4. Export/Import functionality

---

## File Structure

```
/src/
├── config/
│   ├── index.ts                 # Export all configs
│   ├── schemas/
│   │   ├── theme.schema.ts
│   │   ├── game.schema.ts
│   │   ├── furniture.schema.ts
│   │   ├── npc.schema.ts
│   │   └── ui.schema.ts
│   ├── defaults/
│   │   ├── theme-pixel-art.json
│   │   ├── game-default.json
│   │   ├── furniture-catalog.json
│   │   ├── npcs-default.json
│   │   └── ui-default.json
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   ├── GameConfigContext.tsx
│   │   ├── FurnitureContext.tsx
│   │   ├── NPCContext.tsx
│   │   └── UIContext.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useGameConfig.ts
│   │   ├── useFurniture.ts
│   │   └── useUIConfig.ts
│   └── utils/
│       ├── loadConfig.ts
│       ├── validateConfig.ts
│       └── mergeConfig.ts
```

---

## Benefits of This Architecture

1. **Full Customization**: Every aspect of the game can be customized via JSON
2. **Hot Reloading**: Change configs without rebuilding
3. **Modding Support**: Easy mod creation by replacing JSON files
4. **Theme Packs**: Multiple themes can be distributed
5. **Localization Ready**: All strings in JSON, easy to translate
6. **Prerender Compatible**: Static generation with dynamic content
7. **Type Safety**: TypeScript schemas ensure correct configuration
8. **Validation**: Runtime validation of configuration files
9. **Extensibility**: Easy to add new configuration options

---

## Migration Path (From Current Code)

### Phase 1: Theme System (Week 1)
1. Create ThemeContext and schema
2. Move all hardcoded colors to theme.json
3. Update globals.css to use CSS variables
4. Update components to use useTheme hook

### Phase 2: Game Config (Week 1-2)
1. Create GameConfigContext and schema
2. Move all hardcoded game settings to game.json
3. Update game engine to use config
4. Update canvas and grid system

### Phase 3: Content Config (Week 2-3)
1. Create FurnitureContext and schema
2. Move furniture catalog to JSON
3. Create NPCContext and schema
4. Move NPC configs to JSON

### Phase 4: UI Config (Week 3-4)
1. Create UIContext and schema
2. Make all UI panels configurable
3. Add responsive configuration

### Phase 5: Polish & Testing (Week 4)
1. Validate all configurations
2. Add error handling
3. Create configuration editor (basic)
4. Documentation
