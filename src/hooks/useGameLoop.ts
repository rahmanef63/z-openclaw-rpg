'use client';

import { useEffect, useRef, useCallback } from 'react';
import { FRAME_DURATION } from '@/features/engine/constants';

export type GameLoopCallback = (deltaTime: number, timestamp: number) => void;

/**
 * Custom hook for 60fps game loop using requestAnimationFrame
 * Prevents React re-renders by using refs internally
 */
export function useGameLoop(callback: GameLoopCallback, isRunning: boolean = true) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);
  const callbackRef = useRef<GameLoopCallback>(callback);
  const isRunningRef = useRef(isRunning);
  
  // Keep refs updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!isRunningRef.current) return;
      
      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - previousTimeRef.current;
      previousTimeRef.current = timestamp;
      
      // Accumulate time for fixed timestep
      accumulatorRef.current += deltaTime;
      
      // Run at fixed timestep
      while (accumulatorRef.current >= FRAME_DURATION) {
        callbackRef.current(FRAME_DURATION, timestamp);
        accumulatorRef.current -= FRAME_DURATION;
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    if (isRunning) {
      previousTimeRef.current = null;
      accumulatorRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isRunning]);
  
  const pause = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);
  
  const resume = useCallback(() => {
    if (requestRef.current === null && isRunningRef.current) {
      previousTimeRef.current = null;
      accumulatorRef.current = 0;
      requestRef.current = requestAnimationFrame((timestamp) => {
        // Re-trigger the effect by using isRunning
      });
    }
  }, []);
  
  return { pause, resume };
}

/**
 * Hook for tracking elapsed time
 */
export function useElapsedTime(isRunning: boolean = true) {
  const elapsedTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = null;
      return;
    }
    
    const tick = () => {
      const now = performance.now();
      if (lastTimeRef.current !== null) {
        elapsedTimeRef.current += now - lastTimeRef.current;
      }
      lastTimeRef.current = now;
    };
    
    const intervalId = setInterval(tick, 16);
    return () => clearInterval(intervalId);
  }, [isRunning]);
  
  return elapsedTimeRef;
}

/**
 * Hook for FPS counter (debug)
 */
export function useFPSCounter() {
  const fpsRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastSecondRef = useRef<number>(performance.now());
  
  useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      
      if (now - lastSecondRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastSecondRef.current = now;
      }
    };
    
    const intervalId = setInterval(updateFPS, 16);
    return () => clearInterval(intervalId);
  }, []);
  
  return fpsRef;
}
