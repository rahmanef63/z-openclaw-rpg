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

// Aspect colors - using pixel variables
const ASPECT_COLORS: Record<LifeAspect, string> = {
  personal: '#a78bfa',
  career: 'var(--pixel-sky)',
  finance: 'var(--pixel-gold)',
  physical: 'var(--pixel-grass)',
  mental: '#f472b6',
  social: 'var(--pixel-gold-dark)',
  spiritual: 'var(--pixel-sky)',
  intellectual: 'var(--pixel-magic)',
  recreation: '#ec4899',
  environment: 'var(--pixel-grass)',
};

// Aspect bar component with pixel styling
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
  const barColor = score >= 70 ? 'var(--pixel-grass)' : score >= 40 ? 'var(--pixel-gold)' : 'var(--pixel-blood)';
  
  if (isCompact) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <div
          className="w-3 h-3 pixel-border flex-shrink-0"
          style={{ backgroundColor: ASPECT_COLORS[aspect] }}
        />
        <span className="pixel-text-xs flex-1 truncate text-[var(--muted-foreground)]">{name}</span>
        <div className="w-14 pixel-progress flex-shrink-0">
          <div
            className="pixel-progress-bar transition-all duration-500"
            style={{ width: `${score}%`, backgroundColor: barColor }}
          />
        </div>
        <span className="pixel-text-xs w-8 text-right text-[var(--foreground)]">{score}%</span>
      </div>
    );
  }
  
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="pixel-text-xs truncate text-[var(--muted-foreground)]">{name}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {trend === 'up' && <TrendingUp size={10} style={{ color: 'var(--pixel-grass)' }} />}
          {trend === 'down' && <TrendingDown size={10} style={{ color: 'var(--pixel-blood)' }} />}
          {trend === 'stable' && <Minus size={10} style={{ color: 'var(--muted-foreground)' }} />}
          <span className="pixel-text-xs text-[var(--foreground)]">{score}%</span>
        </div>
      </div>
      <div className="pixel-progress">
        <div
          className="pixel-progress-bar transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: barColor }}
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
        className="fixed top-0 left-0 right-0 h-12 z-[100] flex items-center justify-between px-2 md:px-4 pixel-border-b"
        style={{
          background: 'linear-gradient(180deg, var(--secondary) 0%, #1a1c2c 100%)',
          borderBottom: '4px solid',
          borderColor: 'var(--pixel-border-dark)',
        }}
      >
        {/* Left Section */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="pixel-btn p-1.5 flex-shrink-0"
            >
              <Menu size={16} style={{ color: 'var(--pixel-gold)' }} />
            </button>
          )}
          
          {/* Logo - Pixel Style */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-7 h-7 flex items-center justify-center pixel-font text-xs font-bold pixel-border"
              style={{
                background: 'linear-gradient(135deg, var(--pixel-gold) 0%, var(--pixel-gold-dark) 100%)',
                color: 'var(--pixel-border-dark)',
                boxShadow: 'inset 2px 2px 0 var(--pixel-gold-light), inset -2px -2px 0 rgba(0,0,0,0.3)',
              }}
            >
              SS
            </div>
            <span className="pixel-font text-xs md:text-sm font-bold hidden sm:block text-[var(--pixel-gold)] pixel-text-shadow">
              SUPER SPACE
            </span>
          </div>
          
          {/* Desktop Stats */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              {/* Overall Score */}
              <div className="flex items-center gap-1 px-2 py-1 pixel-border-inset" style={{ backgroundColor: 'var(--background)' }}>
                <Heart size={12} style={{ color: overallScore >= 70 ? 'var(--pixel-grass)' : overallScore >= 40 ? 'var(--pixel-gold)' : 'var(--pixel-blood)' }} />
                <span className="pixel-text-xs text-[var(--foreground)]">{overallScore}%</span>
              </div>

              {/* Points */}
              <div className="flex items-center gap-1 px-2 py-1 pixel-border-inset" style={{ backgroundColor: 'var(--background)' }}>
                <Trophy size={12} style={{ color: 'var(--pixel-gold)' }} />
                <span className="pixel-text-xs text-[var(--foreground)]">{totalPoints}</span>
              </div>

              {/* Streak */}
              {dailyStreak > 0 && (
                <div className="hidden lg:flex items-center gap-1 px-2 py-1 pixel-border" style={{ backgroundColor: 'var(--pixel-magic)' }}>
                  <Zap size={12} style={{ color: 'white' }} />
                  <span className="pixel-text-xs text-white">{dailyStreak}🔥</span>
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
                className="px-2 py-1 pixel-border-inset pixel-text-xs"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--muted-foreground)',
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
              <div className="flex items-center gap-1 px-1.5 py-0.5 pixel-border-inset" style={{ backgroundColor: 'var(--background)' }}>
                <Heart size={10} style={{ color: 'var(--pixel-grass)' }} />
                <span className="pixel-text-xs text-[var(--foreground)]">{overallScore}%</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 pixel-border-inset" style={{ backgroundColor: 'var(--background)' }}>
                <Trophy size={10} style={{ color: 'var(--pixel-gold)' }} />
                <span className="pixel-text-xs text-[var(--foreground)]">{totalPoints}</span>
              </div>
            </>
          )}
          
          {/* Desktop: Energy, Focus, Mood */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <StatBadge icon={Zap} value={energy} color="var(--pixel-gold)" label="Energy" />
              <StatBadge icon={Target} value={focus} color="var(--pixel-sky)" label="Focus" />
              <div className="hidden lg:block">
                <StatBadge icon={Heart} value={mood} color="var(--pixel-grass)" label="Mood" />
              </div>
            </div>
          )}
          
          {/* Quest Button */}
          <button
            onClick={toggleQuestPanel}
            className={`flex items-center gap-1 px-2 py-1 pixel-btn text-[10px] md:text-xs flex-shrink-0 ${activeQuests.length > 0 ? 'primary' : ''}`}
          >
            <Scroll size={isMobile ? 12 : 14} />
            {activeQuests.length > 0 && (
              <span className="w-5 h-5 flex items-center justify-center pixel-text-xs text-[var(--pixel-border-dark)]" style={{ backgroundColor: 'var(--pixel-gold-light)' }}>
                {activeQuests.length}
              </span>
            )}
          </button>
          
          {/* Build Mode Button */}
          <button
            onClick={toggleBuildMode}
            className="pixel-btn p-1.5 flex-shrink-0 hidden sm:block"
            title="Build Mode (B)"
          >
            <Hammer size={14} style={{ color: 'var(--pixel-gold)' }} />
          </button>
          
          {/* Desktop: Achievements & Panel Toggle */}
          {!isMobile && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="pixel-text-xs text-[var(--muted-foreground)]">
                {unlockedAchievements.length} 🏆
              </span>
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="pixel-btn p-1"
              >
                {rightPanelOpen ? (
                  <ChevronRight size={14} style={{ color: 'var(--pixel-gold)' }} />
                ) : (
                  <ChevronLeft size={14} style={{ color: 'var(--pixel-gold)' }} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== LEFT SIDEBAR - Life Metrics ========== */}
      <div
        className={`fixed left-0 top-12 bottom-0 z-[90] overflow-y-auto transition-transform duration-300 ${
          isMobile && !leftPanelOpen ? '-translate-x-full' : 'translate-x-0'
        } pixel-panel`}
        style={{
          width: isMobile ? '220px' : isTablet ? '180px' : '180px',
          borderWidth: '0 4px 0 0',
          borderColor: 'var(--pixel-border-dark) var(--pixel-border-light) var(--pixel-border-light) var(--pixel-border-dark)',
        }}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex justify-between items-center p-2 pixel-border-b" style={{ borderColor: 'var(--pixel-border-dark)' }}>
            <span className="pixel-text-xs text-[var(--pixel-gold)]">Menu</span>
            <button
              onClick={() => setLeftPanelOpen(false)}
              className="pixel-btn p-1"
            >
              <X size={14} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </div>
        )}
        
        <div className="p-3">
          <div className="pixel-panel-header -m-3 mb-3">
            <Activity size={12} />
            <span className="pixel-text-xs">10 Aspek Kehidupan</span>
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
        <div className="p-3 pixel-border-t" style={{ borderColor: 'var(--pixel-border-dark)' }}>
          <div className="pixel-text-xs mb-2 text-[var(--muted-foreground)]">
            Aktivitas Terakhir
          </div>
          {recentActivities.length === 0 ? (
            <div className="pixel-text-xs text-[var(--muted-foreground)]">
              Belum ada aktivitas
            </div>
          ) : (
            recentActivities.map(activity => (
              <div
                key={activity.id}
                className="pixel-text-xs mb-1 text-[var(--muted-foreground)]"
              >
                {activity.action} <span style={{ color: 'var(--pixel-grass)' }}>+{activity.points}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && leftPanelOpen && (
        <div
          className="fixed inset-0 z-[85]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setLeftPanelOpen(false)}
        />
      )}

      {/* ========== RIGHT SIDEBAR - Quick Stats (Desktop Only) ========== */}
      {!isMobile && (
        <div
          className={`fixed right-0 top-12 bottom-0 z-[90] overflow-y-auto transition-transform duration-300 ${
            rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
          } pixel-panel`}
          style={{
            width: isTablet ? '140px' : '160px',
            borderWidth: '0 0 0 4px',
            borderColor: 'var(--pixel-border-dark) var(--pixel-border-light) var(--pixel-border-light) var(--pixel-border-dark)',
          }}
        >
          <div className="p-3">
            <div className="pixel-panel-header -m-3 mb-3">
              <span className="pixel-text-xs">Status</span>
            </div>
            
            {/* Energy */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Zap size={12} style={{ color: 'var(--pixel-gold)' }} />
                  <span className="pixel-text-xs text-[var(--muted-foreground)]">Energy</span>
                </div>
                <span className="pixel-text-xs text-[var(--pixel-gold)]">{energy}%</span>
              </div>
              <div className="pixel-progress">
                <div className="pixel-progress-bar" style={{ width: `${energy}%`, backgroundColor: 'var(--pixel-gold)' }} />
              </div>
            </div>
            
            {/* Focus */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Target size={12} style={{ color: 'var(--pixel-sky)' }} />
                  <span className="pixel-text-xs text-[var(--muted-foreground)]">Focus</span>
                </div>
                <span className="pixel-text-xs text-[var(--pixel-sky)]">{focus}%</span>
              </div>
              <div className="pixel-progress">
                <div className="pixel-progress-bar" style={{ width: `${focus}%`, backgroundColor: 'var(--pixel-sky)' }} />
              </div>
            </div>
            
            {/* Mood */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Heart size={12} style={{ color: 'var(--pixel-grass)' }} />
                  <span className="pixel-text-xs text-[var(--muted-foreground)]">Mood</span>
                </div>
                <span className="pixel-text-xs text-[var(--pixel-grass)]">{mood}%</span>
              </div>
              <div className="pixel-progress">
                <div className="pixel-progress-bar" style={{ width: `${mood}%`, backgroundColor: 'var(--pixel-grass)' }} />
              </div>
            </div>
            
            {/* Achievements */}
            <div className="pt-3 pixel-border-t" style={{ borderColor: 'var(--pixel-border-dark)' }}>
              <div className="pixel-text-xs mb-2 text-[var(--muted-foreground)]">
                Achievements
              </div>
              <div className="text-xl pixel-font text-[var(--foreground)]">
                {unlockedAchievements.length} 🏆
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Stat badge component - pixel style
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
      className="flex items-center gap-1 px-2 py-1 pixel-border-inset"
      style={{ backgroundColor: 'var(--background)' }}
      title={label}
    >
      <Icon size={10} style={{ color }} />
      <span className="pixel-text-xs" style={{ color }}>{value}%</span>
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
