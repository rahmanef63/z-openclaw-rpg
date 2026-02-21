// ==========================================
// CONFIG INDEX
// ==========================================

// Schemas
export * from './schemas/theme.schema';
export * from './schemas/game.schema';

// Contexts
export { ThemeProvider, useTheme, useThemeColor, usePixelColor, useAspectColor, useRarityColor } from './contexts/ThemeContext';
export { GameConfigProvider, useGameConfig, useGridConfig, usePlayerConfig, useCameraConfig, useUIConfig, useBuildModeConfig, useInteractionConfig } from './contexts/GameConfigContext';

// Default configs
import defaultTheme from './defaults/theme-pixel-art.json';
import defaultGameConfig from './defaults/game-default.json';

export { defaultTheme, defaultGameConfig };

// Types
export type { ThemeConfig } from './schemas/theme.schema';
export type { GameConfig, GameState } from './schemas/game.schema';
