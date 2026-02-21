'use client';

import { create } from 'zustand';
import type { LifeAspect } from './lifeStore';

// ===========================================
// Interaction Types
// ===========================================

export type InteractionType = 
  | 'work'        // Career tasks
  | 'exercise'    // Physical activities
  | 'meditate'    // Mental/spiritual
  | 'socialize'   // Social activities
  | 'learn'       // Intellectual
  | 'relax'       // Recreation
  | 'finance'     // Finance management
  | 'cook'        // Physical - cooking
  | 'garden'      // Environment
  | 'create';     // Creative activities

export type MiniGameType = 
  | 'typing'      // Type words quickly
  | 'memory'      // Memory matching
  | 'timing'      // Stop at right time
  | 'sequence'    // Follow sequence
  | 'quiz'        // Answer questions
  | 'breathing'   // Breathing exercise
  | 'none';       // No mini-game

export interface Interaction {
  id: string;
  furnitureId: string;
  furnitureName: string;
  type: InteractionType;
  aspect: LifeAspect;
  title: string;
  description: string;
  duration: number;        // seconds
  energyCost: number;
  pointsReward: number;
  miniGame: MiniGameType;
  cooldown: number;        // seconds before can interact again
  lastInteracted: number | null;
}

export interface ActiveInteraction {
  interactionId: string;
  startedAt: number;
  miniGameState?: Record<string, unknown>;
}

export interface InteractionResult {
  interactionId: string;
  success: boolean;
  pointsEarned: number;
  aspectBonus: number;
  completedAt: number;
  feedback: string;
}

// ===========================================
// Store State
// ===========================================

interface InteractionState {
  // Available interactions
  interactions: Interaction[];
  
  // Current active interaction
  activeInteraction: ActiveInteraction | null;
  
  // History
  interactionHistory: InteractionResult[];
  
  // UI state
  showInteractionPopup: boolean;
  selectedInteractionId: string | null;
  
  // Actions
  getInteraction: (id: string) => Interaction | undefined;
  getInteractionsForFurniture: (furnitureId: string) => Interaction[];
  startInteraction: (interactionId: string) => boolean;
  completeInteraction: (success: boolean, miniGameScore?: number) => InteractionResult | null;
  cancelInteraction: () => void;
  
  // UI
  openInteractionPopup: (furnitureId: string) => void;
  closeInteractionPopup: () => void;
  selectInteraction: (id: string | null) => void;
  
  // Cooldowns
  isOnCooldown: (interactionId: string) => boolean;
  getCooldownRemaining: (interactionId: string) => number;
}

// ===========================================
// Default Interactions per Furniture
// ===========================================

