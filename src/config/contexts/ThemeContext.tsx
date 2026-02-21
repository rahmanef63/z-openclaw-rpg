'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ThemeConfig } from '../schemas/theme.schema';
import { CSS_VAR_MAPPINGS } from '../schemas/theme.schema';
import defaultTheme from '../defaults/theme-pixel-art.json';

// ==========================================
// THEME CONTEXT
// ==========================================

interface ThemeContextValue {
  // Current theme
  theme: ThemeConfig;
  themeId: string;
  
  // Theme actions
  loadTheme: (themeConfig: ThemeConfig) => void;
  resetTheme: () => void;
  
  // Theme value getters
  getColor: (path: string) => string;
  getValue: (path: string) => string | number | boolean | undefined;
  getCSSVar: (varName: string) => string;
  
  // Available themes
  availableThemes: { id: string; name: string }[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return result;
}

function setCSSVariable(name: string, value: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(name, value);
  }
}

function removeCSSVariable(name: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.removeProperty(name);
  }
}

function applyThemeToCSS(theme: ThemeConfig): void {
  // Apply all CSS variable mappings
  CSS_VAR_MAPPINGS.forEach(({ cssVar, configPath }) => {
    const value = getNestedValue(theme as unknown as Record<string, unknown>, configPath);
    if (value !== undefined) {
      setCSSVariable(cssVar, String(value));
    }
  });
  
  // Apply font families
  setCSSVariable('--font-primary', theme.fonts.primary);
  setCSSVariable('--font-secondary', theme.fonts.secondary);
  
  // Apply font sizes
  Object.entries(theme.fonts.sizes).forEach(([size, value]) => {
    setCSSVariable(`--font-size-${size}`, value);
  });
  
  // Apply border styles
  setCSSVariable('--border-width', `${theme.borders.width}px`);
  setCSSVariable('--radius', `${theme.borders.radius}px`);
  
  // Apply shadows
  Object.entries(theme.shadows).forEach(([name, value]) => {
    setCSSVariable(`--shadow-${name}`, value);
  });
  
  // Apply component defaults
  setCSSVariable('--btn-padding', theme.components.button.padding);
  setCSSVariable('--btn-font-size', theme.components.button.fontSize);
  setCSSVariable('--btn-letter-spacing', theme.components.button.letterSpacing);
  setCSSVariable('--panel-padding', theme.components.panel.padding);
  setCSSVariable('--progress-height', `${theme.components.progressBar.height}px`);
}

// ==========================================
// THEME PROVIDER
// ==========================================

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeConfig;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  initialTheme,
  storageKey = 'super-space-rpg-theme'
}: ThemeProviderProps) {
  // Initialize with default or stored theme
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    if (initialTheme) return initialTheme;
    
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.colors) {
            return parsed as ThemeConfig;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    return defaultTheme as ThemeConfig;
  });
  
  const themeId = theme.id;
  
  // Apply theme to CSS on mount and when theme changes
  useEffect(() => {
    applyThemeToCSS(theme);
    
    // Apply pixel perfect rendering if enabled
    if (theme.effects.pixelPerfect && typeof document !== 'undefined') {
      document.documentElement.style.imageRendering = 'pixelated';
      document.documentElement.style.imageRendering = 'crisp-edges';
    }
    
    // Store theme in localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(theme));
    } catch {
      // Ignore storage errors
    }
  }, [theme, storageKey]);
  
  // Load a new theme
  const loadTheme = useCallback((themeConfig: ThemeConfig) => {
    setTheme(themeConfig);
  }, []);
  
  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(defaultTheme as ThemeConfig);
  }, []);
  
  // Get a color value by path
  const getColor = useCallback((path: string): string => {
    const value = getNestedValue(theme.colors as unknown as Record<string, unknown>, path);
    return typeof value === 'string' ? value : '';
  }, [theme]);
  
  // Get any value by path
  const getValue = useCallback((path: string): string | number | boolean | undefined => {
    const value = getNestedValue(theme as unknown as Record<string, unknown>, path);
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    return undefined;
  }, [theme]);
  
  // Get a CSS variable value
  const getCSSVar = useCallback((varName: string): string => {
    if (typeof document !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
    return '';
  }, []);
  
  // Available themes list
  const availableThemes = useMemo(() => [
    { id: 'pixel-art', name: 'Pixel Art RPG' },
    // Add more themes here as they're created
  ], []);
  
  const value: ThemeContextValue = {
    theme,
    themeId,
    loadTheme,
    resetTheme,
    getColor,
    getValue,
    getCSSVar,
    availableThemes,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// USE THEME HOOK
// ==========================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ==========================================
// CONVENIENCE HOOKS
// ==========================================

export function useThemeColor(path: string): string {
  const { getColor } = useTheme();
  return getColor(path);
}

export function usePixelColor(colorName: string): string {
  const { getColor } = useTheme();
  return getColor(`pixel.${colorName}`);
}

export function useAspectColor(aspect: string): string {
  const { getColor } = useTheme();
  return getColor(`aspects.${aspect}`);
}

export function useRarityColor(rarity: string): { color: string; bg: string } {
  const { getColor } = useTheme();
  return {
    color: getColor(`rarity.${rarity}`),
    bg: getColor(`rarity.${rarity}Bg`),
  };
}

export { ThemeContext };
