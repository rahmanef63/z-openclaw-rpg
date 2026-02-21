'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ===========================================
// 10 Life Aspects System
// ===========================================

export type LifeAspect = 
  | 'personal'      // 1. Pengembangan Pribadi (Personal Development)
  | 'career'        // 2. Karir & Bisnis (Career & Business)
  | 'finance'       // 3. Keuangan (Finance)
  | 'physical'      // 4. Kesehatan Fisik (Physical Health)
  | 'mental'        // 5. Kesehatan Mental (Mental Health)
  | 'social'        // 6. Sosial & Hubungan (Social & Relationships)
  | 'spiritual'     // 7. Spiritual (Spiritual)
  | 'intellectual'  // 8. Intelektual (Intellectual)
  | 'recreation'    // 9. Rekreasi & Gaya Hidup (Recreation & Lifestyle)
  | 'environment';  // 10. Lingkungan & Kontribusi (Environment & Contribution)

export type Trend = 'up' | 'down' | 'stable';

// ===========================================
// Interfaces
// ===========================================

export interface LifeMetric {
  aspect: LifeAspect;
  score: number; // 0-100
  lastActivity: number | null;
  streak: number;
  tasksCompleted: number;
  trend: Trend;
  weeklyProgress: number[];
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  aspect: LifeAspect;
  action: string;
  points: number;
  furnitureId?: string;
  category: string;
}

export interface Achievement {
  id: string;
  aspect: LifeAspect;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  requirement: number;
  unlockedAt: number | null;
}

export interface RoomPreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  objects: Array<{
    assetId: string;
    gridX: number;
    gridY: number;
    width: number;
    height: number;
    aspectCategory?: LifeAspect;
  }>;
  createdAt: number;
  thumbnail?: string;
}

// ===========================================
// Store State
// ===========================================

interface LifeState {
  // 10 Aspect Metrics
  metricsData: Array<[LifeAspect, LifeMetric]>;
  
  // Overall stats
  energy: number;
  focus: number;
  mood: number;
  
  // Activity tracking
  activityLog: ActivityLog[];
  totalPoints: number;
  dailyStreak: number;
  lastActiveDate: string | null;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: string[];
  
  // Room presets
  presets: RoomPreset[];
  activePreset: string | null;
  
  // Time & Environment
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  useRealTime: boolean;
  useRealWeather: boolean;
  
  // Hydration
  isHydrated: boolean;
  
  // Actions
  updateAspect: (aspect: LifeAspect, delta: number) => void;
  setAspectScore: (aspect: LifeAspect, score: number) => void;
  recordActivity: (aspect: LifeAspect, action: string, points: number, furnitureId?: string, category?: string) => void;
  
  // Stats
  updateEnergy: (delta: number) => void;
  updateFocus: (delta: number) => void;
  updateMood: (delta: number) => void;
  
  // Achievements
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  
  // Presets
  savePreset: (name: string, nameEn: string, description: string, objects: RoomPreset['objects']) => void;
  loadPreset: (id: string) => RoomPreset | null;
  deletePreset: (id: string) => void;
  