const DEFAULT_INTERACTIONS: Interaction[] = [
  // Career
  {
    id: 'desk-work',
    furnitureId: 'main-desk',
    furnitureName: 'Meja Kerja Utama',
    type: 'work',
    aspect: 'career',
    title: 'Kerja Fokus',
    description: 'Tingkatkan produktivitas dengan sesi kerja fokus',
    duration: 60,
    energyCost: 10,
    pointsReward: 15,
    miniGame: 'typing',
    cooldown: 300,
    lastInteracted: null,
  },
  {
    id: 'desk-meet',
    furnitureId: 'main-desk',
    furnitureName: 'Meja Kerja Utama',
    type: 'socialize',
    aspect: 'career',
    title: 'Meeting Tim',
    description: 'Lakukan meeting dengan tim virtual',
    duration: 30,
    energyCost: 5,
    pointsReward: 10,
    miniGame: 'none',
    cooldown: 600,
    lastInteracted: null,
  },
  {
    id: 'whiteboard-brainstorm',
    furnitureId: 'whiteboard',
    furnitureName: 'Papan Putih',
    type: 'create',
    aspect: 'career',
    title: 'Brainstorming',
    description: 'Generate ide-ide kreatif',
    duration: 45,
    energyCost: 8,
    pointsReward: 12,
    miniGame: 'memory',
    cooldown: 180,
    lastInteracted: null,
  },
  
  // Physical
  {
    id: 'exercise-workout',
    furnitureId: 'exercise-mat',
    furnitureName: 'Matras Olahraga',
    type: 'exercise',
    aspect: 'physical',
    title: 'Workout Pagi',
    description: 'Lakukan workout untuk kesehatan',
    duration: 120,
    energyCost: 20,
    pointsReward: 25,
    miniGame: 'timing',
    cooldown: 3600,
    lastInteracted: null,
  },
  {
    id: 'exercise-yoga',
    furnitureId: 'exercise-mat',
    furnitureName: 'Matras Olahraga',
    type: 'exercise',
    aspect: 'physical',
    title: 'Yoga Session',
    description: 'Sesi yoga untuk fleksibilitas',
    duration: 90,
    energyCost: 10,
    pointsReward: 20,
    miniGame: 'breathing',
    cooldown: 1800,
    lastInteracted: null,
  },
  {
    id: 'kitchen-cook',
    furnitureId: 'kitchen',
    furnitureName: 'Dapur Kecil',
    type: 'cook',
    aspect: 'physical',
    title: 'Masak Sehat',
    description: 'Siapkan makanan sehat',
    duration: 60,
    energyCost: 15,
    pointsReward: 15,
    miniGame: 'sequence',
    cooldown: 7200,
    lastInteracted: null,
  },
  
  // Mental
  {
    id: 'sofa-relax',
    furnitureId: 'sofa',
    furnitureName: 'Sofa Nyaman',
    type: 'relax',
    aspect: 'mental',
    title: 'Istirahat',
    description: 'Beristirahat sejenak untuk recovery',
    duration: 30,
    energyCost: -20, // Restores energy
    pointsReward: 5,
    miniGame: 'breathing',
    cooldown: 300,
    lastInteracted: null,
  },
  {
    id: 'meditation-cushion',
    furnitureId: 'meditation-cushion',
    furnitureName: 'Bantal Meditasi',
    type: 'meditate',
    aspect: 'mental',
    title: 'Meditasi',
    description: 'Tingkatkan ketenangan pikiran',
    duration: 60,
    energyCost: 5,
    pointsReward: 15,
    miniGame: 'breathing',
    cooldown: 600,
    lastInteracted: null,
  },
  
  // Social
  {
    id: 'coffee-chat',
    furnitureId: 'coffee-table',
    furnitureName: 'Meja Kopi',
    type: 'socialize',
    aspect: 'social',
    title: 'Ngobrol Santai',
    description: 'Berkumpul dan berbincang',
    duration: 45,
    energyCost: 5,
    pointsReward: 12,
    miniGame: 'none',
    cooldown: 1800,
    lastInteracted: null,
  },
  
  // Intellectual
  {
    id: 'bookshelf-read',
    furnitureId: 'bookshelf',
    furnitureName: 'Rak Buku',
    type: 'learn',
    aspect: 'intellectual',
    title: 'Membaca Buku',
    description: 'Perluas pengetahuan dengan membaca',
    duration: 90,
    energyCost: 8,
    pointsReward: 18,
    miniGame: 'quiz',
    cooldown: 1200,
    lastInteracted: null,
  },
  {
    id: 'study-learn',
    furnitureId: 'study-desk',
    furnitureName: 'Meja Belajar',
    type: 'learn',
    aspect: 'intellectual',
    title: 'Belajar Skill Baru',
    description: 'Pelajari hal-hal baru',
    duration: 120,
    energyCost: 15,
    pointsReward: 25,
    miniGame: 'quiz',
    cooldown: 3600,
    lastInteracted: null,
  },
  
  // Recreation
  {
    id: 'tv-watch',
    furnitureId: 'tv',
    furnitureName: 'Televisi',
    type: 'relax',
    aspect: 'recreation',
    title: 'Nonton Film',
    description: 'Nikmati hiburan',
    duration: 60,
    energyCost: -10, // Restores energy
    pointsReward: 8,
    miniGame: 'none',
    cooldown: 1800,
    lastInteracted: null,
  },
  {
    id: 'guitar-practice',
    furnitureId: 'guitar',
    furnitureName: 'Gitar',
    type: 'create',
    aspect: 'recreation',
    title: 'Latihan Gitar',
    description: 'Praktikkan skill musik',
    duration: 45,
    energyCost: 10,
    pointsReward: 15,
    miniGame: 'timing',
    cooldown: 900,
    lastInteracted: null,
  },
  {
    id: 'canvas-paint',
    furnitureId: 'canvas',
    furnitureName: 'Kanvas Lukis',
    type: 'create',
    aspect: 'recreation',
    title: 'Melukis',
    description: 'Ekspresikan kreativitas',
    duration: 60,
    energyCost: 12,
    pointsReward: 18,
    miniGame: 'sequence',
    cooldown: 1800,
    lastInteracted: null,
  },
  
  // Spiritual
  {
    id: 'prayer-pray',
    furnitureId: 'prayer-mat',
    furnitureName: 'Sajadah',
    type: 'meditate',
    aspect: 'spiritual',
    title: 'Ibadah',
    description: 'Tingkatkan spiritualitas',
    duration: 30,
    energyCost: 3,
    pointsReward: 20,
    miniGame: 'breathing',
    cooldown: 300,
    lastInteracted: null,
  },
  
  // Finance
  {
    id: 'chart-analyze',
    furnitureId: 'chart-frame',
    furnitureName: 'Bingkai Grafik',
    type: 'finance',
    aspect: 'finance',
    title: 'Analisis Keuangan',
    description: 'Review kondisi keuangan',
    duration: 30,
    energyCost: 8,
    pointsReward: 12,
    miniGame: 'quiz',
    cooldown: 86400, // Once per day
    lastInteracted: null,
  },
  
  // Environment
  {
    id: 'plant-water',
    furnitureId: 'plant',
    furnitureName: 'Tanaman Hias',
    type: 'garden',
    aspect: 'environment',
    title: 'Menyiram Tanaman',
    description: 'Rawat tanaman',
    duration: 15,
    energyCost: 3,
    pointsReward: 8,
    miniGame: 'timing',
    cooldown: 86400,
    lastInteracted: null,
  },
  
  // Personal
  {
    id: 'mirror-reflect',
    furnitureId: 'mirror',
    furnitureName: 'Cermin Berdiri',
    type: 'meditate',
    aspect: 'personal',
    title: 'Refleksi Diri',
    description: 'Introspeksi dan refleksi',
    duration: 30,
    energyCost: 5,
    pointsReward: 15,
    miniGame: 'breathing',
    cooldown: 600,
    lastInteracted: null,
  },
  {
    id: 'journal-write',
    furnitureId: 'journal-desk',
    furnitureName: 'Meja Jurnal',
    type: 'create',
    aspect: 'personal',
    title: 'Tulis Jurnal',
    description: 'Tuliskan pikiran dan pengalaman',
    duration: 45,
    energyCost: 5,
    pointsReward: 18,
    miniGame: 'typing',
    cooldown: 86400,
    lastInteracted: null,
  },
];

