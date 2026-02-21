'use client';

import { create } from 'zustand';

// ===========================================
// SOUND TYPES
// ===========================================

export type SoundCategory = 
  | 'ui'
  | 'interaction'
  | 'ambient'
  | 'achievement'
  | 'notification'
  | 'movement';

export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  src: string;
  volume: number;
  loop: boolean;
  preload: boolean;
}

export interface SoundState {
  isMuted: boolean;
  masterVolume: number;
  categoryVolumes: Record<SoundCategory, number>;
  currentlyPlaying: string[];
}

// ===========================================
// SOUND LIBRARY
// ===========================================

const SOUND_LIBRARY: Sound[] = [
  // UI Sounds
  { id: 'click', name: 'Click', category: 'ui', src: '', volume: 0.5, loop: false, preload: true },
  { id: 'hover', name: 'Hover', category: 'ui', src: '', volume: 0.3, loop: false, preload: true },
  { id: 'open', name: 'Open Panel', category: 'ui', src: '', volume: 0.6, loop: false, preload: true },
  { id: 'close', name: 'Close Panel', category: 'ui', src: '', volume: 0.6, loop: false, preload: true },
  { id: 'error', name: 'Error', category: 'ui', src: '', volume: 0.7, loop: false, preload: true },
  
  // Interaction Sounds
  { id: 'place', name: 'Place Item', category: 'interaction', src: '', volume: 0.6, loop: false, preload: true },
  { id: 'pickup', name: 'Pick Up', category: 'interaction', src: '', volume: 0.5, loop: false, preload: true },
  { id: 'rotate', name: 'Rotate', category: 'interaction', src: '', volume: 0.4, loop: false, preload: true },
  { id: 'delete', name: 'Delete', category: 'interaction', src: '', volume: 0.5, loop: false, preload: true },
  { id: 'success', name: 'Success', category: 'interaction', src: '', volume: 0.7, loop: false, preload: true },
  
  // Achievement Sounds
  { id: 'achievement', name: 'Achievement Unlocked', category: 'achievement', src: '', volume: 0.8, loop: false, preload: true },
  { id: 'levelup', name: 'Level Up', category: 'achievement', src: '', volume: 0.9, loop: false, preload: true },
  { id: 'quest_complete', name: 'Quest Complete', category: 'achievement', src: '', volume: 0.8, loop: false, preload: true },
  
  // Notification Sounds
  { id: 'notification', name: 'Notification', category: 'notification', src: '', volume: 0.6, loop: false, preload: true },
  { id: 'message', name: 'Message', category: 'notification', src: '', volume: 0.5, loop: false, preload: true },
  
  // Movement Sounds
  { id: 'step', name: 'Footstep', category: 'movement', src: '', volume: 0.3, loop: false, preload: true },
  
  // Ambient Sounds
  { id: 'ambient_day', name: 'Day Ambient', category: 'ambient', src: '', volume: 0.2, loop: true, preload: false },
  { id: 'ambient_night', name: 'Night Ambient', category: 'ambient', src: '', volume: 0.15, loop: true, preload: false },
];

// ===========================================
// SOUND MANAGER STORE
// ===========================================

interface SoundManagerState extends SoundState {
  // Actions
  toggleMute: () => void;
  setMasterVolume: (volume: number) => void;
  setCategoryVolume: (category: SoundCategory, volume: number) => void;
  
  // Sound playback
  play: (soundId: string) => void;
  stop: (soundId: string) => void;
  stopAll: () => void;
  
  // Utility
  getSound: (id: string) => Sound | undefined;
}

// Audio context cache
const audioCache: Map<string, HTMLAudioElement> = new Map();

