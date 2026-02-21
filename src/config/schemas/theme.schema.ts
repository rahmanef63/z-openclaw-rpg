// ==========================================
// THEME CONFIGURATION SCHEMA
// ==========================================

export interface ThemeFonts {
  primary: string;
  secondary: string;
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
}

export interface ThemePixelColors {
  gold: string;
  goldLight: string;
  goldDark: string;
  grass: string;
  grassLight: string;
  grassDark: string;
  blood: string;
  bloodLight: string;
  sky: string;
  skyLight: string;
  skyDark: string;
  magic: string;
  magicLight: string;
  wood: string;
  stone: string;
  borderLight: string;
  borderDark: string;
  highlight: string;
  shadow: string;
}

export interface ThemeColors {
  // Base
  background: string;
  foreground: string;
  
  // UI
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  
  // Semantic
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
  
  // Cards & Panels
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Borders & Inputs
  border: string;
  input: string;
  ring: string;
  
  // Pixel art specific
  pixel: ThemePixelColors;
  
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
    commonBg: string;
    uncommon: string;
    uncommonBg: string;
    rare: string;
    rareBg: string;
    epic: string;
    epicBg: string;
    legendary: string;
    legendaryBg: string;
  };
}

export interface ThemeBorders {
  width: number;
  radius: number;
  style: 'solid' | 'pixel' | 'dashed' | 'none';
  bevel: boolean;
  bevelWidth: number;
}

export interface ThemeShadows {
  none: string;
  pixel: string;
  glow: string;
  soft: string;
  hard: string;
}

export interface ThemeAnimation {
  duration: number;
  timing: string;
  delay?: number;
}

export interface ThemeAnimations {
  bounce: ThemeAnimation;
  shake: ThemeAnimation;
  pulse: ThemeAnimation;
  blink: ThemeAnimation;
  float: ThemeAnimation;
  appear: ThemeAnimation;
  spin: ThemeAnimation;
}

export interface ThemeEffects {
  scanlines: boolean;
  scanlineOpacity: number;
  crt: boolean;
  crtOpacity: number;
  pixelPerfect: boolean;
  glowEffects: boolean;
}

export interface ThemeComponents {
  // Button styles
  button: {
    padding: string;
    fontSize: string;
    fontFamily: string;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    letterSpacing: string;
  };
  
  // Panel styles
  panel: {
    padding: string;
    headerPadding: string;
    headerBackground: string;
  };
  
  // Input styles
  input: {
    padding: string;
    fontSize: string;
  };
  
  // Progress bar
  progressBar: {
    height: number;
    borderRadius: number;
  };
  
  // Minimap
  minimap: {
    scale: number;
    playerSize: number;
    npcSize: number;
  };
}

export interface ThemeConfig {
  // Meta
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  
  // Configuration sections
  fonts: ThemeFonts;
  colors: ThemeColors;
  borders: ThemeBorders;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
  effects: ThemeEffects;
  components: ThemeComponents;
}

// ==========================================
// THEME PRESETS
// ==========================================

export type ThemePresetId = 'pixel-art' | 'cyberpunk' | 'fantasy' | 'minimal';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  config: Partial<ThemeConfig>;
}

// ==========================================
// CSS VARIABLE MAPPING
// ==========================================

export interface CSSVariableMapping {
  cssVar: string;
  configPath: string;
}

