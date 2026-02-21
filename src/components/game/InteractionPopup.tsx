'use client';

import React, { useState, useEffect } from 'react';
import { useInteractionStore, type Interaction } from '@/stores/interactionStore';
import { useLifeStore, ASPECT_NAMES } from '@/stores/lifeStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { X, Clock, Zap, Star, Play, ChevronRight } from 'lucide-react';

// ===========================================
// Interaction Popup
// ===========================================

interface InteractionPopupProps {
  furnitureId: string;
  furnitureName: string;
  onClose: () => void;
}

function InteractionPopupContent({ furnitureId, furnitureName, onClose }: InteractionPopupProps) {
  const { 
    getInteractionsForFurniture, 
    selectedInteractionId, 
    selectInteraction,
    startInteraction,
    isOnCooldown,
    getCooldownRemaining,
  } = useInteractionStore();
  
  const { energy } = useLifeStore();
  
  const interactions = getInteractionsForFurniture(furnitureId);
  const selectedInteraction = interactions.find(i => i.id === selectedInteractionId) || interactions[0];
  
  if (interactions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Tidak ada interaksi tersedia
        </p>
      </div>
    );
  }
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[300]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-80 rounded-lg overflow-hidden"
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b"
          style={{ borderColor: '#334155' }}
        >
          <div>
            <h3 className="font-mono text-sm font-bold" style={{ color: '#00ffff' }}>
              {furnitureName}
            </h3>
            <p className="text-xs" style={{ color: '#64748b' }}>
              Pilih aktivitas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700"
          >
            <X size={16} style={{ color: '#94a3b8' }} />
          </button>
        </div>
        
        {/* Interaction List */}
        <div className="max-h-60 overflow-y-auto">
          {interactions.map((interaction) => {
            const onCooldown = isOnCooldown(interaction.id);
            const cooldownRemaining = getCooldownRemaining(interaction.id);
            const isSelected = selectedInteraction?.id === interaction.id;
            const aspectInfo = ASPECT_NAMES[interaction.aspect];
            const notEnoughEnergy = energy < interaction.energyCost;
            
            return (
              <button
                key={interaction.id}
                onClick={() => selectInteraction(interaction.id)}
                className="w-full p-3 text-left border-b transition-colors"
                style={{
                  borderColor: '#334155',
                  backgroundColor: isSelected ? '#1e293b' : 'transparent',
                }}
                disabled={onCooldown}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: '#f8fafc' }}>
                    {interaction.title}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: aspectInfo.color + '30', color: aspectInfo.color }}
                  >
                    {aspectInfo.name}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>
                  {interaction.description}
                </p>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1" style={{ color: '#64748b' }}>
                    <Clock size={10} />
                    {interaction.duration}s
                  </span>
                  <span 
                    className="flex items-center gap-1"
                    style={{ color: notEnoughEnergy ? '#ef4444' : '#fbbf24' }}
                  >
                    <Zap size={10} />
                    {interaction.energyCost > 0 ? `-${interaction.energyCost}` : `+${Math.abs(interaction.energyCost)}`}
                  </span>
                  <span className="flex items-center gap-1" style={{ color: '#22c55e' }}>
                    <Star size={10} />
                    +{interaction.pointsReward}
                  </span>
                </div>
                {onCooldown && (
                  <div className="mt-2 text-[10px]" style={{ color: '#ef4444' }}>
                    Cooldown: {formatTime(cooldownRemaining)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Action Button */}
        {selectedInteraction && (
          <div className="p-3 border-t" style={{ borderColor: '#334155' }}>
            <button
              onClick={() => {
                startInteraction(selectedInteraction.id);
                onClose();
              }}
              disabled={isOnCooldown(selectedInteraction.id) || energy < selectedInteraction.energyCost}
              className="w-full py-2 rounded font-mono text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isOnCooldown(selectedInteraction.id) ? '#64748b' : '#00ffff',
                color: '#0f172a',
              }}
            >
              <Play size={14} />
              Mulai
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default function InteractionPopup(props: InteractionPopupProps) {
  return (
    <ErrorBoundary componentName="InteractionPopup">
      <InteractionPopupContent {...props} />
    </ErrorBoundary>
  );
}

// ===========================================
// Active Interaction Overlay
// ===========================================

interface ActiveInteractionOverlayProps {
  onComplete: (success: boolean, score: number) => void;
  onCancel: () => void;
}

export function ActiveInteractionOverlay({ onComplete, onCancel }: ActiveInteractionOverlayProps) {
  const { activeInteraction, getInteraction } = useInteractionStore();
  const [progress, setProgress] = useState(0);
  const [miniGameScore, setMiniGameScore] = useState(100);
  
  const interaction = activeInteraction ? getInteraction(activeInteraction.interactionId) : null;
  
  useEffect(() => {
    if (!interaction) return;
    
    const startTime = Date.now();
    const duration = interaction.duration * 1000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete(true, miniGameScore);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [interaction, miniGameScore, onComplete]);
  
  if (!interaction) return null;
  
  const aspectInfo = ASPECT_NAMES[interaction.aspect];
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[400]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div
        className="w-96 rounded-lg overflow-hidden"
        style={{
          backgroundColor: '#0f172a',
          border: `2px solid ${aspectInfo.color}`,
        }}
      >
        {/* Header */}
        <div
          className="p-4 text-center"
          style={{ backgroundColor: aspectInfo.color + '20' }}
        >
          <h2 className="font-mono text-lg font-bold" style={{ color: aspectInfo.color }}>
            {interaction.title}
          </h2>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {interaction.description}
          </p>
        </div>
        
        {/* Progress */}
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: '#94a3b8' }}>Progress</span>
              <span style={{ color: '#f8fafc' }}>{Math.round(progress)}%</span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: '#1e293b' }}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  backgroundColor: aspectInfo.color,
                }}
              />
            </div>
          </div>
          
          {/* Mini Game Area */}
          <div
            className="h-32 rounded flex items-center justify-center mb-4"
            style={{ backgroundColor: '#1e293b' }}
          >
            {interaction.miniGame === 'none' ? (
              <div className="text-center">
                <div className="text-4xl mb-2">{aspectInfo.icon}</div>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  Tunggu hingga selesai...
                </p>
              </div>
            ) : (
              <MiniGameArea
                type={interaction.miniGame}
                onScoreUpdate={setMiniGameScore}
              />
            )}
          </div>
          
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full py-2 rounded font-mono text-sm"
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
            }}
          >
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Mini Game Area
// ===========================================

