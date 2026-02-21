'use client';

import React, { useState, useEffect } from 'react';
import { useQuestStore, type Quest, type QuestType } from '@/stores/questStore';
import { ASPECT_NAMES, type LifeAspect } from '@/stores/lifeStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Star,
  ChevronRight,
  Trophy,
  Target,
  Lock,
  ChevronLeft,
} from 'lucide-react';

// ===========================================
// Quest Panel
// ===========================================

function QuestPanelContent() {
  const { 
    showQuestPanel, 
    toggleQuestPanel,
    quests,
    activeQuests,
    completedQuests,
    selectedQuestId,
    selectQuest,
    startQuest,
    completeQuest,
    getActiveQuests,
    getAvailableQuests,
  } = useQuestStore();
  
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!showQuestPanel) return null;
  
  const activeQuestList = getActiveQuests();
  const availableQuestList = getAvailableQuests();
  const completedQuestList = quests.filter(q => completedQuests.includes(q.id));
  
  const displayQuests = activeTab === 'active' 
    ? activeQuestList 
    : activeTab === 'available' 
      ? availableQuestList 
      : completedQuestList;
  
  const selectedQuest = selectedQuestId ? quests.find(q => q.id === selectedQuestId) : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[250] p-2 md:p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => e.target === e.currentTarget && toggleQuestPanel()}
    >
      <div
        className="w-full h-full md:w-[600px] md:h-[500px] rounded-lg overflow-hidden flex flex-col md:flex-row"
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
        }}
      >
        {/* Mobile: Selected Quest Detail (shows when quest selected) */}
        {isMobile && selectedQuest ? (
          <div className="flex-1 flex flex-col">
            {/* Mobile back button */}
            <div
              className="p-3 border-b flex items-center gap-2"
              style={{ borderColor: '#334155' }}
            >
              <button
                onClick={() => selectQuest(null)}
                className="p-1 rounded hover:bg-slate-700"
              >
                <ChevronLeft size={16} style={{ color: '#94a3b8' }} />
              </button>
              <span className="font-mono text-sm" style={{ color: '#f8fafc' }}>
                {selectedQuest.title}
              </span>
            </div>
            <QuestDetails
              quest={selectedQuest}
              onStart={() => startQuest(selectedQuest.id)}
              onComplete={() => {
                completeQuest(selectedQuest.id);
                selectQuest(null);
              }}
              onClose={() => selectQuest(null)}
            />
          </div>
        ) : (
          <>
            {/* Left Panel - Quest List */}
            <div className="w-full md:w-64 flex flex-col border-b md:border-b-0 md:border-r" style={{ borderColor: '#334155' }}>
              {/* Header */}
              <div
                className="p-3 border-b flex items-center justify-between"
                style={{ borderColor: '#334155' }}
              >
                <div className="flex items-center gap-2">
                  <Trophy size={16} style={{ color: '#eab308' }} />
                  <span className="font-mono text-sm font-bold" style={{ color: '#eab308' }}>
                    Quests
                  </span>
                </div>
                <button
                  onClick={toggleQuestPanel}
                  className="p-1 rounded hover:bg-slate-700"
                >
                  <X size={14} style={{ color: '#94a3b8' }} />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b" style={{ borderColor: '#334155' }}>
                {(['active', 'available', 'completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2 text-[10px] md:text-xs font-mono transition-colors"
                    style={{
                      color: activeTab === tab ? '#00ffff' : '#64748b',
                      backgroundColor: activeTab === tab ? '#1e293b' : 'transparent',
                      borderBottom: activeTab === tab ? '2px solid #00ffff' : 'none',
                    }}
                  >
                    {tab === 'active' && activeQuestList.length > 0 && (
                      <span className="mr-1">({activeQuestList.length})</span>
                    )}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Quest List */}
              <div className="flex-1 overflow-y-auto">
                {displayQuests.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      Tidak ada quest
                    </p>
                  </div>
                ) : (
                  displayQuests.map((quest) => (
                    <QuestListItem
                      key={quest.id}
                      quest={quest}
                      isSelected={selectedQuestId === quest.id}
                      onClick={() => selectQuest(quest.id)}
                    />
                  ))
                )}
              </div>
            </div>
            
            {/* Right Panel - Quest Details (Desktop Only) */}
            <div className="hidden md:flex flex-1 flex-col">
              {selectedQuest ? (
                <QuestDetails
                  quest={selectedQuest}
                  onStart={() => startQuest(selectedQuest.id)}
                  onComplete={() => {
                    completeQuest(selectedQuest.id);
                    selectQuest(null);
                  }}
                  onClose={() => selectQuest(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Target size={32} className="mx-auto mb-2" style={{ color: '#334155' }} />
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      Pilih quest untuk melihat detail
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Quest List Item
// ===========================================

interface QuestListItemProps {
  quest: Quest;
  isSelected: boolean;
  onClick: () => void;
}

function QuestListItem({ quest, isSelected, onClick }: QuestListItemProps) {
  const progress = quest.objectives.reduce((sum, obj) => {
    return sum + Math.min(100, (obj.current / obj.target) * 100);
  }, 0) / quest.objectives.length;
  
  const typeColors: Record<QuestType, string> = {
    daily: '#22c55e',
    weekly: '#3b82f6',
    main: '#eab308',
    side: '#8b5cf6',
  };
  
  const difficultyColors = {
    easy: '#22c55e',
    medium: '#eab308',
    hard: '#ef4444',
  };
  
  return (
    <button
      onClick={onClick}
      className="w-full p-2 md:p-3 text-left border-b transition-colors"
      style={{
        borderColor: '#334155',
        backgroundColor: isSelected ? '#1e293b' : 'transparent',
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs md:text-sm font-medium" style={{ color: '#f8fafc' }}>
          {quest.title}
        </span>
        {quest.status === 'completed' ? (
          <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
        ) : quest.status === 'locked' ? (
          <Lock size={14} style={{ color: '#64748b' }} />
        ) : (
          <Circle size={14} style={{ color: '#64748b' }} />
        )}
      </div>
      
      <div className="flex items-center gap-1 md:gap-2 mb-1.5 md:mb-2">
        <span
          className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded"
          style={{ backgroundColor: typeColors[quest.type] + '30', color: typeColors[quest.type] }}
        >
          {quest.type}
        </span>
        <span
          className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded"
          style={{ backgroundColor: difficultyColors[quest.difficulty] + '30', color: difficultyColors[quest.difficulty] }}
        >
          {quest.difficulty}
        </span>
      </div>
      
      {quest.status === 'active' && (
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: typeColors[quest.type] }}
          />
        </div>
      )}
    </button>
  );
}

// ===========================================
// Quest Details
// ===========================================

interface QuestDetailsProps {
  quest: Quest;
  onStart: () => void;
  onComplete: () => void;
  onClose: () => void;
}

function QuestDetails({ quest, onStart, onComplete, onClose }: QuestDetailsProps) {
  const typeColors: Record<QuestType, string> = {
    daily: '#22c55e',
    weekly: '#3b82f6',
    main: '#eab308',
    side: '#8b5cf6',
  };
  
  const canComplete = quest.objectives.every(o => o.current >= o.target);
  
  return (
    <>
      {/* Header */}
      <div
        className="p-3 md:p-4 border-b"
        style={{ borderColor: '#334155', backgroundColor: typeColors[quest.type] + '10' }}
      >
        <div className="flex items-center gap-2 mb-1.5 md:mb-2">
          <span
            className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded font-mono"
            style={{ backgroundColor: typeColors[quest.type], color: '#0f172a' }}
          >
            {quest.type.toUpperCase()}
          </span>
          <span className="text-[10px] md:text-xs" style={{ color: '#64748b' }}>
            {quest.category}
          </span>
        </div>
        <h2 className="font-mono text-base md:text-lg font-bold" style={{ color: '#f8fafc' }}>
          {quest.title}
        </h2>
        <p className="text-xs md:text-sm mt-1" style={{ color: '#94a3b8' }}>
          {quest.description}
        </p>
      </div>
      
      {/* Objectives */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto">
        <h3 className="text-[10px] md:text-xs font-mono mb-2 md:mb-3" style={{ color: '#94a3b8' }}>
          OBJEKTIF
        </h3>
        <div className="space-y-1.5 md:space-y-2">
          {quest.objectives.map((obj) => {
            const isComplete = obj.current >= obj.target;
            const aspectInfo = obj.aspect ? ASPECT_NAMES[obj.aspect] : null;
            
            return (
              <div
                key={obj.id}
                className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded"
                style={{ backgroundColor: isComplete ? '#22c55e20' : '#1e293b' }}
              >
                {isComplete ? (
                  <CheckCircle2 size={14} className="md:w-4 md:h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
                ) : (
                  <Circle size={14} className="md:w-4 md:h-4 flex-shrink-0" style={{ color: '#64748b' }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm" style={{ color: '#f8fafc' }}>
                    {obj.description}
                  </p>
                  <div className="flex items-center gap-1 md:gap-2 mt-0.5 md:mt-1">
                    <span className="text-[10px] md:text-xs" style={{ color: '#64748b' }}>
                      {obj.current} / {obj.target}
                    </span>
                    {aspectInfo && (
                      <span
                        className="text-[9px] md:text-[10px] px-1 py-0.5 rounded"
                        style={{ backgroundColor: aspectInfo.color + '30', color: aspectInfo.color }}
                      >
                        {aspectInfo.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs md:text-sm font-mono flex-shrink-0" style={{ color: isComplete ? '#22c55e' : '#64748b' }}>
                  {Math.round((obj.current / obj.target) * 100)}%
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Rewards */}
        <h3 className="text-[10px] md:text-xs font-mono mt-3 md:mt-4 mb-2 md:mb-3" style={{ color: '#94a3b8' }}>
          HADIAH
        </h3>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded"
            style={{ backgroundColor: '#eab30820' }}
          >
            <Star size={12} className="md:w-3.5 md:h-3.5" style={{ color: '#eab308' }} />
            <span className="text-xs md:text-sm font-mono" style={{ color: '#eab308' }}>
              +{quest.rewards.points}
            </span>
          </div>
          {quest.rewards.aspects && Object.entries(quest.rewards.aspects).map(([aspect, value]) => {
            const info = ASPECT_NAMES[aspect as LifeAspect];
            return (
              <div
                key={aspect}
                className="flex items-center gap-1 px-2 py-1 rounded"
                style={{ backgroundColor: info.color + '20' }}
              >
                <span className="text-[10px] md:text-xs" style={{ color: info.color }}>
                  +{value} {info.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-3 md:p-4 border-t" style={{ borderColor: '#334155' }}>
        {quest.status === 'available' && (
          <button
            onClick={onStart}
            className="w-full py-2 rounded font-mono text-xs md:text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: '#00ffff', color: '#0f172a' }}
          >
            Mulai Quest
            <ChevronRight size={14} />
          </button>
        )}
        {quest.status === 'active' && canComplete && (
          <button
            onClick={onComplete}
            className="w-full py-2 rounded font-mono text-xs md:text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
          >
            <CheckCircle2 size={14} />
            Selesaikan Quest
          </button>
        )}
        {quest.status === 'active' && !canComplete && (
          <div
            className="w-full py-2 rounded text-center font-mono text-xs md:text-sm"
            style={{ backgroundColor: '#1e293b', color: '#64748b' }}
          >
            Selesaikan semua objektif
          </div>
        )}
        {quest.status === 'completed' && (
          <div
            className="w-full py-2 rounded text-center font-mono text-xs md:text-sm"
            style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
          >
            ✓ Quest Selesai
          </div>
        )}
      </div>
    </>
  );
}

export default function QuestPanel() {
  return (
    <ErrorBoundary componentName="QuestPanel">
      <QuestPanelContent />
    </ErrorBoundary>
  );
}