export const useSoundManager = create<SoundManagerState>((set, get) => ({
  isMuted: false,
  masterVolume: 0.7,
  categoryVolumes: {
    ui: 0.8,
    interaction: 0.8,
    ambient: 0.5,
    achievement: 1.0,
    notification: 0.7,
    movement: 0.6,
  },
  currentlyPlaying: [],
  
  toggleMute: () => {
    set(state => ({ isMuted: !state.isMuted }));
  },
  
  setMasterVolume: (volume) => {
    set({ masterVolume: Math.max(0, Math.min(1, volume)) });
  },
  
  setCategoryVolume: (category, volume) => {
    set(state => ({
      categoryVolumes: { ...state.categoryVolumes, [category]: Math.max(0, Math.min(1, volume)) },
    }));
  },
  
  play: (soundId) => {
    const { isMuted, masterVolume, categoryVolumes } = get();
    if (isMuted) return;
    
    const sound = SOUND_LIBRARY.find(s => s.id === soundId);
    if (!sound) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }
    
    // Calculate final volume
    const finalVolume = masterVolume * categoryVolumes[sound.category] * sound.volume;
    
    // Get or create audio element
    let audio = audioCache.get(soundId);
    if (!audio) {
      // For now, we'll skip actual audio since we don't have audio files
      // In production, this would load the actual audio file
      return;
    }
    
    // Set volume and play
    audio.volume = finalVolume;
    audio.currentTime = 0;
    audio.play().catch(err => console.warn('Audio play failed:', err));
    
    // Track currently playing
    set(state => ({
      currentlyPlaying: [...state.currentlyPlaying, soundId],
    }));
    
    // Remove from currently playing when ended
    audio.onended = () => {
      set(state => ({
        currentlyPlaying: state.currentlyPlaying.filter(id => id !== soundId),
      }));
    };
  },
  
  stop: (soundId) => {
    const audio = audioCache.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    set(state => ({
      currentlyPlaying: state.currentlyPlaying.filter(id => id !== soundId),
    }));
  },
  
  stopAll: () => {
    const { currentlyPlaying } = get();
    currentlyPlaying.forEach(id => {
      const audio = audioCache.get(id);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    set({ currentlyPlaying: [] });
  },
  
  getSound: (id) => SOUND_LIBRARY.find(s => s.id === id),
}));

// ===========================================
// SOUND HOOK
// ===========================================

export function useSound(soundId: string) {
  const { play, stop, getSound, isMuted, masterVolume, categoryVolumes } = useSoundManager();
  
  const sound = getSound(soundId);
  
  const playSound = () => {
    if (!isMuted && sound) {
      play(soundId);
    }
  };
  
  const stopSound = () => {
    stop(soundId);
  };
  
  const volume = sound 
    ? masterVolume * categoryVolumes[sound.category] * sound.volume 
    : 0;
  
  return {
    play: playSound,
    stop: stopSound,
    volume,
    isMuted,
    sound,
  };
}

// ===========================================
// SOUND EFFECTS COMPONENT
// ===========================================

interface SoundEffectsProps {
  children?: React.ReactNode;
}

export function SoundEffects({ children }: SoundEffectsProps) {
  return (
    <SoundEffectProvider>
      {children}
    </SoundEffectProvider>
  );
}

function SoundEffectProvider({ children }: { children?: React.ReactNode }) {
  // This component can be used to wrap the app and handle global sound effects
  return <>{children}</>;
}

// ===========================================
// PREDEFINED SOUND EFFECTS
// ===========================================

export const soundEffectActions = {
  // UI
  click: () => useSoundManager.getState().play('click'),
  hover: () => useSoundManager.getState().play('hover'),
  open: () => useSoundManager.getState().play('open'),
  close: () => useSoundManager.getState().play('close'),
  error: () => useSoundManager.getState().play('error'),
  
  // Interaction
  place: () => useSoundManager.getState().play('place'),
  pickup: () => useSoundManager.getState().play('pickup'),
  rotate: () => useSoundManager.getState().play('rotate'),
  delete: () => useSoundManager.getState().play('delete'),
  success: () => useSoundManager.getState().play('success'),
  
  // Achievement
  achievement: () => useSoundManager.getState().play('achievement'),
  levelUp: () => useSoundManager.getState().play('levelup'),
  questComplete: () => useSoundManager.getState().play('quest_complete'),
  
  // Notification
  notification: () => useSoundManager.getState().play('notification'),
  message: () => useSoundManager.getState().play('message'),
  
  // Movement
  step: () => useSoundManager.getState().play('step'),
};
