'use client';

import React, { ReactNode } from 'react';
import { HydrationProvider, useHydration, HydrationLoadingScreen } from './HydrationProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ThemeProvider, GameConfigProvider } from '@/config';

interface AppProvidersProps {
  children: ReactNode;
}

function AppErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 pixel-font" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-6xl mb-4">💥</div>
      <h1 className="text-lg font-bold mb-2 pixel-text-shadow" style={{ color: 'var(--pixel-blood)' }}>
        GAME CRASHED!
      </h1>
      <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        An unexpected error occurred
      </p>
      <button
        onClick={() => window.location.reload()}
        className="pixel-btn primary"
      >
        RELOAD
      </button>
    </div>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary componentName="AppProviders" fallback={<AppErrorFallback />}>
      <ThemeProvider>
        <GameConfigProvider>
          <HydrationProvider timeout={5000}>
            {children}
          </HydrationProvider>
        </GameConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export { useHydration, HydrationLoadingScreen } from './HydrationProvider';
export { ErrorBoundary } from '@/components/ui/ErrorBoundary';
