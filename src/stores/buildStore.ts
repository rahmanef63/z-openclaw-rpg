'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LifeAspect } from './lifeStore';
import { getRotatedDimensions } from '@/lib/gameUtils';

// ===========================================
// Types
// ===========================================

export type Rotation = 0 | 90 | 180 | 270;
export type VisualState = 'default' | 'warning' | 'critical' | 'positive';

export interface FurnitureBinding {
  moduleType: string;
  dataPath?: string;
  metricName?: string;
  thresholds?: {
    warning: number;
    critical: number;
    positive: number;
  };
  alertsEnabled: boolean;
}

export interface PlacedFurniture {
  id: string;
  assetId: string;
  gridX: number;
  gridY: number;
  rotation: Rotation;
  aspectCategory: LifeAspect;
  binding?: FurnitureBinding;
  visualState: VisualState;
  name: string;
  nameEn: string;
  width: number;
  height: number;
  interactable: boolean;
}

export interface FurnitureAsset {
  id: string;
  name: string;
  nameEn: string;
  category: LifeAspect;
  width: number;
  height: number;
  icon: string;
  description: string;
  interactions?: string[];
  defaultBinding?: Partial<FurnitureBinding>;
}

// ===========================================
// Store State
// ===========================================

interface BuildState {
  // Mode
  isBuildMode: boolean;
  
  // Selection
  selectedAssetId: string | null;
  selectedPlacedId: string | null;
  hoveredCell: { x: number; y: number } | null;
  
  // Furniture
  placedFurniture: PlacedFurniture[];
  rotation: Rotation;
  
  // Grid settings
  gridWidth: number;
  gridHeight: number;
  
  // Preview
  showPreview: boolean;
  validPlacement: boolean;
  
  // Actions - Mode
  toggleBuildMode: () => void;
  setBuildMode: (mode: boolean) => void;
  
  // Actions - Selection
  selectAsset: (assetId: string | null) => void;
  selectPlaced: (placedId: string | null) => void;
  setHoveredCell: (cell: { x: number; y: number } | null) => void;
  
  // Actions - Rotation
  setRotation: (rotation: Rotation) => void;
  rotateClockwise: () => void;
  rotateCounterClockwise: () => void;
  
  // Actions - Furniture
  placeFurniture: (asset: {
    assetId: string;
    gridX: number;
    gridY: number;
    aspectCategory: LifeAspect;
    name: string;
    nameEn: string;
    width: number;
    height: number;
  }) => boolean;
  removeFurniture: (id: string) => void;
  updateFurniturePosition: (id: string, gridX: number, gridY: number) => void;
  updateFurnitureBinding: (id: string, binding: FurnitureBinding) => void;
  updateFurnitureState: (id: string, state: VisualState) => void;
  clearAllFurniture: () => void;
  
  // Actions - Preview
  setShowPreview: (show: boolean) => void;
  setValidPlacement: (valid: boolean) => void;
  
  // Helpers
  getFurnitureAt: (gridX: number, gridY: number) => PlacedFurniture | undefined;
  isCellOccupied: (gridX: number, gridY: number, excludeId?: string) => boolean;
  getFurnitureInBounds: (x: number, y: number, width: number, height: number) => PlacedFurniture[];
}

// ===========================================
// Counter
// ===========================================

let furnitureCounter = 0;

// ===========================================
// Store
// ===========================================

