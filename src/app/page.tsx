'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { AppProviders, useHydration, HydrationLoadingScreen } from '@/providers';
import LifeAspectsHUD from '@/components/game/LifeAspectsHUD';
import BuildModePanel from '@/components/game/BuildModePanel';
import QuestPanel from '@/components/game/QuestPanel';
import TouchControls from '@/components/game/TouchControls';
import AssetManager from '@/components/game/AssetManager';
import HUD from '@/features/world/HUD';
import WindowManager from '@/features/world/WindowManager';
import NPCCreator from '@/features/world/NPCCreator';
import { useBusinessSimulation } from '@/features/business/useBusinessSimulation';
import { useBuildStore, useLifeStore, useQuestStore, useAssetLibrary } from '@/stores';
import { Package, Volume2, VolumeX, Gamepad2, Settings } from 'lucide-react';

// Dynamic import for game canvas - Using optimized Canvas renderer
const GameCanvas = dynamic(() => import('@/features/world/CanvasGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center pixel-font">
        {/* Pixel art loading spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div 
            className="absolute inset-0 pixel-border"
            style={{ 
              background: 'var(--card)',
              animation: 'pixel-bounce 0.5s ease-in-out infinite alternate'
            }}
          />
          <div 
            className="absolute inset-2 pixel-border-inset"
            style={{ background: 'var(--pixel-gold)' }}
          />
        </div>
        <p className="text-sm" style={{ color: 'var(--pixel-gold)' }}>
          Loading...
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
          Press START
        </p>
      </div>
    </div>
  ),
});

// Game content component
function GameContent() {
  const { isReady } = useHydration();
  const { isBuildMode, selectedPlacedId, removeFurniture, selectedAssetId, selectAsset } = useBuildStore();
  const { setTimeOfDay } = useLifeStore();
  const { resetDailyQuests } = useQuestStore();
  
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Business simulation
  useBusinessSimulation();

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768 || 'ontouchstart' in window;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Sync time with real world
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      let time: 'morning' | 'afternoon' | 'evening' | 'night';
      
      if (hour >= 5 && hour < 12) time = 'morning';
      else if (hour >= 12 && hour < 17) time = 'afternoon';
      else if (hour >= 17 && hour < 21) time = 'evening';
      else time = 'night';
      
      setTimeOfDay(time);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [setTimeOfDay]);

  // Reset daily quests on app load
  useEffect(() => {
    resetDailyQuests();
  }, [resetDailyQuests]);

  // Keyboard shortcuts
  useEffect(() => {
    const isInputElement = () => {
      const activeElement = document.activeElement;
      return activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input field (except for Escape)
      if (e.key !== 'Escape' && isInputElement()) {
        return;
      }

      // Toggle build mode with 'B'
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        useBuildStore.getState().toggleBuildMode();
      }

      // Rotate with 'R'
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        useBuildStore.getState().rotateClockwise();
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        useBuildStore.getState().selectAsset(null);
        useBuildStore.getState().selectPlaced(null);
        setShowAssetManager(false);
      }
      
      // Delete/Backspace to remove selected furniture
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const { selectedPlacedId, removeFurniture } = useBuildStore.getState();
        if (selectedPlacedId) {
          removeFurniture(selectedPlacedId);
        }
      }
      
      // M key for mute
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsMuted(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show loading until hydrated
  if (!isReady) {
    return <HydrationLoadingScreen />;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden game-container">
      {/* Game Canvas */}
      <GameCanvas />
      
      {/* Life Aspects HUD */}
      <LifeAspectsHUD />
      
      {/* Build Mode Panel */}
      <BuildModePanel />
      
      {/* Quest Panel */}
      <QuestPanel />
      
      {/* Asset Manager */}
      {showAssetManager && (
        <AssetManager />
      )}
      
      {/* Touch Controls (Mobile) */}
      <TouchControls />
      
      {/* Original HUD (minimap, etc) */}
      <HUD />
      
      {/* Window Manager */}
      <WindowManager />
      
      {/* NPC Creator */}
      <NPCCreator />
      
      {/* Quick Actions - Pixel Art Style */}
      {!isMobile && (
        <div
          className={`fixed z-[150] flex flex-col gap-3 ${
            isTablet ? 'bottom-4 right-2' : 'bottom-4 right-4'
          }`}
        >
          {/* Asset Manager Button */}
          <button
            onClick={() => setShowAssetManager(true)}
            className="pixel-btn flex items-center gap-2"
            title="Asset Manager"
          >
            <Package size={14} />
            <span className="hidden sm:inline">ITEMS</span>
          </button>
          
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`pixel-btn ${isMuted ? 'danger' : ''}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </button>
        </div>
      )}
      
      {/* Mobile Status Bar - Pixel Art Style */}
      {isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 h-12 z-[140] flex items-center justify-between px-3 pixel-panel"
          style={{
            borderTop: '4px solid',
            borderColor: 'var(--pixel-border-light)',
          }}
        >
          <div className="pixel-text-xs" style={{ color: 'var(--pixel-gold)' }}>
            <span className="opacity-70">B:</span> BUILD
            <span className="mx-2 opacity-30">|</span>
            <span className="opacity-70">R:</span> ROTATE
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAssetManager(true)}
              className="pixel-btn"
              style={{ padding: '4px 8px', fontSize: '8px' }}
            >
              <Package size={12} />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`pixel-btn ${isMuted ? 'danger' : ''}`}
              style={{ padding: '4px 8px', fontSize: '8px' }}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          </div>
        </div>
      )}
      
      {/* Game Title - Top Left */}
      <div 
        className="fixed top-2 left-2 z-[100] pixel-panel px-3 py-2"
        style={{ 
          borderLeft: '4px solid var(--pixel-gold)',
        }}
      >
        <div className="flex items-center gap-2">
          <Gamepad2 size={14} style={{ color: 'var(--pixel-gold)' }} />
          <span className="pixel-text-sm" style={{ color: 'var(--pixel-gold)' }}>
            SUPER SPACE
          </span>
        </div>
      </div>
    </main>
  );
}

// Main App with providers
export default function App() {
  return (
    <AppProviders>
      <GameContent />
    </AppProviders>
  );
}