interface MiniGameAreaProps {
  type: string;
  onScoreUpdate: (score: number) => void;
}

function MiniGameArea({ type, onScoreUpdate }: MiniGameAreaProps) {
  const [gameState, setGameState] = useState({
    target: Math.random() * 80 + 10,
    position: 0,
    direction: 1,
  });
  
  useEffect(() => {
    if (type === 'timing') {
      const interval = setInterval(() => {
        setGameState(prev => {
          let newPos = prev.position + prev.direction * 2;
          let newDir = prev.direction;
          
          if (newPos >= 100) {
            newPos = 100;
            newDir = -1;
          } else if (newPos <= 0) {
            newPos = 0;
            newDir = 1;
          }
          
          return { ...prev, position: newPos, direction: newDir };
        });
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [type]);
  
  const handleClick = () => {
    if (type === 'timing') {
      const distance = Math.abs(gameState.position - gameState.target);
      const score = Math.max(0, 100 - distance * 2);
      onScoreUpdate(score);
    }
  };
  
  if (type === 'timing') {
    return (
      <div className="w-full h-full p-4 flex flex-col items-center justify-center">
        <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>
          Klik saat di zona hijau!
        </p>
        <div
          className="relative w-full h-8 rounded"
          style={{ backgroundColor: '#334155' }}
          onClick={handleClick}
        >
          {/* Target zone */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-green-500/30"
            style={{ left: `${gameState.target - 2}%` }}
          />
          {/* Moving indicator */}
          <div
            className="absolute top-0 bottom-0 w-2 rounded"
            style={{
              left: `${gameState.position}%`,
              backgroundColor: '#00ffff',
            }}
          />
        </div>
      </div>
    );
  }
  
  if (type === 'breathing') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
          style={{
            backgroundColor: aspectInfo.color + '40',
            border: `2px solid ${aspectInfo.color}`,
          }}
        >
          <span className="text-2xl">🧘</span>
        </div>
        <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>
          Tarik napas... hembuskan...
        </p>
      </div>
    );
  }
  
  return (
    <div className="text-center">
      <p className="text-sm" style={{ color: '#94a3b8' }}>
        Mini-game: {type}
      </p>
    </div>
  );
}

// Helper for mini game area
const aspectInfo = ASPECT_NAMES.personal; // Default
