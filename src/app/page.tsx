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
import { Package, Volume2, VolumeX } from 'lucide-react';

// Dynamic import for game canvas - Using optimized Canvas renderer
const GameCanvas = dynamic(() => import('@/features/world/CanvasGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-cyan-400 font-mono text-sm">Loading Super Space...</p>
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

  // Keyboard shortcuts - Fixed dependency array and input check logic
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
  }, []); // setIsMuted is stable from useState, no need to include

  // Show loading until hydrated
  if (!isReady) {
    return <HydrationLoadingScreen />;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* Game Canvas */}
      <GameCanvas />
      
      {/* Life Aspects HUD (shows when not in build mode) */}
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
      
      {/* Quick Actions (Bottom Right) - Desktop Only */}
      {!isMobile && (
        <div
          className={`fixed z-[150] flex flex-col gap-2 ${
            isTablet ? 'bottom-4 right-2' : 'bottom-4 right-4'
          }`}
        >
          <button
            onClick={() => setShowAssetManager(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid #475569',
            }}
            title="Asset Manager"
          >
            <Package size={18} style={{ color: '#00ffff' }} />
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid #475569',
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX size={18} style={{ color: '#ef4444' }} />
            ) : (
              <Volume2 size={18} style={{ color: '#22c55e' }} />
            )}
          </button>
        </div>
      )}
      
      {/* Mobile Status Bar */}
      {isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 h-10 z-[140] flex items-center justify-between px-2"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid #334155',
          }}
        >
          <div className="text-[10px] font-mono" style={{ color: '#64748b' }}>
            B: Build • R: Rotate
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded"
              style={{ backgroundColor: '#1e293b' }}
            >
              {isMuted ? (
                <VolumeX size={14} style={{ color: '#ef4444' }} />
              ) : (
                <Volume2 size={14} style={{ color: '#22c55e' }} />
              )}
            </button>
          </div>
        </div>
      )}
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