// ===========================================
// Store
// ===========================================

export const useInteractionStore = create<InteractionState>((set, get) => ({
  interactions: DEFAULT_INTERACTIONS,
  activeInteraction: null,
  interactionHistory: [],
  showInteractionPopup: false,
  selectedInteractionId: null,
  
  getInteraction: (id) => {
    return get().interactions.find(i => i.id === id);
  },
  
  getInteractionsForFurniture: (furnitureId) => {
    return get().interactions.filter(i => i.furnitureId === furnitureId);
  },
  
  startInteraction: (interactionId) => {
    const interaction = get().getInteraction(interactionId);
    if (!interaction) return false;
    
    // Check cooldown
    if (get().isOnCooldown(interactionId)) return false;
    
    set({
      activeInteraction: {
        interactionId,
        startedAt: Date.now(),
      },
      showInteractionPopup: false,
    });
    
    return true;
  },
  
  completeInteraction: (success, miniGameScore = 100) => {
    const { activeInteraction, interactions } = get();
    if (!activeInteraction) return null;
    
    const interaction = interactions.find(i => i.id === activeInteraction.interactionId);
    if (!interaction) return null;
    
    // Calculate points based on success and mini-game score
    const basePoints = success ? interaction.pointsReward : Math.floor(interaction.pointsReward * 0.3);
    const scoreMultiplier = miniGameScore / 100;
    const pointsEarned = Math.floor(basePoints * scoreMultiplier);
    const aspectBonus = success ? 5 : 1;
    
    const result: InteractionResult = {
      interactionId: interaction.id,
      success,
      pointsEarned,
      aspectBonus,
      completedAt: Date.now(),
      feedback: success 
        ? `Bagus! Kamu mendapat ${pointsEarned} poin!`
        : `Nice try! Kamu mendapat ${pointsEarned} poin.`,
    };
    
    // Update last interacted time
    set({
      interactions: interactions.map(i => 
        i.id === interaction.id 
          ? { ...i, lastInteracted: Date.now() }
          : i
      ),
      activeInteraction: null,
      interactionHistory: [result, ...get().interactionHistory].slice(0, 50),
    });
    
    return result;
  },
  
  cancelInteraction: () => {
    set({ activeInteraction: null });
  },
  
  openInteractionPopup: (furnitureId) => {
    const furnitureInteractions = get().getInteractionsForFurniture(furnitureId);
    if (furnitureInteractions.length > 0) {
      set({
        showInteractionPopup: true,
        selectedInteractionId: furnitureInteractions[0].id,
      });
    }
  },
  
  closeInteractionPopup: () => {
    set({
      showInteractionPopup: false,
      selectedInteractionId: null,
    });
  },
  
  selectInteraction: (id) => {
    set({ selectedInteractionId: id });
  },
  
  isOnCooldown: (interactionId) => {
    const interaction = get().interactions.find(i => i.id === interactionId);
    if (!interaction || !interaction.lastInteracted) return false;
    
    const elapsed = (Date.now() - interaction.lastInteracted) / 1000;
    return elapsed < interaction.cooldown;
  },
  
  getCooldownRemaining: (interactionId) => {
    const interaction = get().interactions.find(i => i.id === interactionId);
    if (!interaction || !interaction.lastInteracted) return 0;
    
    const elapsed = (Date.now() - interaction.lastInteracted) / 1000;
    const remaining = interaction.cooldown - elapsed;
    return Math.max(0, Math.ceil(remaining));
  },
}));
