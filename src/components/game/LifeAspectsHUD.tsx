'use client';

import React, { useState, useEffect } from 'react';
import { useLifeStore, useBuildStore, useQuestStore, ASPECT_NAMES, type LifeAspect } from '@/stores';
import { useHydration } from '@/providers';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Heart,
  Zap,
  Target,
  Trophy,
  Scroll,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Activity,
  Hammer,
} from 'lucide-react';

// Aspect colors
const ASPECT_COLORS: Record<LifeAspect, string> = {
  personal: '#a78bfa',
  career: '#3b82f6',
  finance: '#eab308',
  physical: '#22c55e',
  mental: '#f472b6',
  social: '#f97316',
  spiritual: '#06b6d4',
  intellectual: '#8b5cf6',
  recreation: '#ec4899',
  environment: '#10b981',
};

// Aspect bar component
function AspectBar({ 
  aspect, 
  score, 
  trend, 
  name,
  isCompact = false,
}: { 
  aspect: LifeAspect; 
  score: number; 
  trend: string;
  name: string;
  isCompact?: boolean;
}) {
  if (isCompact) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: ASPECT_COLORS[aspect] }}
        />
        <span className="text-[10px] flex-1 truncate" style={{ color: '#94a3b8' }}>{name}</span>
        <div className="w-12 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: '#1e293b' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444',
            }}
          />
        </div>
        <span className="text-[10px] font-mono w-6 text-right" style={{ color: '#f8fafc' }}>{score}%</span>
      </div>
    );
  }
  
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{name}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {trend === 'up' && <TrendingUp size={10} style={{ color: '#22c55e' }} />}
          {trend === 'down' && <TrendingDown size={10} style={{ color: '#ef4444' }} />}
          {trend === 'stable' && <Minus size={10} style={{ color: '#64748b' }} />}
          <span className="text-[10px] font-mono" style={{ color: '#f8fafc' }}>{score}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444',
          }}
        />
      </div>
    </div>
  );
}