  // Environment
  setTimeOfDay: (time: 'morning' | 'afternoon' | 'evening' | 'night') => void;
  setWeather: (weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy') => void;
  toggleRealTime: () => void;
  toggleRealWeather: () => void;
  
  // Getters
  getMetric: (aspect: LifeAspect) => LifeMetric | undefined;
  getOverallScore: () => number;
  getRecentActivities: (limit?: number) => ActivityLog[];
  getMetricsMap: () => Map<LifeAspect, LifeMetric>;
  setHydrated: () => void;
}

// ===========================================
// Default Data
// ===========================================

function createDefaultMetricsData(): Array<[LifeAspect, LifeMetric]> {
  const aspects: LifeAspect[] = [
    'personal', 'career', 'finance', 'physical', 'mental',
    'social', 'spiritual', 'intellectual', 'recreation', 'environment'
  ];
  
  return aspects.map(aspect => [aspect, {
    aspect,
    score: 50,
    lastActivity: null,
    streak: 0,
    tasksCompleted: 0,
    trend: 'stable' as const,
    weeklyProgress: [50, 50, 50, 50, 50, 50, 50],
  }]);
}

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', aspect: 'personal', name: 'Langkah Pertama', nameEn: 'First Step', description: 'Mulai perjalanan pengembangan diri', icon: '🎯', requirement: 1, unlockedAt: null },
  { id: 'focused-week', aspect: 'career', name: 'Minggu Fokus', nameEn: 'Focused Week', description: 'Tingkatkan skor karir 10 poin', icon: '💼', requirement: 10, unlockedAt: null },
  { id: 'money-saver', aspect: 'finance', name: 'Penghemat', nameEn: 'Money Saver', description: 'Capai skor keuangan 75', icon: '💰', requirement: 75, unlockedAt: null },
  { id: 'fitness-starter', aspect: 'physical', name: 'Mulai Fit', nameEn: 'Fitness Starter', description: 'Selesaikan 5 aktivitas fisik', icon: '🏃', requirement: 5, unlockedAt: null },
  { id: 'mindful', aspect: 'mental', name: 'Pikiran Jernih', nameEn: 'Mindful', description: 'Capai skor mental 80', icon: '🧘', requirement: 80, unlockedAt: null },
  { id: 'social-butterfly', aspect: 'social', name: 'Kupu-Kupu Sosial', nameEn: 'Social Butterfly', description: '5 aktivitas sosial', icon: '🦋', requirement: 5, unlockedAt: null },
  { id: 'spiritual-seeker', aspect: 'spiritual', name: 'Pencari Spiritual', nameEn: 'Spiritual Seeker', description: 'Capai skor spiritual 70', icon: '✨', requirement: 70, unlockedAt: null },
  { id: 'bookworm', aspect: 'intellectual', name: 'Pembaca Setia', nameEn: 'Bookworm', description: '10 aktivitas intelektual', icon: '📚', requirement: 10, unlockedAt: null },
  { id: 'fun-lover', aspect: 'recreation', name: 'Pecinta Hiburan', nameEn: 'Fun Lover', description: '5 aktivitas rekreasi', icon: '🎮', requirement: 5, unlockedAt: null },
  { id: 'eco-warrior', aspect: 'environment', name: 'Pejuang Lingkungan', nameEn: 'Eco Warrior', description: 'Capai skor lingkungan 75', icon: '🌿', requirement: 75, unlockedAt: null },
  { id: 'balanced-life', aspect: 'personal', name: 'Hidup Seimbang', nameEn: 'Balanced Life', description: 'Semua aspek di atas 50', icon: '⚖️', requirement: 50, unlockedAt: null },
  { id: 'perfectionist', aspect: 'personal', name: 'Perfeksionis', nameEn: 'Perfectionist', description: 'Semua aspek di atas 80', icon: '🏆', requirement: 80, unlockedAt: null },
];

// Aspect display names
export const ASPECT_NAMES: Record<LifeAspect, { name: string; nameEn: string; icon: string; color: string }> = {
  personal: { name: 'Pengembangan Pribadi', nameEn: 'Personal Development', icon: 'User', color: '#a78bfa' },
  career: { name: 'Karir & Bisnis', nameEn: 'Career & Business', icon: 'Briefcase', color: '#3b82f6' },
  finance: { name: 'Keuangan', nameEn: 'Finance', icon: 'Wallet', color: '#eab308' },
  physical: { name: 'Kesehatan Fisik', nameEn: 'Physical Health', icon: 'Dumbbell', color: '#22c55e' },
  mental: { name: 'Kesehatan Mental', nameEn: 'Mental Health', icon: 'Brain', color: '#f472b6' },
  social: { name: 'Sosial & Hubungan', nameEn: 'Social & Relationships', icon: 'Users', color: '#f97316' },
  spiritual: { name: 'Spiritual', nameEn: 'Spiritual', icon: 'Sparkles', color: '#06b6d4' },
  intellectual: { name: 'Intelektual', nameEn: 'Intellectual', icon: 'BookOpen', color: '#8b5cf6' },
  recreation: { name: 'Rekreasi', nameEn: 'Recreation', icon: 'Gamepad2', color: '#ec4899' },
  environment: { name: 'Lingkungan', nameEn: 'Environment', icon: 'Leaf', color: '#10b981' },
};

// Counters
let activityCounter = 0;
let presetCounter = 0;

// ===========================================
// Store
// ===========================================

