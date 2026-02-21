'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LifeAspect } from './lifeStore';

// ===========================================
// Quest Types
// ===========================================

export type QuestType = 
  | 'daily'       // Daily quests (reset each day)
  | 'weekly'      // Weekly quests
  | 'main'        // Main story quests
  | 'side';       // Side quests

export type QuestStatus = 
  | 'locked'      // Not yet available
  | 'available'   // Can be started
  | 'active'      // In progress
  | 'completed'   // Finished
  | 'failed';     // Failed (timed out)

export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  aspect?: LifeAspect;
}

export interface QuestReward {
  points: number;
  aspects?: Partial<Record<LifeAspect, number>>;
  achievement?: string;
  item?: string;
}

export interface Quest {
  id: string;
  type: QuestType;
  status: QuestStatus;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  expiresAt?: number;      // Timestamp for timed quests
  startedAt?: number;
  completedAt?: number;
  prerequisites?: string[]; // Quest IDs that must be completed first
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ===========================================
// Store State
// ===========================================

interface QuestState {
  // Quests
  quests: Quest[];
  activeQuests: string[];
  completedQuests: string[];
  
  // UI
  showQuestPanel: boolean;
  selectedQuestId: string | null;
  
  // Actions
  getQuest: (id: string) => Quest | undefined;
  getAvailableQuests: () => Quest[];
  getActiveQuests: () => Quest[];
  getDailyQuests: () => Quest[];
  
  startQuest: (questId: string) => boolean;
  completeQuest: (questId: string) => Quest | null;
  failQuest: (questId: string) => void;
  
  // Progress
  updateObjective: (objectiveId: string, amount: number) => void;
  checkQuestCompletion: (questId: string) => boolean;
  
  // UI
  toggleQuestPanel: () => void;
  selectQuest: (questId: string | null) => void;
  
  // Daily reset
  resetDailyQuests: () => void;
  