export const useBuildStore = create<BuildState>()(
  persist(
    (set, get) => ({
      isBuildMode: false,
      selectedAssetId: null,
      selectedPlacedId: null,
      hoveredCell: null,
      placedFurniture: [],
      rotation: 0,
      gridWidth: 20,
      gridHeight: 20,
      showPreview: false,
      validPlacement: false,
      
      toggleBuildMode: () => set(state => ({ isBuildMode: !state.isBuildMode })),
      setBuildMode: (mode) => set({ isBuildMode: mode }),
      
      selectAsset: (assetId) => set({ selectedAssetId: assetId, selectedPlacedId: null }),
      selectPlaced: (placedId) => set({ selectedPlacedId: placedId, selectedAssetId: null }),
      setHoveredCell: (cell) => set({ hoveredCell: cell }),
      
      setRotation: (rotation) => set({ rotation }),
      
      rotateClockwise: () => {
        const { rotation } = get();
        const newRotation = ((rotation + 90) % 360) as Rotation;
        set({ rotation: newRotation });
      },
      
      rotateCounterClockwise: () => {
        const { rotation } = get();
        const newRotation = ((rotation - 90 + 360) % 360) as Rotation;
        set({ rotation: newRotation });
      },
      
      placeFurniture: (asset) => {
        const { rotation, placedFurniture, gridWidth, gridHeight } = get();
        
        const { width, height } = getRotatedDimensions(asset.width, asset.height, rotation);
        
        // Check bounds
        if (asset.gridX < 0 || asset.gridY < 0 || 
            asset.gridX + width > gridWidth || 
            asset.gridY + height > gridHeight) {
          return false;
        }
        
        // Check for collision
        for (let dx = 0; dx < width; dx++) {
          for (let dy = 0; dy < height; dy++) {
            if (get().isCellOccupied(asset.gridX + dx, asset.gridY + dy)) {
              return false;
            }
          }
        }
        
        const newFurniture: PlacedFurniture = {
          id: `furniture-${Date.now()}-${++furnitureCounter}`,
          assetId: asset.assetId,
          gridX: asset.gridX,
          gridY: asset.gridY,
          rotation,
          aspectCategory: asset.aspectCategory,
          name: asset.name,
          nameEn: asset.nameEn,
          width: asset.width,
          height: asset.height,
          visualState: 'default',
          interactable: true,
        };
        
        set({ placedFurniture: [...placedFurniture, newFurniture] });
        return true;
      },
      
      removeFurniture: (id) => {
        set(state => ({
          placedFurniture: state.placedFurniture.filter(f => f.id !== id),
          selectedPlacedId: state.selectedPlacedId === id ? null : state.selectedPlacedId,
        }));
      },
      
      updateFurniturePosition: (id, gridX, gridY) => {
        set(state => ({
          placedFurniture: state.placedFurniture.map(f =>
            f.id === id ? { ...f, gridX, gridY } : f
          ),
        }));
      },
      
      updateFurnitureBinding: (id, binding) => {
        set(state => ({
          placedFurniture: state.placedFurniture.map(f =>
            f.id === id ? { ...f, binding } : f
          ),
        }));
      },
      
      updateFurnitureState: (id, visualState) => {
        set(state => ({
          placedFurniture: state.placedFurniture.map(f =>
            f.id === id ? { ...f, visualState } : f
          ),
        }));
      },
      
      clearAllFurniture: () => {
        set({ placedFurniture: [], selectedPlacedId: null });
      },
      
      setShowPreview: (show) => set({ showPreview: show }),
      setValidPlacement: (valid) => set({ validPlacement: valid }),
      
      getFurnitureAt: (gridX, gridY) => {
        const { placedFurniture } = get();
        return placedFurniture.find(f => {
          const { width, height } = getRotatedDimensions(f.width, f.height, f.rotation);
          return gridX >= f.gridX && gridX < f.gridX + width &&
                 gridY >= f.gridY && gridY < f.gridY + height;
        });
      },
      
      isCellOccupied: (gridX, gridY, excludeId) => {
        const { placedFurniture } = get();
        return placedFurniture.some(f => {
          if (excludeId && f.id === excludeId) return false;
          const { width, height } = getRotatedDimensions(f.width, f.height, f.rotation);
          return gridX >= f.gridX && gridX < f.gridX + width &&
                 gridY >= f.gridY && gridY < f.gridY + height;
        });
      },
      
      getFurnitureInBounds: (x, y, width, height) => {
        const { placedFurniture } = get();
        return placedFurniture.filter(f => {
          const fDims = getRotatedDimensions(f.width, f.height, f.rotation);
          return f.gridX < x + width && f.gridX + fDims.width > x &&
                 f.gridY < y + height && f.gridY + fDims.height > y;
        });
      },
    }),
    {
      name: 'superspace-furniture',
      partialize: (state) => ({
        placedFurniture: state.placedFurniture,
        isBuildMode: state.isBuildMode,
      }),
    }
  )
);