export const CSS_VAR_MAPPINGS: CSSVariableMapping[] = [
  { cssVar: '--background', configPath: 'colors.background' },
  { cssVar: '--foreground', configPath: 'colors.foreground' },
  { cssVar: '--primary', configPath: 'colors.primary' },
  { cssVar: '--primary-foreground', configPath: 'colors.primaryForeground' },
  { cssVar: '--secondary', configPath: 'colors.secondary' },
  { cssVar: '--secondary-foreground', configPath: 'colors.secondaryForeground' },
  { cssVar: '--accent', configPath: 'colors.accent' },
  { cssVar: '--accent-foreground', configPath: 'colors.accentForeground' },
  { cssVar: '--muted', configPath: 'colors.muted' },
  { cssVar: '--muted-foreground', configPath: 'colors.mutedForeground' },
  { cssVar: '--success', configPath: 'colors.success' },
  { cssVar: '--warning', configPath: 'colors.warning' },
  { cssVar: '--error', configPath: 'colors.error' },
  { cssVar: '--info', configPath: 'colors.info' },
  { cssVar: '--card', configPath: 'colors.card' },
  { cssVar: '--card-foreground', configPath: 'colors.cardForeground' },
  { cssVar: '--popover', configPath: 'colors.popover' },
  { cssVar: '--popover-foreground', configPath: 'colors.popoverForeground' },
  { cssVar: '--border', configPath: 'colors.border' },
  { cssVar: '--input', configPath: 'colors.input' },
  { cssVar: '--ring', configPath: 'colors.ring' },
  // Pixel colors
  { cssVar: '--pixel-gold', configPath: 'colors.pixel.gold' },
  { cssVar: '--pixel-gold-light', configPath: 'colors.pixel.goldLight' },
  { cssVar: '--pixel-gold-dark', configPath: 'colors.pixel.goldDark' },
  { cssVar: '--pixel-grass', configPath: 'colors.pixel.grass' },
  { cssVar: '--pixel-grass-light', configPath: 'colors.pixel.grassLight' },
  { cssVar: '--pixel-grass-dark', configPath: 'colors.pixel.grassDark' },
  { cssVar: '--pixel-blood', configPath: 'colors.pixel.blood' },
  { cssVar: '--pixel-blood-light', configPath: 'colors.pixel.bloodLight' },
  { cssVar: '--pixel-sky', configPath: 'colors.pixel.sky' },
  { cssVar: '--pixel-sky-light', configPath: 'colors.pixel.skyLight' },
  { cssVar: '--pixel-sky-dark', configPath: 'colors.pixel.skyDark' },
  { cssVar: '--pixel-magic', configPath: 'colors.pixel.magic' },
  { cssVar: '--pixel-magic-light', configPath: 'colors.pixel.magicLight' },
  { cssVar: '--pixel-wood', configPath: 'colors.pixel.wood' },
  { cssVar: '--pixel-stone', configPath: 'colors.pixel.stone' },
  { cssVar: '--pixel-border-light', configPath: 'colors.pixel.borderLight' },
  { cssVar: '--pixel-border-dark', configPath: 'colors.pixel.borderDark' },
  { cssVar: '--pixel-highlight', configPath: 'colors.pixel.highlight' },
  { cssVar: '--pixel-shadow', configPath: 'colors.pixel.shadow' },
  // Aspect colors
  { cssVar: '--aspect-personal', configPath: 'colors.aspects.personal' },
  { cssVar: '--aspect-career', configPath: 'colors.aspects.career' },
  { cssVar: '--aspect-finance', configPath: 'colors.aspects.finance' },
  { cssVar: '--aspect-physical', configPath: 'colors.aspects.physical' },
  { cssVar: '--aspect-mental', configPath: 'colors.aspects.mental' },
  { cssVar: '--aspect-social', configPath: 'colors.aspects.social' },
  { cssVar: '--aspect-spiritual', configPath: 'colors.aspects.spiritual' },
  { cssVar: '--aspect-intellectual', configPath: 'colors.aspects.intellectual' },
  { cssVar: '--aspect-recreation', configPath: 'colors.aspects.recreation' },
  { cssVar: '--aspect-environment', configPath: 'colors.aspects.environment' },
  // Rarity colors
  { cssVar: '--rarity-common', configPath: 'colors.rarity.common' },
  { cssVar: '--rarity-common-bg', configPath: 'colors.rarity.commonBg' },
  { cssVar: '--rarity-uncommon', configPath: 'colors.rarity.uncommon' },
  { cssVar: '--rarity-uncommon-bg', configPath: 'colors.rarity.uncommonBg' },
  { cssVar: '--rarity-rare', configPath: 'colors.rarity.rare' },
  { cssVar: '--rarity-rare-bg', configPath: 'colors.rarity.rareBg' },
  { cssVar: '--rarity-epic', configPath: 'colors.rarity.epic' },
  { cssVar: '--rarity-epic-bg', configPath: 'colors.rarity.epicBg' },
  { cssVar: '--rarity-legendary', configPath: 'colors.rarity.legendary' },
  { cssVar: '--rarity-legendary-bg', configPath: 'colors.rarity.legendaryBg' },
  // Border
  { cssVar: '--radius', configPath: 'borders.radius' },
  // Fonts
  { cssVar: '--font-primary', configPath: 'fonts.primary' },
  { cssVar: '--font-secondary', configPath: 'fonts.secondary' },
];
