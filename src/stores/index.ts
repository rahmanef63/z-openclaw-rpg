// Re-export stores
export { useLifeStore, ASPECT_NAMES } from './lifeStore';
export type { 
  LifeAspect, 
  LifeMetric, 
  ActivityLog, 
  Achievement, 
  RoomPreset,
  Trend,
} from './lifeStore';

export { useBuildStore } from './buildStore';
export type { 
  PlacedFurniture, 
  FurnitureBinding, 
  FurnitureAsset,
  Rotation,
  VisualState,
} from './buildStore';

export { useGameStore } from './gameStore';

export { useInteractionStore } from './interactionStore';
export type {
  Interaction,
  InteractionType,
  MiniGameType,
  ActiveInteraction,
  InteractionResult,
} from './interactionStore';

export { useQuestStore } from './questStore';
export type {
  Quest,
  QuestType,
  QuestStatus,
  QuestObjective,
  QuestReward,
} from './questStore';

export { useAssetLibrary } from './assetLibrary';

// Re-export furniture catalog functions
export { 
  FURNITURE_CATALOG, 
  getFurnitureById, 
  getFurnitureByCategory, 
  getFurnitureCategories,
  getGroupedFurniture,
  getMergedFurnitureCatalog,
  getGroupedFurnitureWithCustom,
  getFurnitureByIdWithCustom,
  assetToFurniture,
} from '@/data/furnitureCatalog';

// Re-export models
export type {
  Asset,
  Agent,
  GameEvent,
  OwnedAsset,
  AssetCategory,
  AssetType,
} from '@/data/models';