function LifeAspectsContent() {
  const { isBuildMode, toggleBuildMode } = useBuildStore();
  const { metricsData, getRecentActivities, getOverallScore, energy, focus, mood, totalPoints, dailyStreak, unlockedAchievements } = useLifeStore();
  const { activeQuests, toggleQuestPanel } = useQuestStore();
  const { isReady } = useHydration();

  // State for responsive design
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768 || 'ontouchstart' in window;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Auto-collapse panels on mobile/tablet
      if (mobile) {
        setLeftPanelOpen(false);
        setRightPanelOpen(false);
      } else if (tablet) {
        setRightPanelOpen(false);
      } else {
        setLeftPanelOpen(true);
        setRightPanelOpen(true);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Use default values during hydration
  const recentActivities = isReady ? getRecentActivities(3) : [];
  const overallScore = isReady ? getOverallScore() : 50;

  // Don't show in build mode
  if (isBuildMode) return null;

  return (
    <>
      {/* ========== TOP BAR ========== */}
      <div
        className="fixed top-0 left-0 right-0 h-10 z-[100] flex items-center justify-between px-2 md:px-4"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid #334155',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Left Section */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="p-1.5 rounded flex-shrink-0"
              style={{ backgroundColor: '#1e293b' }}
            >
              <Menu size={16} style={{ color: '#00ffff' }} />
            </button>
          )}
          
          {/* Logo */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
                color: '#0f172a',
              }}
            >
              SS
            </div>
            <span className="font-mono text-xs md:text-sm font-bold hidden sm:block" style={{ color: '#00ffff' }}>
              Super Space
            </span>
          </div>
          
          {/* Desktop Stats */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              {/* Overall Score */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: '#1e293b' }}>
                <Heart size={12} style={{ color: overallScore >= 70 ? '#22c55e' : overallScore >= 40 ? '#eab308' : '#ef4444' }} />
                <span className="text-xs font-mono" style={{ color: '#f8fafc' }}>{overallScore}%</span>
              </div>

              {/* Points */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: '#1e293b' }}>
                <Trophy size={12} style={{ color: '#eab308' }} />
                <span className="text-xs font-mono" style={{ color: '#f8fafc' }}>{totalPoints}</span>
              </div>

              {/* Streak */}
              {dailyStreak > 0 && (
                <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: '#ff00ff20' }}>
                  <Zap size={12} style={{ color: '#ff00ff' }} />
                  <span className="text-xs font-mono" style={{ color: '#ff00ff' }}>{dailyStreak}🔥</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Center Section - Active Modules (Desktop only) */}
        {!isMobile && !isTablet && (
          <div className="hidden lg:flex items-center gap-2">
            {['Engine', 'AI Agent', 'Data Sync'].map((module) => (
              <div
                key={module}
                className="px-2 py-0.5 rounded text-[10px] font-mono"
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#64748b',
                }}
              >
                {module}
              </div>
            ))}
          </div>
        )}
        
        {/* Right Section */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Compact Stats */}
          {isMobile && (
            <>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1e293b' }}>
                <Heart size={10} style={{ color: '#22c55e' }} />
                <span className="text-[10px] font-mono" style={{ color: '#f8fafc' }}>{overallScore}%</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1e293b' }}>
                <Trophy size={10} style={{ color: '#eab308' }} />
                <span className="text-[10px] font-mono" style={{ color: '#f8fafc' }}>{totalPoints}</span>
              </div>
            </>
          )}
          
          {/* Desktop: Energy, Focus, Mood */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <StatBadge icon={Zap} value={energy} color="#fbbf24" label="Energy" />
              <StatBadge icon={Target} value={focus} color="#3b82f6" label="Focus" />
              <div className="hidden lg:block">
                <StatBadge icon={Heart} value={mood} color="#22c55e" label="Mood" />
              </div>
            </div>
          )}
          
          {/* Quest Button */}
          <button
            onClick={toggleQuestPanel}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] md:text-xs font-mono transition-all flex-shrink-0"
            style={{
              backgroundColor: activeQuests.length > 0 ? '#eab30820' : '#1e293b',
              border: activeQuests.length > 0 ? '1px solid #eab308' : '1px solid #334155',
              color: activeQuests.length > 0 ? '#eab308' : '#94a3b8',
            }}
          >
            <Scroll size={isMobile ? 12 : 14} />
            {activeQuests.length > 0 && (
              <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center" style={{ backgroundColor: '#eab308', color: '#0f172a' }}>
                {activeQuests.length}
              </span>
            )}
          </button>
          
          {/* Build Mode Button */}
          <button
            onClick={toggleBuildMode}
            className="p-1.5 rounded flex-shrink-0 hidden sm:block"
            style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            title="Build Mode (B)"
          >
            <Hammer size={14} style={{ color: '#eab308' }} />
          </button>
          
          {/* Desktop: Achievements & Panel Toggle */}
          {!isMobile && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                {unlockedAchievements.length} 🏆
              </span>
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="p-1 rounded"
                style={{ backgroundColor: '#1e293b' }}
              >
                {rightPanelOpen ? (
                  <ChevronRight size={14} style={{ color: '#00ffff' }} />
                ) : (
                  <ChevronLeft size={14} style={{ color: '#00ffff' }} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== LEFT SIDEBAR - Life Metrics ========== */}
      <div
        className={`fixed left-0 top-10 bottom-0 z-[90] overflow-y-auto transition-transform duration-300 ${
          isMobile && !leftPanelOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          width: isMobile ? '220px' : isTablet ? '180px' : '180px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderRight: '1px solid #334155',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex justify-between items-center p-2 border-b" style={{ borderColor: '#334155' }}>
            <span className="text-xs font-mono" style={{ color: '#00ffff' }}>Menu</span>
            <button
              onClick={() => setLeftPanelOpen(false)}
              className="p-1 rounded"
              style={{ backgroundColor: '#1e293b' }}
            >
              <X size={14} style={{ color: '#94a3b8' }} />
            </button>
          </div>
        )}
        
        <div className="p-2">
          <div className="text-[10px] font-mono mb-2 flex items-center gap-1" style={{ color: '#00ffff' }}>
            <Activity size={12} />
            10 Aspek Kehidupan
          </div>
          
          {metricsData.map(([aspect, metric]) => {
            const info = ASPECT_NAMES[aspect];
            return (
              <AspectBar
                key={aspect}
                aspect={aspect}
                score={metric.score}
                trend={metric.trend}
                name={info.name}
                isCompact={isMobile || isTablet}
              />
            );
          })}
        </div>
        
        {/* Recent Activities */}
        <div className="p-2 border-t" style={{ borderColor: '#334155' }}>
          <div className="text-[10px] font-mono mb-2" style={{ color: '#94a3b8' }}>
            Aktivitas Terakhir
          </div>
          {recentActivities.length === 0 ? (
            <div className="text-[10px]" style={{ color: '#64748b' }}>
              Belum ada aktivitas
            </div>
          ) : (
            recentActivities.map(activity => (
              <div
                key={activity.id}
                className="text-[10px] mb-1"
                style={{ color: '#94a3b8' }}
              >
                {activity.action} <span style={{ color: '#22c55e' }}>+{activity.points}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && leftPanelOpen && (
        <div
          className="fixed inset-0 z-[85] bg-black/50"
          onClick={() => setLeftPanelOpen(false)}
        />
      )}

      {/* ========== RIGHT SIDEBAR - Quick Stats (Desktop Only) ========== */}
      {!isMobile && (
        <div
          className={`fixed right-0 top-10 bottom-0 z-[90] overflow-y-auto transition-transform duration-300 ${
            rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            width: isTablet ? '140px' : '160px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderLeft: '1px solid #334155',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="p-2">
            <div className="text-[10px] font-mono mb-2" style={{ color: '#00ffff' }}>
              Status
            </div>
            
            {/* Energy */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Zap size={10} style={{ color: '#fbbf24' }} />
                  <span className="text-[10px]" style={{ color: '#94a3b8' }}>Energy</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: '#fbbf24' }}>{energy}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                <div className="h-full rounded-full" style={{ width: `${energy}%`, backgroundColor: '#fbbf24' }} />
              </div>
            </div>
            
            {/* Focus */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Target size={10} style={{ color: '#3b82f6' }} />
                  <span className="text-[10px]" style={{ color: '#94a3b8' }}>Focus</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: '#3b82f6' }}>{focus}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                <div className="h-full rounded-full" style={{ width: `${focus}%`, backgroundColor: '#3b82f6' }} />
              </div>
            </div>
            
            {/* Mood */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Heart size={10} style={{ color: '#22c55e' }} />
                  <span className="text-[10px]" style={{ color: '#94a3b8' }}>Mood</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: '#22c55e' }}>{mood}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                <div className="h-full rounded-full" style={{ width: `${mood}%`, backgroundColor: '#22c55e' }} />
              </div>
            </div>
            
            {/* Achievements */}
            <div className="pt-2 border-t" style={{ borderColor: '#334155' }}>
              <div className="text-[10px] font-mono mb-1" style={{ color: '#94a3b8' }}>
                Achievements
              </div>
              <div className="text-lg" style={{ color: '#f8fafc' }}>
                {unlockedAchievements.length} 🏆
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Stat badge component
function StatBadge({ 
  icon: Icon, 
  value, 
  color, 
  label 
}: { 
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; 
  value: number; 
  color: string; 
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ backgroundColor: '#1e293b' }}
      title={label}
    >
      <Icon size={10} style={{ color }} />
      <span className="text-[10px] font-mono" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function LifeAspectsHUD() {
  return (
    <ErrorBoundary componentName="LifeAspectsHUD">
      <LifeAspectsContent />
    </ErrorBoundary>
  );
}
