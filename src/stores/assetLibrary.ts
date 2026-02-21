'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Asset, 
  Agent, 
  GameEvent, 
  Quest,
  AssetInteraction,
  AssetCategory,
  OwnedAsset,
} from '@/data/models';

// ===========================================
// ASSET LIBRARY STATE
// ===========================================

interface AssetLibraryState {
  // Collections
  assets: Asset[];
  agents: Agent[];
  events: GameEvent[];
  quests: Quest[];
  
  // User owned items
  ownedAssets: OwnedAsset[];
  
  // UI State
  selectedAssetId: string | null;
  selectedAgentId: string | null;
  selectedEventId: string | null;
  selectedQuestId: string | null;
  
  // Filters
  filterCategory: AssetCategory | 'all';
  filterType: string;
  searchTerm: string;
  
  // ==========================================
  // ASSET CRUD
  // ==========================================
  
  // Create
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Asset;
  
  // Read
  getAsset: (id: string) => Asset | undefined;
  getAssetsByCategory: (category: AssetCategory) => Asset[];
  getAssetsByType: (type: string) => Asset[];
  searchAssets: (term: string) => Asset[];
  getFilteredAssets: () => Asset[];
  
  // Update
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  addInteractionToAsset: (assetId: string, interaction: Omit<AssetInteraction, 'id' | 'createdAt' | 'updatedAt' | 'assetId'>) => void;
  removeInteractionFromAsset: (assetId: string, interactionId: string) => void;
  connectAssetToAgent: (assetId: string, agentId: string) => void;
  disconnectAssetFromAgent: (assetId: string, agentId: string) => void;
  connectAssetToEvent: (assetId: string, eventId: string) => void;
  disconnectAssetFromEvent: (assetId: string, eventId: string) => void;
  
  // Delete
  removeAsset: (id: string) => void;
  
  // ==========================================
  // AGENT CRUD
  // ==========================================
  
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Agent;
  getAgent: (id: string) => Agent | undefined;
  getAllAgents: () => Agent[];
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  assignAssetToAgent: (agentId: string, assetId: string) => void;
  unassignAssetFromAgent: (agentId: string, assetId: string) => void;
  
  // ==========================================
  // EVENT CRUD
  // ==========================================
  
  addEvent: (event: Omit<GameEvent, 'id' | 'createdAt' | 'updatedAt'>) => GameEvent;
  getEvent: (id: string) => GameEvent | undefined;
  getAllEvents: () => GameEvent[];
  getActiveEvents: () => GameEvent[];
  updateEvent: (id: string, updates: Partial<GameEvent>) => void;
  removeEvent: (id: string) => void;
  linkAssetToEvent: (eventId: string, assetId: string) => void;
  unlinkAssetFromEvent: (eventId: string, assetId: string) => void;
  linkAgentToEvent: (eventId: string, agentId: string) => void;
  unlinkAgentFromEvent: (eventId: string, agentId: string) => void;
  
  // ==========================================
  // QUEST CRUD
  // ==========================================
  
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => Quest;
  getQuest: (id: string) => Quest | undefined;
  getAllQuests: () => Quest[];
  getActiveQuests: () => Quest[];
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  removeQuest: (id: string) => void;
  
  // ==========================================
  // OWNED ASSETS
  // ==========================================
  
  purchaseAsset: (assetId: string) => boolean;
  placeAsset: (assetId: string, gridX: number, gridY: number, rotation: number) => OwnedAsset | null;
  moveAsset: (instanceId: string, gridX: number, gridY: number) => void;
  rotateAsset: (instanceId: string, rotation: number) => void;
  removePlacedAsset: (instanceId: string) => void;
  getPlacedAssets: () => OwnedAsset[];
  
  // ==========================================
  // UI & FILTERS
  // ==========================================
  
  selectAsset: (id: string | null) => void;
  selectAgent: (id: string | null) => void;
  selectEvent: (id: string | null) => void;
  selectQuest: (id: string | null) => void;
  setFilterCategory: (category: AssetCategory | 'all') => void;
  setFilterType: (type: string) => void;
  setSearchTerm: (term: string) => void;
  
  // ==========================================
  // IMPORT/EXPORT
  // ==========================================
  
  exportToJSON: () => string;
  importFromJSON: (json: string) => boolean;
  
  // ==========================================
  // RESET
  // ==========================================
  
  resetToDefaults: () => void;
}