  // Initialization
  lastDailyReset: string | null;
}

// ===========================================
// Default Quests
// ===========================================

const DEFAULT_QUESTS: Quest[] = [
  // Daily Quests
  {
    id: 'daily-1',
    type: 'daily',
    status: 'available',
    title: 'Pemanasan Pagi',
    description: 'Lakukan 3 aktivitas fisik untuk memulai hari',
    objectives: [
      { id: 'daily-1-obj', description: 'Aktivitas fisik', target: 3, current: 0, aspect: 'physical' },
    ],
    rewards: { points: 50, aspects: { physical: 5 } },
    category: 'Kesehatan',
    difficulty: 'easy',
  },
  {
    id: 'daily-2',
    type: 'daily',
    status: 'available',
    title: 'Fokus Kerja',
    description: 'Selesaikan 2 sesi kerja fokus',
    objectives: [
      { id: 'daily-2-obj', description: 'Sesi kerja', target: 2, current: 0, aspect: 'career' },
    ],
    rewards: { points: 40, aspects: { career: 3 } },
    category: 'Produktivitas',
    difficulty: 'easy',
  },
  {
    id: 'daily-3',
    type: 'daily',
    status: 'available',
    title: 'Sosial Aktif',
    description: 'Lakukan 1 aktivitas sosial',
    objectives: [
      { id: 'daily-3-obj', description: 'Aktivitas sosial', target: 1, current: 0, aspect: 'social' },
    ],
    rewards: { points: 30, aspects: { social: 3 } },
    category: 'Sosial',
    difficulty: 'easy',
  },
  {
    id: 'daily-4',
    type: 'daily',
    status: 'available',
    title: 'Belajar Setiap Hari',
    description: 'Lakukan 1 aktivitas pembelajaran',
    objectives: [
      { id: 'daily-4-obj', description: 'Aktivitas belajar', target: 1, current: 0, aspect: 'intellectual' },
    ],
    rewards: { points: 35, aspects: { intellectual: 3 } },
    category: 'Pendidikan',
    difficulty: 'easy',
  },
  {
    id: 'daily-5',
    type: 'daily',
    status: 'available',
    title: 'Keseimbangan Hidup',
    description: 'Lakukan aktivitas di 3 aspek berbeda',
    objectives: [
      { id: 'daily-5-obj', description: 'Aspek berbeda', target: 3, current: 0 },
    ],
    rewards: { points: 60 },
    category: 'Umum',
    difficulty: 'medium',
  },
  
  // Main Quests
  {
    id: 'main-1',
    type: 'main',
    status: 'available',
    title: 'Memulai Perjalanan',
    description: 'Selesaikan aktivitas pertamamu di Super Space',
    objectives: [
      { id: 'main-1-obj', description: 'Aktivitas pertama', target: 1, current: 0 },
    ],
    rewards: { points: 100, aspects: { personal: 10 } },
    category: 'Tutorial',
    difficulty: 'easy',
  },
  {
    id: 'main-2',
    type: 'main',
    status: 'locked',
    title: 'Membangun Rutinitas',
    description: 'Capai streak 7 hari berturut-turut',
    objectives: [
      { id: 'main-2-obj', description: 'Daily streak', target: 7, current: 0 },
    ],
    rewards: { points: 500, aspects: { personal: 20 } },
    prerequisites: ['main-1'],
    category: 'Progress',
    difficulty: 'medium',
  },
  {
    id: 'main-3',
    type: 'main',
    status: 'locked',
    title: 'Master Keseimbangan',
    description: 'Tingkatkan semua aspek minimal ke level 50',
    objectives: [
      { id: 'main-3-obj', description: 'Aspek level 50+', target: 10, current: 0 },
    ],
    rewards: { points: 1000, achievement: 'balanced-life' },
    prerequisites: ['main-2'],
    category: 'Progress',
    difficulty: 'hard',
  },
  
  // Side Quests
  {
    id: 'side-1',
    type: 'side',
    status: 'available',
    title: 'Penjelajah Ruangan',
    description: 'Interaksi dengan semua furniture di ruanganmu',
    objectives: [
      { id: 'side-1-obj', description: 'Furniture unik', target: 5, current: 0 },
    ],
    rewards: { points: 80 },
    category: 'Eksplorasi',
    difficulty: 'easy',
  },
  {
    id: 'side-2',
    type: 'side',
    status: 'available',
    title: 'Kolektor Preset',
    description: 'Simpan 3 preset ruangan berbeda',
    objectives: [
      { id: 'side-2-obj', description: 'Preset tersimpan', target: 3, current: 0 },
    ],
    rewards: { points: 100 },
    category: 'Kustomisasi',
    difficulty: 'easy',
  },
  
  // Weekly Quests
  {
    id: 'weekly-1',
    type: 'weekly',
    status: 'available',
    title: 'Atlet Minggu Ini',
    description: 'Tingkatkan skor fisik sebesar 20 poin minggu ini',
    objectives: [
      { id: 'weekly-1-obj', description: 'Poin fisik', target: 20, current: 0, aspect: 'physical' },
    ],
    rewards: { points: 200, aspects: { physical: 10 } },
    category: 'Mingguan',
    difficulty: 'medium',
  },
  {
    id: 'weekly-2',
    type: 'weekly',
    status: 'available',
    title: 'Ahli Keuangan',
    description: 'Tingkatkan skor keuangan sebesar 15 poin minggu ini',
    objectives: [
      { id: 'weekly-2-obj', description: 'Poin keuangan', target: 15, current: 0, aspect: 'finance' },
    ],
    rewards: { points: 150, aspects: { finance: 8 } },
    category: 'Mingguan',
    difficulty: 'medium',
  },
];

// ===========================================
// Store
// ===========================================

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: DEFAULT_QUESTS,
      activeQuests: [],
      completedQuests: [],
      showQuestPanel: false,
      selectedQuestId: null,
      lastDailyReset: null,
      
