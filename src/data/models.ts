// ===========================================
// Core Data Models - JSON-Based Object Oriented
// ===========================================

// Base interface for all entities
export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

// ===========================================
// ASSET TYPES
// ===========================================

export type AssetType = 
  | 'furniture'
  | 'character'
  | 'effect'
  | 'tile'
  | 'prop'
  | 'collectible';

export type AssetCategory = 
  | 'personal'
  | 'career'
  | 'finance'
  | 'physical'
  | 'mental'
  | 'social'
  | 'spiritual'
  | 'intellectual'
  | 'recreation'
  | 'environment'
  | 'decor'
  | 'utility';

export type AssetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Asset definition
export interface Asset extends BaseEntity {
  type: AssetType;
  category: AssetCategory;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn?: string;
  icon: string;              // Emoji or icon name
  sprite?: string;           // SVG path
  
  // Dimensions
  width: number;
  height: number;
  
  // Properties
  rarity: AssetRarity;
  cost: number;              // Purchase cost in points
  sellValue: number;         // Sell value
  
  // Interactions
  interactions: AssetInteraction[];
  defaultInteraction?: string;
  
  // Effects
  effects: AssetEffect[];
  
  // Connections
  connectedAgentIds: string[];
  connectedEventIds: string[];
  
  // Requirements
  requirements?: {
    level?: number;
    aspects?: Partial<Record<AssetCategory, number>>;
    prerequisites?: string[];  // Asset IDs
  };
  
  // State
  isUnlocked: boolean;
  isPremium: boolean;
  tags: string[];
}

// Interaction definition for assets
export interface AssetInteraction extends BaseEntity {
  id: string;
  assetId: string;
  
  name: string;
  nameEn: string;
  description: string;
  
  // Type
  type: InteractionType;
  category: InteractionCategory;
  
  // Timing
  duration: number;          // seconds
  cooldown: number;          // seconds
  
  // Costs & Rewards
  energyCost: number;
  moodEffect: number;
  
  pointsReward: number;
  aspectEffects: AspectEffect[];
  
  // Mini-game
  miniGameType: MiniGameType;
  miniGameConfig?: Record<string, unknown>;
  
  // Conditions
  requiredItems?: string[];  // Asset IDs
  requiredEnergy?: number;
  requiredMood?: number;
  
  // State
  lastUsed?: number;
  usageCount: number;
}

export type InteractionType = 
  | 'work'
  | 'exercise'
  | 'meditate'
  | 'socialize'
  | 'learn'
  | 'relax'
  | 'finance'
  | 'cook'
  | 'garden'
  | 'create'
  | 'interact'
  | 'collect';

export type InteractionCategory = 
  | 'productive'
  | 'recreational'
  | 'social'
  | 'spiritual'
  | 'educational';

export type MiniGameType = 
  | 'none'
  | 'timing'
  | 'memory'
  | 'sequence'
  | 'quiz'
  | 'typing'
  | 'breathing'
  | 'tap'
  | 'drag';

// Effect from asset or interaction
export interface AssetEffect {
  type: 'stat' | 'aspect' | 'resource' | 'unlock';
  target: string;
  value: number;
  duration?: number;         // seconds, for temporary effects
  isPermanent: boolean;
}

export interface AspectEffect {
  aspect: AssetCategory;
  value: number;
}

// ===========================================
// AGENT TYPES
// ===========================================

export type AgentRole = 
  | 'assistant'
  | 'mentor'
  | 'guide'
  | 'companion'
  | 'worker'
  | 'teacher';

export type AgentMood = 
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'excited'
  | 'focused'
  | 'tired';

// Agent (NPC) definition
export interface Agent extends BaseEntity {
  name: string;
  nameEn: string;
  role: AgentRole;
  description: string;
  
  // Visual
  avatar: string;            // SVG path or emoji
  color: string;
  
  // Personality
  personality: {
    openness: number;        // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  
  // State
  mood: AgentMood;
  energy: number;
  gridX: number;
  gridY: number;
  
  // Connections
  assignedAssetIds: string[];  // Furniture this agent interacts with
  eventTriggers: AgentEventTrigger[];
  
  // Dialogue
  dialogues: AgentDialogue[];
  defaultMessage: string;
  
  // Schedule
  schedule?: AgentSchedule[];
  
  // Abilities
  abilities: AgentAbility[];
  
  // Level & Progress
  level: number;
  experience: number;
  relationships: Record<string, number>; // Agent ID -> relationship score
}

export interface AgentEventTrigger {
  eventId: string;
  condition: string;
  probability: number;
}

export interface AgentDialogue {
  id: string;
  trigger: 'greeting' | 'interaction' | 'idle' | 'event' | 'mood';
  message: string;
  messageEn?: string;
  condition?: string;
}

export interface AgentSchedule {
  startTime: string;         // HH:MM
  endTime: string;
  activity: string;
  targetAssetId?: string;
}

export interface AgentAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  lastUsed?: number;
  effect: AssetEffect[];
}

