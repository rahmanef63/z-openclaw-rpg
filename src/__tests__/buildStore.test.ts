import { describe, it, expect, beforeEach } from 'vitest';
import { useBuildStore } from '@/stores/buildStore';

describe('buildStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useBuildStore.setState({
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
    });
  });

  describe('Build Mode', () => {
    it('should toggle build mode', () => {
      const { toggleBuildMode } = useBuildStore.getState();
      
      expect(useBuildStore.getState().isBuildMode).toBe(false);
      toggleBuildMode();
      expect(useBuildStore.getState().isBuildMode).toBe(true);
      toggleBuildMode();
      expect(useBuildStore.getState().isBuildMode).toBe(false);
    });

    it('should set build mode directly', () => {
      const { setBuildMode } = useBuildStore.getState();
      
      setBuildMode(true);
      expect(useBuildStore.getState().isBuildMode).toBe(true);
      
      setBuildMode(false);
      expect(useBuildStore.getState().isBuildMode).toBe(false);
    });
  });

  describe('Selection', () => {
    it('should select an asset', () => {
      const { selectAsset } = useBuildStore.getState();
      selectAsset('main-desk');
      
      expect(useBuildStore.getState().selectedAssetId).toBe('main-desk');
      expect(useBuildStore.getState().selectedPlacedId).toBeNull();
    });

    it('should clear asset selection', () => {
      const { selectAsset } = useBuildStore.getState();
      
      selectAsset('main-desk');
      expect(useBuildStore.getState().selectedAssetId).toBe('main-desk');
      
      selectAsset(null);
      expect(useBuildStore.getState().selectedAssetId).toBeNull();
    });

    it('should select placed furniture', () => {
      const { selectPlaced } = useBuildStore.getState();
      selectPlaced('furniture-123');
      
      expect(useBuildStore.getState().selectedPlacedId).toBe('furniture-123');
      expect(useBuildStore.getState().selectedAssetId).toBeNull();
    });

    it('should set hovered cell', () => {
      const { setHoveredCell } = useBuildStore.getState();
      setHoveredCell({ x: 5, y: 5 });
      
      expect(useBuildStore.getState().hoveredCell).toEqual({ x: 5, y: 5 });
    });
  });

  describe('Rotation', () => {
    it('should start with 0 degree rotation', () => {
      expect(useBuildStore.getState().rotation).toBe(0);
    });

    it('should rotate clockwise', () => {
      const { rotateClockwise } = useBuildStore.getState();
      
      rotateClockwise();
      expect(useBuildStore.getState().rotation).toBe(90);
      
      rotateClockwise();
      expect(useBuildStore.getState().rotation).toBe(180);
      
      rotateClockwise();
      expect(useBuildStore.getState().rotation).toBe(270);
      
      rotateClockwise();
      expect(useBuildStore.getState().rotation).toBe(0); // Wraps around
    });

    it('should rotate counter-clockwise', () => {
      const { rotateCounterClockwise } = useBuildStore.getState();
      
      rotateCounterClockwise();
      expect(useBuildStore.getState().rotation).toBe(270);
      
      rotateCounterClockwise();
      expect(useBuildStore.getState().rotation).toBe(180);
      
      rotateCounterClockwise();
      expect(useBuildStore.getState().rotation).toBe(90);
      
      rotateCounterClockwise();
      expect(useBuildStore.getState().rotation).toBe(0); // Wraps around
    });

    it('should set rotation directly', () => {
      const { setRotation } = useBuildStore.getState();
      
      setRotation(180);
      expect(useBuildStore.getState().rotation).toBe(180);
    });
  });

  describe('Furniture Placement', () => {
    it('should place furniture successfully', () => {
      const { placeFurniture } = useBuildStore.getState();
      
      const success = placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      expect(success).toBe(true);
      expect(useBuildStore.getState().placedFurniture).toHaveLength(1);
    });

    it('should not place furniture out of bounds', () => {
      const { placeFurniture } = useBuildStore.getState();
      
      const success = placeFurniture({
        assetId: 'main-desk',
        gridX: 18, // Would overflow (3 width)
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      expect(success).toBe(false);
      expect(useBuildStore.getState().placedFurniture).toHaveLength(0);
    });

    it('should not place furniture on occupied cell', () => {
      const { placeFurniture } = useBuildStore.getState();
      
      // Place first furniture
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      // Try to place overlapping furniture
      const success = placeFurniture({
        assetId: 'sofa',
        gridX: 6,
        gridY: 5,
        aspectCategory: 'mental',
        name: 'Sofa Nyaman',
        nameEn: 'Cozy Sofa',
        width: 3,
        height: 1,
      });
      
      expect(success).toBe(false);
      expect(useBuildStore.getState().placedFurniture).toHaveLength(1);
    });

    it('should remove furniture', () => {
      const { placeFurniture, removeFurniture } = useBuildStore.getState();
      
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      const furnitureId = useBuildStore.getState().placedFurniture[0].id;
      removeFurniture(furnitureId);
      
      expect(useBuildStore.getState().placedFurniture).toHaveLength(0);
    });

    it('should clear all furniture', () => {
      const { placeFurniture, clearAllFurniture } = useBuildStore.getState();
      
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      placeFurniture({
        assetId: 'sofa',
        gridX: 10,
        gridY: 5,
        aspectCategory: 'mental',
        name: 'Sofa Nyaman',
        nameEn: 'Cozy Sofa',
        width: 3,
        height: 1,
      });
      
      expect(useBuildStore.getState().placedFurniture).toHaveLength(2);
      
      clearAllFurniture();
      expect(useBuildStore.getState().placedFurniture).toHaveLength(0);
    });

    it('should update furniture position', () => {
      const { placeFurniture, updateFurniturePosition } = useBuildStore.getState();
      
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      const furnitureId = useBuildStore.getState().placedFurniture[0].id;
      updateFurniturePosition(furnitureId, 10, 10);
      
      expect(useBuildStore.getState().placedFurniture[0].gridX).toBe(10);
      expect(useBuildStore.getState().placedFurniture[0].gridY).toBe(10);
    });

    it('should update furniture visual state', () => {
      const { placeFurniture, updateFurnitureState } = useBuildStore.getState();
      
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      const furnitureId = useBuildStore.getState().placedFurniture[0].id;
      updateFurnitureState(furnitureId, 'warning');
      
      expect(useBuildStore.getState().placedFurniture[0].visualState).toBe('warning');
    });
  });

  describe('Helpers', () => {
    it('should get furniture at position', () => {
      const { placeFurniture, getFurnitureAt } = useBuildStore.getState();
      
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      const furniture = getFurnitureAt(6, 5); // Inside the placed furniture
      expect(furniture).toBeDefined();
      expect(furniture?.assetId).toBe('main-desk');
      
      const empty = getFurnitureAt(0, 0); // Outside
      expect(empty).toBeUndefined();
    });

    it('should check if cell is occupied', () => {
      const { placeFurniture, isCellOccupied } = useBuildStore.getState();
      
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      expect(isCellOccupied(5, 5)).toBe(true);
      expect(isCellOccupied(6, 6)).toBe(true);
      expect(isCellOccupied(0, 0)).toBe(false);
    });

    it('should exclude furniture from occupancy check', () => {
      const { placeFurniture, isCellOccupied } = useBuildStore.getState();
      
      placeFurniture({
        assetId: 'main-desk',
        gridX: 5,
        gridY: 5,
        aspectCategory: 'career',
        name: 'Meja Kerja Utama',
        nameEn: 'Main Desk',
        width: 3,
        height: 2,
      });
      
      const furnitureId = useBuildStore.getState().placedFurniture[0].id;
      
      // Check without exclusion
      expect(isCellOccupied(5, 5)).toBe(true);
      
      // Check with exclusion
      expect(isCellOccupied(5, 5, furnitureId)).toBe(false);
    });
  });
});
