'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HydrationContextValue {
  isHydrated: boolean;
  isMounted: boolean;
  isReady: boolean;
  forceReady: () => void;
}

const HydrationContext = createContext<HydrationContextValue | null>(null);

interface HydrationProviderProps {
  children: ReactNode;
  timeout?: number;
}

export function HydrationProvider({ 
  children, 
  timeout = 5000 
}: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check hydration
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        // Test localStorage availability
        const testKey = '__hydration_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        setIsHydrated(true);
      } catch {
        // localStorage not available (SSR)
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Track mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isHydrated || !isMounted) {
        setIsHydrated(true);
        setIsMounted(true);
      }
    }, timeout);
    return () => clearTimeout(timer);
  }, [timeout, isHydrated, isMounted]);

  const forceReady = () => {
    setIsHydrated(true);
    setIsMounted(true);
  };

  const isReady = isHydrated && isMounted;

  return (
    <HydrationContext.Provider value={{ isHydrated, isMounted, isReady, forceReady }}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration(): HydrationContextValue {
  const context = useContext(HydrationContext);
  if (!context) {
    throw new Error('useHydration must be used within a HydrationProvider');
  }
  return context;
}

export function HydrationSafe({ 
  children, 
  fallback 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isReady } = useHydration();
  if (!isReady) {
    return fallback ? <>{fallback}</> : null;
  }
  return <>{children}</>;
}

export function HydrationLoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-cyan-400 font-mono text-sm">Initializing Super Space...</p>
      </div>
    </div>
  );
}