// ===========================================
// EVENT TYPES
// ===========================================

export type EventType = 
  | 'scheduled'
  | 'triggered'
  | 'random'
  | 'achievement'
  | 'milestone';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

// Event definition
export interface GameEvent extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  type: EventType;
  priority: EventPriority;
  
  // Timing
  startTime?: number;
  endTime?: number;
  duration?: number;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'once';
  
  // Trigger
  triggerCondition?: EventCondition[];
  
  // Effects
  effects: EventEffect[];
  
  // Connections
  involvedAssetIds: string[];
  involvedAgentIds: string[];
  
  // Rewards
  rewards: EventReward[];
  
  // UI
  notification: {
    title: string;
    message: string;
    icon: string;
  };
  
  // State
  isActive: boolean;
  isCompleted: boolean;
  completionCount: number;
}

export interface EventCondition {
  type: 'time' | 'aspect' | 'asset' | 'agent' | 'activity' | 'streak';
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  target: string;
  value: number | string;
}

export interface EventEffect {
  type: 'spawn' | 'transform' | 'buff' | 'debuff' | 'unlock' | 'message';
  target: 'player' | 'asset' | 'agent' | 'aspect';
  targetId?: string;
  value: unknown;
}

export interface EventReward {
  type: 'points' | 'aspect' | 'asset' | 'agent' | 'achievement';
  value: number | string;
  quantity?: number;
}

// ===========================================
// QUEST TYPES (Updated)
// ===========================================

export type QuestType = 'daily' | 'weekly' | 'main' | 'side' | 'special';

export interface Quest extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  type: QuestType;
  
  // Objectives
  objectives: QuestObjective[];
  
  // Rewards
  rewards: QuestReward[];
  
  // Requirements
  prerequisites: string[];
  requiredLevel?: number;
  requiredAspects?: Partial<Record<AssetCategory, number>>;
  
  // Timing
  expiresAt?: number;
  
  // Connections
  relatedAssetIds: string[];
  relatedAgentIds: string[];
  relatedEventIds: string[];
  
  // State
  status: QuestStatus;
  progress: number;
  startedAt?: number;
  completedAt?: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'interact' | 'collect' | 'reach' | 'complete' | 'streak';
  target: string;
  targetId?: string;
  current: number;
  required: number;
}

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';

export interface QuestReward {
  type: 'points' | 'aspect' | 'asset' | 'agent' | 'achievement' | 'experience';
  value: number | string;
  quantity?: number;
}

// ===========================================
// USER DATA
// ===========================================

export interface UserProgress extends BaseEntity {
  // Stats
  level: number;
  experience: number;
  totalPoints: number;
  currentPoints: number;
  
  // Aspects
  aspects: Record<AssetCategory, AspectProgress>;
  
  // Streaks
  dailyStreak: number;
  lastActiveDate: string;
  
  // Collections
  ownedAssets: OwnedAsset[];
  unlockedAssets: string[];
  
  // Agents
  ownedAgents: string[];
  activeAgentIds: string[];
  
  // Quests
  activeQuestIds: string[];
  completedQuestIds: string[];
  
  // Events
  activeEventIds: string[];
  completedEventIds: string[];
  
  // Achievements
  unlockedAchievements: string[];
  
  // Statistics
  statistics: UserStatistics;
}

export interface AspectProgress {
  score: number;
  trend: 'up' | 'down' | 'stable';
  experience: number;
  weeklyProgress: number[];
}

export interface OwnedAsset {
  assetId: string;
  instanceId: string;
  gridX: number;
  gridY: number;
  rotation: number;
  placedAt: number;
  lastInteracted?: number;
  interactionCount: number;
  state: 'default' | 'active' | 'damaged' | 'upgraded';
  upgrades: string[];
}

export interface UserStatistics {
  totalInteractions: number;
  totalPlayTime: number;
  totalQuestsCompleted: number;
  totalEventsParticipated: number;
  longestStreak: number;
  favoriteAspect: AssetCategory;
}