export const useLifeStore = create<LifeState>()(
  persist(
    (set, get) => ({
      metricsData: createDefaultMetricsData(),
      energy: 100,
      focus: 80,
      mood: 70,
      activityLog: [],
      totalPoints: 0,
      dailyStreak: 0,
      lastActiveDate: null,
      achievements: DEFAULT_ACHIEVEMENTS,
      unlockedAchievements: [],
      presets: [],
      activePreset: null,
      timeOfDay: 'morning',
      weather: 'sunny',
      useRealTime: false,
      useRealWeather: false,
      isHydrated: false,
      
      setHydrated: () => set({ isHydrated: true }),
      
      updateAspect: (aspect, delta) => {
        const state = get();
        const newMetricsData: Array<[LifeAspect, LifeMetric]> = state.metricsData.map(([key, metric]) => {
          if (key === aspect) {
            const newScore = Math.max(0, Math.min(100, metric.score + delta));
            const trend: Trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';
            
            // Update weekly progress
            const newWeeklyProgress = [...metric.weeklyProgress];
            newWeeklyProgress[newWeeklyProgress.length - 1] = newScore;
            
            return [key, { 
              ...metric, 
              score: newScore, 
              trend,
              weeklyProgress: newWeeklyProgress,
            }];
          }
          return [key, metric];
        });
        set({ metricsData: newMetricsData });
        get().checkAchievements();
      },
      
      setAspectScore: (aspect, score) => {
        const state = get();
        const newMetricsData: Array<[LifeAspect, LifeMetric]> = state.metricsData.map(([key, metric]) => {
          if (key === aspect) {
            return [key, { ...metric, score: Math.max(0, Math.min(100, score)) }];
          }
          return [key, metric];
        });
        set({ metricsData: newMetricsData });
      },
      
      recordActivity: (aspect, action, points, furnitureId, category = 'general') => {
        const activity: ActivityLog = {
          id: `activity-${Date.now()}-${++activityCounter}`,
          timestamp: Date.now(),
          aspect,
          action,
          points,
          furnitureId,
          category,
        };
        
        const state = get();
        
        // Update metrics
        const newMetricsData: Array<[LifeAspect, LifeMetric]> = state.metricsData.map(([key, metric]) => {
          if (key === aspect) {
            const newScore = Math.max(0, Math.min(100, metric.score + (points * 0.5)));
            return [key, {
              ...metric,
              score: newScore,
              lastActivity: Date.now(),
              tasksCompleted: metric.tasksCompleted + 1,
              streak: metric.streak + 1,
              trend: points > 0 ? 'up' : 'down',
            } as LifeMetric];
          }
          return [key, metric];
        });
        
        // Update daily streak - Fixed logic
        const today = new Date().toDateString();
        let newDailyStreak = state.dailyStreak;
        
        // Only update streak if not already active today
        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          if (state.lastActiveDate === yesterday) {
            // Consecutive day - increment streak
            newDailyStreak = state.dailyStreak + 1;
          } else if (state.lastActiveDate === null) {
            // First ever activity
            newDailyStreak = 1;
          } else {
            // Streak broken - reset to 1
            newDailyStreak = 1;
          }
        }
        
        set({
          metricsData: newMetricsData,
          activityLog: [activity, ...state.activityLog].slice(0, 100),
          totalPoints: state.totalPoints + points,
          dailyStreak: newDailyStreak,
          lastActiveDate: today,
        });
        
        get().checkAchievements();
      },
      
      updateEnergy: (delta) => set(state => ({
        energy: Math.max(0, Math.min(100, state.energy + delta))
      })),
      
      updateFocus: (delta) => set(state => ({
        focus: Math.max(0, Math.min(100, state.focus + delta))
      })),
      
      updateMood: (delta) => set(state => ({
        mood: Math.max(0, Math.min(100, state.mood + delta))
      })),
      
      checkAchievements: () => {
        const state = get();
        const newUnlocked: string[] = [];
        
        state.achievements.forEach(achievement => {
          if (state.unlockedAchievements.includes(achievement.id)) return;
          
          let unlocked = false;
          
          // Check aspect score achievements
          const metric = state.metricsData.find(([a]) => a === achievement.aspect);
          if (metric) {
            if (achievement.id === 'first-step' && metric[1].tasksCompleted >= 1) {
              unlocked = true;
            }
            if (achievement.id === 'focused-week' && metric[1].score >= 60) {
              unlocked = true;
            }
            if (achievement.id === 'money-saver' && achievement.aspect === 'finance' && metric[1].score >= 75) {
              unlocked = true;
            }
            if (achievement.id === 'fitness-starter' && achievement.aspect === 'physical' && metric[1].tasksCompleted >= 5) {
              unlocked = true;
            }
            if (achievement.id === 'mindful' && achievement.aspect === 'mental' && metric[1].score >= 80) {
              unlocked = true;
            }
            if (achievement.id === 'social-butterfly' && achievement.aspect === 'social' && metric[1].tasksCompleted >= 5) {
              unlocked = true;
            }
            if (achievement.id === 'spiritual-seeker' && achievement.aspect === 'spiritual' && metric[1].score >= 70) {
              unlocked = true;
            }
            if (achievement.id === 'bookworm' && achievement.aspect === 'intellectual' && metric[1].tasksCompleted >= 10) {
              unlocked = true;
            }
            if (achievement.id === 'fun-lover' && achievement.aspect === 'recreation' && metric[1].tasksCompleted >= 5) {
              unlocked = true;
            }
            if (achievement.id === 'eco-warrior' && achievement.aspect === 'environment' && metric[1].score >= 75) {
              unlocked = true;
            }
          }
          
          // Check balanced life achievement
          if (achievement.id === 'balanced-life') {
            const allAbove50 = state.metricsData.every(([, m]) => m.score >= 50);
            if (allAbove50) unlocked = true;
          }
          
          // Check perfectionist achievement
          if (achievement.id === 'perfectionist') {
            const allAbove80 = state.metricsData.every(([, m]) => m.score >= 80);
            if (allAbove80) unlocked = true;
          }
          
          if (unlocked) {
            newUnlocked.push(achievement.id);
          }
        });
        
        if (newUnlocked.length > 0) {
          set({
            unlockedAchievements: [...state.unlockedAchievements, ...newUnlocked],
            achievements: state.achievements.map(a => 
              newUnlocked.includes(a.id) 
                ? { ...a, unlockedAt: Date.now() } 
                : a
            ),
          });
        }
      },
      
      unlockAchievement: (achievementId) => {
        const state = get();
        if (!state.unlockedAchievements.includes(achievementId)) {
          set({
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
            achievements: state.achievements.map(a => 
              a.id === achievementId 
                ? { ...a, unlockedAt: Date.now() } 
                : a
            ),
          });
        }
      },
      
      savePreset: (name, nameEn, description, objects) => {
        const preset: RoomPreset = {
          id: `preset-${Date.now()}-${++presetCounter}`,
          name,
          nameEn,
          description,
          objects,
          createdAt: Date.now(),
        };
        set(state => ({
          presets: [...state.presets, preset],
        }));
      },
      
      loadPreset: (id) => {
        const state = get();
        const preset = state.presets.find(p => p.id === id);
        if (preset) {
          set({ activePreset: id });
        }
        return preset || null;
      },
      
      deletePreset: (id) => {
        set(state => ({
          presets: state.presets.filter(p => p.id !== id),
          activePreset: state.activePreset === id ? null : state.activePreset,
        }));
      },
      
      setTimeOfDay: (time) => set({ timeOfDay: time }),
      setWeather: (weather) => set({ weather: weather }),
      toggleRealTime: () => set(state => ({ useRealTime: !state.useRealTime })),
      toggleRealWeather: () => set(state => ({ useRealWeather: !state.useRealWeather })),
      
      getMetric: (aspect) => {
        const data = get().metricsData.find(([key]) => key === aspect);
        return data ? data[1] : undefined;
      },
      
      getOverallScore: () => {
        const { metricsData } = get();
        if (metricsData.length === 0) return 50;
        const total = metricsData.reduce((sum, [, m]) => sum + m.score, 0);
        return Math.round(total / metricsData.length);
      },
      
      getRecentActivities: (limit = 10) => {
        return get().activityLog.slice(0, limit);
      },
      
      getMetricsMap: () => {
        return new Map(get().metricsData);
      },
    }),
    {
      name: 'superspace-life',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        metricsData: state.metricsData,
        energy: state.energy,
        focus: state.focus,
        mood: state.mood,
        activityLog: state.activityLog,
        totalPoints: state.totalPoints,
        dailyStreak: state.dailyStreak,
        lastActiveDate: state.lastActiveDate,
        unlockedAchievements: state.unlockedAchievements,
        presets: state.presets,
      }),
      onRehydrateStorage: () => (state) => {
        setTimeout(() => {
          if (state) {
            state.isHydrated = true;
          }
        }, 0);
      },
    }
  )
);