// ===========================================
// DEFAULT DATA
// ===========================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_ASSETS: Asset[] = [
  // CAREER ASSETS
  {
    id: 'asset-desk-001',
    type: 'furniture',
    category: 'career',
    name: 'Meja Kerja Utama',
    nameEn: 'Main Desk',
    description: 'Pusat produktivitas dan pekerjaan',
    icon: '🖥️',
    width: 3,
    height: 2,
    rarity: 'common',
    cost: 100,
    sellValue: 50,
    interactions: [],
    effects: [{ type: 'aspect', target: 'career', value: 1, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['work', 'productivity', 'career'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'asset-whiteboard-001',
    type: 'furniture',
    category: 'career',
    name: 'Papan Putih',
    nameEn: 'Whiteboard',
    description: 'Untuk brainstorming dan perencanaan',
    icon: '📝',
    width: 2,
    height: 1,
    rarity: 'common',
    cost: 75,
    sellValue: 35,
    interactions: [],
    effects: [{ type: 'aspect', target: 'career', value: 0.5, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['planning', 'brainstorm', 'career'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  
  // PHYSICAL ASSETS
  {
    id: 'asset-exercisemat-001',
    type: 'furniture',
    category: 'physical',
    name: 'Matras Olahraga',
    nameEn: 'Exercise Mat',
    description: 'Untuk workout dan yoga',
    icon: '🧘',
    width: 2,
    height: 1,
    rarity: 'common',
    cost: 50,
    sellValue: 25,
    interactions: [],
    effects: [{ type: 'aspect', target: 'physical', value: 1, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['fitness', 'health', 'physical'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'asset-kitchen-001',
    type: 'furniture',
    category: 'physical',
    name: 'Dapur Kecil',
    nameEn: 'Small Kitchen',
    description: 'Untuk menyiapkan makanan sehat',
    icon: '🍳',
    width: 2,
    height: 2,
    rarity: 'uncommon',
    cost: 200,
    sellValue: 100,
    interactions: [],
    effects: [{ type: 'aspect', target: 'physical', value: 1.5, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['cooking', 'nutrition', 'physical'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  
  // MENTAL ASSETS
  {
    id: 'asset-sofa-001',
    type: 'furniture',
    category: 'mental',
    name: 'Sofa Nyaman',
    nameEn: 'Cozy Sofa',
    description: 'Tempat bersantai dan melepas penat',
    icon: '🛋️',
    width: 3,
    height: 1,
    rarity: 'common',
    cost: 150,
    sellValue: 75,
    interactions: [],
    effects: [{ type: 'aspect', target: 'mental', value: 1, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['relax', 'rest', 'mental'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  
  // INTELLECTUAL ASSETS
  {
    id: 'asset-bookshelf-001',
    type: 'furniture',
    category: 'intellectual',
    name: 'Rak Buku',
    nameEn: 'Bookshelf',
    description: 'Koleksi buku dan pengetahuan',
    icon: '📚',
    width: 2,
    height: 3,
    rarity: 'common',
    cost: 100,
    sellValue: 50,
    interactions: [],
    effects: [{ type: 'aspect', target: 'intellectual', value: 1, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['reading', 'learning', 'intellectual'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  
  // SOCIAL ASSETS
  {
    id: 'asset-coffeetable-001',
    type: 'furniture',
    category: 'social',
    name: 'Meja Kopi',
    nameEn: 'Coffee Table',
    description: 'Tempat ngobrol dan bersosialisasi',
    icon: '☕',
    width: 2,
    height: 1,
    rarity: 'common',
    cost: 75,
    sellValue: 35,
    interactions: [],
    effects: [{ type: 'aspect', target: 'social', value: 1, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['social', 'gathering', 'chat'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  
  // RECREATION ASSETS
  {
    id: 'asset-tv-001',
    type: 'furniture',
    category: 'recreation',
    name: 'Televisi',
    nameEn: 'TV',
    description: 'Untuk hiburan dan relaksasi',
    icon: '📺',
    width: 2,
    height: 1,
    rarity: 'common',
    cost: 200,
    sellValue: 100,
    interactions: [],
    effects: [{ type: 'aspect', target: 'recreation', value: 1, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['entertainment', 'leisure', 'recreation'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'asset-guitar-001',
    type: 'furniture',
    category: 'recreation',
    name: 'Gitar',
    nameEn: 'Guitar',
    description: 'Untuk bermain musik dan kreativitas',
    icon: '🎸',
    width: 1,
    height: 2,
    rarity: 'uncommon',
    cost: 150,
    sellValue: 75,
    interactions: [],
    effects: [{ type: 'aspect', target: 'recreation', value: 1.5, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['music', 'creativity', 'recreation'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  
  // SPIRITUAL ASSETS
  {
    id: 'asset-prayermat-001',
    type: 'furniture',
    category: 'spiritual',
    name: 'Sajadah',
    nameEn: 'Prayer Mat',
    description: 'Untuk ibadah dan spiritualitas',
    icon: '🕌',
    width: 1,
    height: 2,
    rarity: 'common',
    cost: 50,
    sellValue: 25,
    interactions: [],
    effects: [{ type: 'aspect', target: 'spiritual', value: 1.5, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['prayer', 'meditation', 'spiritual'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  
  // ENVIRONMENT ASSETS
  {
    id: 'asset-plant-001',
    type: 'furniture',
    category: 'environment',
    name: 'Tanaman Hias',
    nameEn: 'Decorative Plant',
    description: 'Untuk menyegarkan udara dan dekorasi',
    icon: '🪴',
    width: 1,
    height: 1,
    rarity: 'common',
    cost: 30,
    sellValue: 15,
    interactions: [],
    effects: [{ type: 'aspect', target: 'environment', value: 1, isPermanent: false }],
    connectedAgentIds: [],
    connectedEventIds: [],
    isUnlocked: true,
    isPremium: false,
    tags: ['nature', 'decor', 'environment'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent-aria-001',
    name: 'ARIA',
    nameEn: 'ARIA',
    role: 'assistant',
    description: 'Asisten virtual yang membantu mengelola ruang dan aktivitas',
    avatar: '🤖',
    color: '#ff00ff',
    personality: {
      openness: 80,
      conscientiousness: 90,
      extraversion: 70,
      agreeableness: 85,
      neuroticism: 20,
    },
    mood: 'happy',
    energy: 100,
    gridX: 5,
    gridY: 5,
    assignedAssetIds: [],
    eventTriggers: [],
    dialogues: [
      { id: 'd1', trigger: 'greeting', message: 'Halo! Ada yang bisa saya bantu?' },
      { id: 'd2', trigger: 'idle', message: 'Saya siap membantu kapan saja!' },
    ],
    defaultMessage: 'Saya sedang memproses...',
    abilities: [],
    level: 1,
    experience: 0,
    relationships: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// ===========================================
// STORE
// ===========================================

export const useAssetLibrary = create<AssetLibraryState>()(
  persist(
    (set, get) => ({
      // Initial State
      assets: DEFAULT_ASSETS,
      agents: DEFAULT_AGENTS,
      events: [],
      quests: [],
      ownedAssets: [],
      selectedAssetId: null,
      selectedAgentId: null,
      selectedEventId: null,
      selectedQuestId: null,
      filterCategory: 'all',
      filterType: 'all',
      searchTerm: '',
      
      // ==========================================
      // ASSET CRUD
      // ==========================================
      
      addAsset: (assetData) => {
        const newAsset: Asset = {
          ...assetData,
          id: `asset-${generateId()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({ assets: [...state.assets, newAsset] }));
        return newAsset;
      },
      
      getAsset: (id) => get().assets.find(a => a.id === id),
      
      getAssetsByCategory: (category) => get().assets.filter(a => a.category === category),
      
      getAssetsByType: (type) => get().assets.filter(a => a.type === type),
      
      searchAssets: (term) => {
        const lower = term.toLowerCase();
        return get().assets.filter(a => 
          a.name.toLowerCase().includes(lower) ||
          a.nameEn.toLowerCase().includes(lower) ||
          a.tags.some(t => t.toLowerCase().includes(lower))
        );
      },
      
      getFilteredAssets: () => {
        const { assets, filterCategory, searchTerm } = get();
        let filtered = assets;
        
        if (filterCategory !== 'all') {
          filtered = filtered.filter(a => a.category === filterCategory);
        }
        
        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(lower) ||
            a.nameEn.toLowerCase().includes(lower)
          );
        }
        
        return filtered;
      },
      
      updateAsset: (id, updates) => {
        set(state => ({
          assets: state.assets.map(a =>
            a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
          ),
        }));
      },
      
      addInteractionToAsset: (assetId, interactionData) => {
        const interaction: AssetInteraction = {
          ...interactionData,
          id: `interaction-${generateId()}`,
          assetId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({
          assets: state.assets.map(a =>
            a.id === assetId
              ? { ...a, interactions: [...a.interactions, interaction], updatedAt: Date.now() }
              : a
          ),
        }));
      },
      
      removeInteractionFromAsset: (assetId, interactionId) => {
        set(state => ({
          assets: state.assets.map(a =>
            a.id === assetId
              ? { ...a, interactions: a.interactions.filter(i => i.id !== interactionId), updatedAt: Date.now() }
              : a
          ),
        }));
      },
      
      connectAssetToAgent: (assetId, agentId) => {
        set(state => ({
          assets: state.assets.map(a =>
            a.id === assetId && !a.connectedAgentIds.includes(agentId)
              ? { ...a, connectedAgentIds: [...a.connectedAgentIds, agentId], updatedAt: Date.now() }
              : a
          ),
        }));
      },
      
      disconnectAssetFromAgent: (assetId, agentId) => {
        set(state => ({
          assets: state.assets.map(a =>
            a.id === assetId
              ? { ...a, connectedAgentIds: a.connectedAgentIds.filter(id => id !== agentId), updatedAt: Date.now() }
              : a
          ),
        }));
      },
      
      connectAssetToEvent: (assetId, eventId) => {
        set(state => ({
          assets: state.assets.map(a =>
            a.id === assetId && !a.connectedEventIds.includes(eventId)
              ? { ...a, connectedEventIds: [...a.connectedEventIds, eventId], updatedAt: Date.now() }
              : a
          ),
        }));
      },
      
      disconnectAssetFromEvent: (assetId, eventId) => {
        set(state => ({
          assets: state.assets.map(a =>
            a.id === assetId
              ? { ...a, connectedEventIds: a.connectedEventIds.filter(id => id !== eventId), updatedAt: Date.now() }
              : a
          ),
        }));
      },
      
      removeAsset: (id) => {
        set(state => ({ assets: state.assets.filter(a => a.id !== id) }));
      },
      
      // ==========================================
      // AGENT CRUD
      // ==========================================
      
      addAgent: (agentData) => {
        const newAgent: Agent = {
          ...agentData,
          id: `agent-${generateId()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({ agents: [...state.agents, newAgent] }));
        return newAgent;
      },
      
      getAgent: (id) => get().agents.find(a => a.id === id),
      
      getAllAgents: () => get().agents,
      
      updateAgent: (id, updates) => {
        set(state => ({
          agents: state.agents.map(a =>
            a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
          ),
        }));
      },
      
      removeAgent: (id) => {
        set(state => ({ agents: state.agents.filter(a => a.id !== id) }));
      },
      
      assignAssetToAgent: (agentId, assetId) => {
        set(state => ({
          agents: state.agents.map(a =>
            a.id === agentId && !a.assignedAssetIds.includes(assetId)
              ? { ...a, assignedAssetIds: [...a.assignedAssetIds, assetId], updatedAt: Date.now() }
              : a
          ),
        }));
        get().connectAssetToAgent(assetId, agentId);
      },
      
      unassignAssetFromAgent: (agentId, assetId) => {
        set(state => ({
          agents: state.agents.map(a =>
            a.id === agentId
              ? { ...a, assignedAssetIds: a.assignedAssetIds.filter(id => id !== assetId), updatedAt: Date.now() }
              : a
          ),
        }));
        get().disconnectAssetFromAgent(assetId, agentId);
      },
      
      // ==========================================
      // EVENT CRUD
      // ==========================================
      
      addEvent: (eventData) => {
        const newEvent: GameEvent = {
          ...eventData,
          id: `event-${generateId()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({ events: [...state.events, newEvent] }));
        return newEvent;
      },
      
      getEvent: (id) => get().events.find(e => e.id === id),
      
      getAllEvents: () => get().events,
      
      getActiveEvents: () => get().events.filter(e => e.isActive && !e.isCompleted),
      
      updateEvent: (id, updates) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
          ),
        }));
      },
      
      removeEvent: (id) => {
        set(state => ({ events: state.events.filter(e => e.id !== id) }));
      },
      
      linkAssetToEvent: (eventId, assetId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId && !e.involvedAssetIds.includes(assetId)
              ? { ...e, involvedAssetIds: [...e.involvedAssetIds, assetId], updatedAt: Date.now() }
              : e
          ),
        }));
        get().connectAssetToEvent(assetId, eventId);
      },
      
      unlinkAssetFromEvent: (eventId, assetId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId
              ? { ...e, involvedAssetIds: e.involvedAssetIds.filter(id => id !== assetId), updatedAt: Date.now() }
              : e
          ),
        }));
        get().disconnectAssetFromEvent(assetId, eventId);
      },
      
      linkAgentToEvent: (eventId, agentId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId && !e.involvedAgentIds.includes(agentId)
              ? { ...e, involvedAgentIds: [...e.involvedAgentIds, agentId], updatedAt: Date.now() }
              : e
          ),
        }));
      },
      
      unlinkAgentFromEvent: (eventId, agentId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId
              ? { ...e, involvedAgentIds: e.involvedAgentIds.filter(id => id !== agentId), updatedAt: Date.now() }
              : e
          ),
        }));
      },
      
      // ==========================================
      // QUEST CRUD
      // ==========================================
      
      addQuest: (questData) => {
        const newQuest: Quest = {
          ...questData,
          id: `quest-${generateId()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({ quests: [...state.quests, newQuest] }));
        return newQuest;
      },
      
      getQuest: (id) => get().quests.find(q => q.id === id),
      
      getAllQuests: () => get().quests,
      
      getActiveQuests: () => get().quests.filter(q => q.status === 'active'),
      
      updateQuest: (id, updates) => {
        set(state => ({
          quests: state.quests.map(q =>
            q.id === id ? { ...q, ...updates, updatedAt: Date.now() } : q
          ),
        }));
      },
      
      removeQuest: (id) => {
        set(state => ({ quests: state.quests.filter(q => q.id !== id) }));
      },
      
      // ==========================================
      // OWNED ASSETS
      // ==========================================
      
      purchaseAsset: (assetId) => {
        const asset = get().getAsset(assetId);
        if (!asset || !asset.isUnlocked) return false;
        
        const owned: OwnedAsset = {
          assetId,
          instanceId: `owned-${generateId()}`,
          gridX: -1,
          gridY: -1,
          rotation: 0,
          placedAt: 0,
          interactionCount: 0,
          state: 'default',
          upgrades: [],
        };
        
        set(state => ({ ownedAssets: [...state.ownedAssets, owned] }));
        return true;
      },
      
      placeAsset: (assetId, gridX, gridY, rotation) => {
        const owned = get().ownedAssets.find(o => o.assetId === assetId && o.gridX === -1);
        if (!owned) return null;
        
        const updated: OwnedAsset = {
          ...owned,
          gridX,
          gridY,
          rotation,
          placedAt: Date.now(),
        };
        
        set(state => ({
          ownedAssets: state.ownedAssets.map(o => o.instanceId === owned.instanceId ? updated : o),
        }));
        
        return updated;
      },
      
      moveAsset: (instanceId, gridX, gridY) => {
        set(state => ({
          ownedAssets: state.ownedAssets.map(o =>
            o.instanceId === instanceId ? { ...o, gridX, gridY } : o
          ),
        }));
      },
      
      rotateAsset: (instanceId, rotation) => {
        set(state => ({
          ownedAssets: state.ownedAssets.map(o =>
            o.instanceId === instanceId ? { ...o, rotation } : o
          ),
        }));
      },
      
      removePlacedAsset: (instanceId) => {
        set(state => ({
          ownedAssets: state.ownedAssets.map(o =>
            o.instanceId === instanceId ? { ...o, gridX: -1, gridY: -1, placedAt: 0 } : o
          ),
        }));
      },
      
      getPlacedAssets: () => get().ownedAssets.filter(o => o.gridX >= 0),
      
      // ==========================================
      // UI & FILTERS
      // ==========================================
      
      selectAsset: (id) => set({ selectedAssetId: id }),
      selectAgent: (id) => set({ selectedAgentId: id }),
      selectEvent: (id) => set({ selectedEventId: id }),
      selectQuest: (id) => set({ selectedQuestId: id }),
      setFilterCategory: (category) => set({ filterCategory: category }),
      setFilterType: (type) => set({ filterType: type }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // ==========================================
      // IMPORT/EXPORT
      // ==========================================
      
      exportToJSON: () => {
        const { assets, agents, events, quests, ownedAssets } = get();
        return JSON.stringify({ assets, agents, events, quests, ownedAssets }, null, 2);
      },
      
      importFromJSON: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.assets) set({ assets: data.assets });
          if (data.agents) set({ agents: data.agents });
          if (data.events) set({ events: data.events });
          if (data.quests) set({ quests: data.quests });
          if (data.ownedAssets) set({ ownedAssets: data.ownedAssets });
          return true;
        } catch {
          return false;
        }
      },
      
      // ==========================================
      // RESET
      // ==========================================
      
      resetToDefaults: () => {
        set({
          assets: DEFAULT_ASSETS,
          agents: DEFAULT_AGENTS,
          events: [],
          quests: [],
          ownedAssets: [],
        });
      },
    }),
    {
      name: 'superspace-asset-library',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assets: state.assets,
        agents: state.agents,
        events: state.events,
        quests: state.quests,
        ownedAssets: state.ownedAssets,
      }),
    }
  )
);