      getQuest: (id) => {
        return get().quests.find(q => q.id === id);
      },
      
      getAvailableQuests: () => {
        const { quests, completedQuests, activeQuests } = get();
        return quests.filter(q => 
          q.status === 'available' ||
          (q.status === 'locked' && q.prerequisites?.every(p => completedQuests.includes(p)))
        );
      },
      
      getActiveQuests: () => {
        const { quests, activeQuests } = get();
        return quests.filter(q => activeQuests.includes(q.id));
      },
      
      getDailyQuests: () => {
        return get().quests.filter(q => q.type === 'daily');
      },
      
      startQuest: (questId) => {
        const quest = get().getQuest(questId);
        if (!quest || quest.status !== 'available') return false;
        
        set({
          quests: get().quests.map(q => 
            q.id === questId 
              ? { ...q, status: 'active', startedAt: Date.now() }
              : q
          ),
          activeQuests: [...get().activeQuests, questId],
        });
        
        return true;
      },
      
      completeQuest: (questId) => {
        const quest = get().getQuest(questId);
        if (!quest || !get().activeQuests.includes(questId)) return null;
        
        // Check if all objectives are complete
        const allComplete = quest.objectives.every(o => o.current >= o.target);
        if (!allComplete) return null;
        
        set({
          quests: get().quests.map(q => 
            q.id === questId 
              ? { ...q, status: 'completed', completedAt: Date.now() }
              : q
          ),
          activeQuests: get().activeQuests.filter(id => id !== questId),
          completedQuests: [...get().completedQuests, questId],
        });
        
        // Unlock prerequisite quests
        const lockedQuests = get().quests.filter(q => 
          q.prerequisites?.includes(questId) && q.status === 'locked'
        );
        
        if (lockedQuests.length > 0) {
          set({
            quests: get().quests.map(q => 
              q.prerequisites?.includes(questId) && q.status === 'locked'
                ? { ...q, status: 'available' }
                : q
            ),
          });
        }
        
        return quest;
      },
      
      failQuest: (questId) => {
        set({
          quests: get().quests.map(q => 
            q.id === questId 
              ? { ...q, status: 'failed' }
              : q
          ),
          activeQuests: get().activeQuests.filter(id => id !== questId),
        });
      },
      
      updateObjective: (objectiveId, amount) => {
        const { quests, activeQuests } = get();
        
        const updatedQuests = quests.map(quest => {
          if (!activeQuests.includes(quest.id)) return quest;
          
          return {
            ...quest,
            objectives: quest.objectives.map(obj => {
              if (obj.id === objectiveId) {
                return { ...obj, current: Math.min(obj.target, obj.current + amount) };
              }
              return obj;
            }),
          };
        });
        
        set({ quests: updatedQuests });
      },
      
      checkQuestCompletion: (questId) => {
        const quest = get().getQuest(questId);
        if (!quest || quest.status !== 'active') return false;
        
        return quest.objectives.every(o => o.current >= o.target);
      },
      
      toggleQuestPanel: () => {
        set({ showQuestPanel: !get().showQuestPanel });
      },
      
      selectQuest: (questId) => {
        set({ selectedQuestId: questId });
      },
      
      resetDailyQuests: () => {
        const today = new Date().toDateString();
        const { lastDailyReset } = get();
        
        if (lastDailyReset === today) return;
        
        set({
          quests: get().quests.map(q => {
            if (q.type !== 'daily') return q;
            return {
              ...q,
              status: 'available',
              objectives: q.objectives.map(o => ({ ...o, current: 0 })),
              startedAt: undefined,
              completedAt: undefined,
            };
          }),
          activeQuests: get().activeQuests.filter(id => {
            const quest = get().getQuest(id);
            return quest?.type !== 'daily';
          }),
          lastDailyReset: today,
        });
      },
    }),
    {
      name: 'superspace-quests',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        quests: state.quests,
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
        lastDailyReset: state.lastDailyReset,
      }),
    }
  )
);
