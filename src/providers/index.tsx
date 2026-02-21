'use client';

import React, { ReactNode } from 'react';
import { HydrationProvider, useHydration, HydrationLoadingScreen } from './HydrationProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

function AppErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 p-6">
      <div className="text-6xl mb-4">💥</div>
      <h1 className="text-2xl font-bold text-red-400 mb-2">Super Space crashed!</h1>
      <p className="text-slate-300 mb-4">An unexpected error occurred</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-cyan-500 text-white rounded font-mono"
      >
        Reload Page
      </button>
    </div>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary componentName="AppProviders" fallback={<AppErrorFallback />}>
      <HydrationProvider timeout={5000}>
        {children}
      </HydrationProvider>
    </ErrorBoundary>
  );
}

export { useHydration, HydrationLoadingScreen } from './HydrationProvider';
export { ErrorBoundary } from '@/components/ui/ErrorBoundary';
