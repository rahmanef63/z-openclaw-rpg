'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAssetLibrary } from '@/stores/assetLibrary';
import { useBuildStore } from '@/stores/buildStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { AssetCategory, AssetType, AssetRarity, Asset, AssetInteraction, AssetEffect } from '@/data/models';
import type { LifeAspect } from '@/stores/lifeStore';
import {
  X,
  Upload,
  Image as ImageIcon,
  Play,
  Pause,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Sparkles,
  Move,
  Clock,
  Zap,
  Save,
  Download,
  Copy,
  RefreshCw,
} from 'lucide-react';

// ===========================================
// TYPES
// ===========================================

export interface AnimationFrame {
  id: string;
  dataUrl: string;
  fileName: string;
  fileType: string; // 'image/png', 'image/svg+xml', etc.
  order: number;
}

export interface AnimationConfig {
  frames: AnimationFrame[];
  fps: number;
  loop: boolean;
  pingPong: boolean;
}

export interface CustomAssetData {
  // Basic info
  name: string;
  nameEn: string;
  description: string;
  category: AssetCategory;
  type: AssetType;
  icon: string;
  rarity: AssetRarity;
  
  // Dimensions
  width: number;
  height: number;
  
  // Cost
  cost: number;
  sellValue: number;
  
  // Visual
  staticImage: AnimationFrame | null;
  animation: AnimationConfig | null;
  hasAnimation: boolean;
  
  // Interactions
  interactions: Omit<AssetInteraction, 'id' | 'assetId' | 'createdAt' | 'updatedAt'>[];
  
  // Effects
  effects: AssetEffect[];
  
  // Tags
  tags: string[];
}

const DEFAULT_ASSET_DATA: CustomAssetData = {
  name: '',
  nameEn: '',
  description: '',
  category: 'career',
  type: 'furniture',
  icon: '📦',
  rarity: 'common',
  width: 1,
  height: 1,
  cost: 100,
  sellValue: 50,
  staticImage: null,
  animation: null,
  hasAnimation: false,
  interactions: [],
  effects: [],
  tags: [],
};

const CATEGORIES: { value: AssetCategory; label: string; icon: string }[] = [
  { value: 'personal', label: 'Personal Development', icon: '👤' },
  { value: 'career', label: 'Career & Business', icon: '💼' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'physical', label: 'Physical Health', icon: '💪' },
  { value: 'mental', label: 'Mental Health', icon: '🧠' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'spiritual', label: 'Spiritual', icon: '✨' },
  { value: 'intellectual', label: 'Intellectual', icon: '📚' },
  { value: 'recreation', label: 'Recreation', icon: '🎮' },
  { value: 'environment', label: 'Environment', icon: '🌿' },
];

const RARITIES: { value: AssetRarity; label: string; color: string }[] = [
  { value: 'common', label: 'Common', color: '#94a3b8' },
  { value: 'uncommon', label: 'Uncommon', color: '#22c55e' },
  { value: 'rare', label: 'Rare', color: '#3b82f6' },
  { value: 'epic', label: 'Epic', color: '#a855f7' },
  { value: 'legendary', label: 'Legendary', color: '#f59e0b' },
];

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'character', label: 'Character' },
  { value: 'effect', label: 'Effect' },
  { value: 'tile', label: 'Tile' },
  { value: 'prop', label: 'Prop' },
  { value: 'collectible', label: 'Collectible' },
];

// ===========================================
// MAIN COMPONENT
// ===========================================

function AssetCreatorContent({ onClose }: { onClose: () => void }) {
  const { addAsset } = useAssetLibrary();
  const { placeFurniture } = useBuildStore();
  
  const [assetData, setAssetData] = useState<CustomAssetData>(DEFAULT_ASSET_DATA);
  const [activeTab, setActiveTab] = useState<'basic' | 'visual' | 'animation' | 'interactions'>('basic');
  const [previewFrame, setPreviewFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationInputRef = useRef<HTMLInputElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup animation interval on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  // Animation playback
  useEffect(() => {
    if (isPlaying && assetData.animation && assetData.animation.frames.length > 1) {
      const frameDelay = 1000 / assetData.animation.fps;
      animationIntervalRef.current = setInterval(() => {
        setPreviewFrame((prev) => {
          const next = prev + 1;
          if (next >= assetData.animation!.frames.length) {
            return 0;
          }
          return next;
        });
      }, frameDelay);
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    }
    
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [isPlaying, assetData.animation]);

  // Handle static image upload
  const handleStaticImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, staticImage: 'Invalid file type. Use PNG, JPG, GIF, SVG, or WebP.' });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, staticImage: 'File too large. Maximum size is 2MB.' });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAssetData({
        ...assetData,
        staticImage: {
          id: `frame-${Date.now()}`,
          dataUrl,
          fileName: file.name,
          fileType: file.type,
          order: 0,
        },
      });
      setErrors({ ...errors, staticImage: '' });
    };
    reader.readAsDataURL(file);
  }, [assetData, errors]);

  // Handle animation frames upload
  const handleAnimationFramesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
    const validFiles = files.filter(f => validTypes.includes(f.type));
    
    if (validFiles.length === 0) {
      setErrors({ ...errors, animation: 'No valid image files selected.' });
      return;
    }
    
    const newFrames: AnimationFrame[] = [];
    const existingFrames = assetData.animation?.frames || [];
    let order = existingFrames.length;
    
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        newFrames.push({
          id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dataUrl,
          fileName: file.name,
          fileType: file.type,
          order: order++,
        });
        
        // Update state when all files are processed
        if (newFrames.length === validFiles.length) {
          setAssetData({
            ...assetData,
            hasAnimation: true,
            animation: {
              frames: [...existingFrames, ...newFrames].sort((a, b) => a.order - b.order),
              fps: assetData.animation?.fps || 8,
              loop: assetData.animation?.loop ?? true,
              pingPong: assetData.animation?.pingPong ?? false,
            },
          });
          setErrors({ ...errors, animation: '' });
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (animationInputRef.current) {
      animationInputRef.current.value = '';
    }
  }, [assetData, errors]);

  // Remove animation frame
  const removeAnimationFrame = useCallback((frameId: string) => {
    if (!assetData.animation) return;
    
    const newFrames = assetData.animation.frames
      .filter(f => f.id !== frameId)
      .map((f, i) => ({ ...f, order: i }));
    
    if (newFrames.length === 0) {
      setAssetData({
        ...assetData,
        hasAnimation: false,
        animation: null,
      });
    } else {
      setAssetData({
        ...assetData,
        animation: {
          ...assetData.animation,
          frames: newFrames,
        },
      });
    }
    
    setPreviewFrame(0);
  }, [assetData]);

  // Reorder animation frames
  const reorderFrame = useCallback((frameId: string, direction: 'up' | 'down') => {
    if (!assetData.animation) return;
    
    const frames = [...assetData.animation.frames];
    const index = frames.findIndex(f => f.id === frameId);
    
    if (direction === 'up' && index > 0) {
      [frames[index - 1], frames[index]] = [frames[index], frames[index - 1]];
    } else if (direction === 'down' && index < frames.length - 1) {
      [frames[index], frames[index + 1]] = [frames[index + 1], frames[index]];
    }
    
    const reorderedFrames = frames.map((f, i) => ({ ...f, order: i }));
    
    setAssetData({
      ...assetData,
      animation: {
        ...assetData.animation,
        frames: reorderedFrames,
      },
    });
  }, [assetData]);

  // Update FPS
  const updateFps = useCallback((fps: number) => {
    if (!assetData.animation) return;
    
    setAssetData({
      ...assetData,
      animation: {
        ...assetData.animation,
        fps: Math.max(1, Math.min(60, fps)),
      },
    });
  }, [assetData]);

  // Add interaction
  const addInteraction = useCallback(() => {
    const newInteraction: Omit<AssetInteraction, 'id' | 'assetId' | 'createdAt' | 'updatedAt'> = {
      name: 'New Interaction',
      nameEn: 'New Interaction',
      description: '',
      type: 'interact',
      category: 'productive',
      duration: 5,
      cooldown: 0,
      energyCost: 0,
      moodEffect: 0,
      pointsReward: 0,
      aspectEffects: [],
      miniGameType: 'none',
      usageCount: 0,
    };
    
    setAssetData({
      ...assetData,
      interactions: [...assetData.interactions, newInteraction],
    });
  }, [assetData]);

  // Remove interaction
  const removeInteraction = useCallback((index: number) => {
    setAssetData({
      ...assetData,
      interactions: assetData.interactions.filter((_, i) => i !== index),
    });
  }, [assetData]);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!assetData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!assetData.nameEn.trim()) {
      newErrors.nameEn = 'English name is required';
    }
    if (assetData.width < 1 || assetData.width > 10) {
      newErrors.width = 'Width must be between 1 and 10';
    }
    if (assetData.height < 1 || assetData.height > 10) {
      newErrors.height = 'Height must be between 1 and 10';
    }
    if (assetData.cost < 0) {
      newErrors.cost = 'Cost must be positive';
    }
    if (assetData.hasAnimation && (!assetData.animation || assetData.animation.frames.length < 2)) {
      newErrors.animation = 'Animation requires at least 2 frames';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [assetData]);

  // Save asset
  const handleSave = useCallback(() => {
    if (!validate()) return;
    
    // Create asset data for storage
    const assetToSave: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'> = {
      type: assetData.type,
      category: assetData.category,
      name: assetData.name,
      nameEn: assetData.nameEn,
      description: assetData.description,
      icon: assetData.icon,
      sprite: assetData.staticImage?.dataUrl || assetData.animation?.frames[0]?.dataUrl,
      width: assetData.width,
      height: assetData.height,
      rarity: assetData.rarity,
      cost: assetData.cost,
      sellValue: assetData.sellValue,
      interactions: [],
      effects: assetData.effects,
      connectedAgentIds: [],
      connectedEventIds: [],
      isUnlocked: true,
      isPremium: false,
      tags: assetData.tags,
    };
    
    // Add to asset library
    const newAsset = addAsset(assetToSave);
    
    // Store animation config separately in localStorage
    if (assetData.hasAnimation && assetData.animation) {
      const animations = JSON.parse(localStorage.getItem('superspace-animations') || '{}');
      animations[newAsset.id] = {
        frames: assetData.animation.frames,
        fps: assetData.animation.fps,
        loop: assetData.animation.loop,
        pingPong: assetData.animation.pingPong,
      };
      localStorage.setItem('superspace-animations', JSON.stringify(animations));
    }
    
    // Close modal
    onClose();
  }, [assetData, validate, addAsset, onClose]);

  // Get preview image
  const getPreviewImage = useCallback(() => {
    if (assetData.hasAnimation && assetData.animation && assetData.animation.frames.length > 0) {
      return assetData.animation.frames[previewFrame]?.dataUrl;
    }
    return assetData.staticImage?.dataUrl;
  }, [assetData, previewFrame]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[300] p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b flex-shrink-0"
          style={{ borderColor: '#334155' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: '#00ffff' }} />
            <h2 className="font-mono text-lg font-bold" style={{ color: '#00ffff' }}>
              Create Asset
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700"
            style={{ color: '#94a3b8' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: '#334155' }}>
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'visual', label: 'Visual', icon: ImageIcon },
            { id: 'animation', label: 'Animation', icon: Play },
            { id: 'interactions', label: 'Interactions', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-mono transition-colors"
                style={{
                  color: isActive ? '#00ffff' : '#64748b',
                  backgroundColor: isActive ? '#1e293b' : 'transparent',
                  borderBottom: isActive ? '2px solid #00ffff' : 'none',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Name (ID) *
                  </label>
                  <input
                    type="text"
                    value={assetData.name}
                    onChange={(e) => setAssetData({ ...assetData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#1e293b',
                      border: `1px solid ${errors.name ? '#ef4444' : '#334155'}`,
                      color: '#f8fafc',
                    }}
                    placeholder="Nama Asset"
                  />
                  {errors.name && (
                    <span className="text-xs" style={{ color: '#ef4444' }}>{errors.name}</span>
                  )}
                </div>
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Name (EN) *
                  </label>
                  <input
                    type="text"
                    value={assetData.nameEn}
                    onChange={(e) => setAssetData({ ...assetData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#1e293b',
                      border: `1px solid ${errors.nameEn ? '#ef4444' : '#334155'}`,
                      color: '#f8fafc',
                    }}
                    placeholder="Asset Name"
                  />
                  {errors.nameEn && (
                    <span className="text-xs" style={{ color: '#ef4444' }}>{errors.nameEn}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                  Description
                </label>
                <textarea
                  value={assetData.description}
                  onChange={(e) => setAssetData({ ...assetData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                  }}
                  rows={3}
                  placeholder="Describe this asset..."
                />
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Category
                  </label>
                  <select
                    value={assetData.category}
                    onChange={(e) => setAssetData({ ...assetData, category: e.target.value as AssetCategory })}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Type
                  </label>
                  <select
                    value={assetData.type}
                    onChange={(e) => setAssetData({ ...assetData, type: e.target.value as AssetType })}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                    }}
                  >
                    {ASSET_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rarity and Icon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Rarity
                  </label>
                  <select
                    value={assetData.rarity}
                    onChange={(e) => setAssetData({ ...assetData, rarity: e.target.value as AssetRarity })}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                    }}
                  >
                    {RARITIES.map((rarity) => (
                      <option key={rarity.value} value={rarity.value}>
                        {rarity.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={assetData.icon}
                    onChange={(e) => setAssetData({ ...assetData, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded text-sm text-center"
                    style={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                    }}
                    placeholder="📦"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="text-xs font-mono mb-2 block" style={{ color: '#94a3b8' }}>
                  Dimensions (Grid Cells)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-mono block mb-1" style={{ color: '#64748b' }}>
                      Width
                    </label>
                    <input
                      type="number"
                      value={assetData.width}
                      onChange={(e) => setAssetData({ ...assetData, width: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded text-sm"
                      style={{
                        backgroundColor: '#1e293b',
                        border: `1px solid ${errors.width ? '#ef4444' : '#334155'}`,
                        color: '#f8fafc',
                      }}
                      min={1}
                      max={10}
                    />
                  </div>
                  <span style={{ color: '#64748b' }}>×</span>
                  <div className="flex-1">
                    <label className="text-[10px] font-mono block mb-1" style={{ color: '#64748b' }}>
                      Height
                    </label>
                    <input
                      type="number"
                      value={assetData.height}
                      onChange={(e) => setAssetData({ ...assetData, height: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded text-sm"
                      style={{
                        backgroundColor: '#1e293b',
                        border: `1px solid ${errors.height ? '#ef4444' : '#334155'}`,
                        color: '#f8fafc',
                      }}
                      min={1}
                      max={10}
                    />
                  </div>
                  <div
                    className="p-2 rounded text-center"
                    style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  >
                    <div
                      className="border-2 rounded"
                      style={{
                        width: `${assetData.width * 16}px`,
                        height: `${assetData.height * 16}px`,
                        borderColor: '#00ffff',
                        backgroundColor: '#00ffff10',
                        minWidth: '16px',
                        minHeight: '16px',
                        maxWidth: '64px',
                        maxHeight: '64px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Cost (Points)
                  </label>
                  <input
                    type="number"
                    value={assetData.cost}
                    onChange={(e) => setAssetData({ ...assetData, cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#1e293b',
                      border: `1px solid ${errors.cost ? '#ef4444' : '#334155'}`,
                      color: '#f8fafc',
                    }}
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                    Sell Value (Points)
                  </label>
                  <input
                    type="number"
                    value={assetData.sellValue}
                    onChange={(e) => setAssetData({ ...assetData, sellValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                    }}
                    min={0}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-mono mb-1 block" style={{ color: '#94a3b8' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={assetData.tags.join(', ')}
                  onChange={(e) => setAssetData({
                    ...assetData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                  })}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                  }}
                  placeholder="work, productivity, career"
                />
              </div>
            </div>
          )}

          {/* Visual Tab */}
          {activeTab === 'visual' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setAssetData({ ...assetData, hasAnimation: false })}
                  className={`flex-1 p-3 rounded-lg border transition-colors ${
                    !assetData.hasAnimation ? 'ring-2 ring-cyan-400' : ''
                  }`}
                  style={{
                    backgroundColor: !assetData.hasAnimation ? '#00ffff20' : '#1e293b',
                    borderColor: !assetData.hasAnimation ? '#00ffff' : '#334155',
                  }}
                >
                  <ImageIcon size={24} className="mx-auto mb-1" style={{ color: !assetData.hasAnimation ? '#00ffff' : '#94a3b8' }} />
                  <span className="text-xs font-mono block" style={{ color: !assetData.hasAnimation ? '#00ffff' : '#94a3b8' }}>
                    Static Image
                  </span>
                </button>
                <button
                  onClick={() => setAssetData({ ...assetData, hasAnimation: true })}
                  className={`flex-1 p-3 rounded-lg border transition-colors ${
                    assetData.hasAnimation ? 'ring-2 ring-cyan-400' : ''
                  }`}
                  style={{
                    backgroundColor: assetData.hasAnimation ? '#00ffff20' : '#1e293b',
                    borderColor: assetData.hasAnimation ? '#00ffff' : '#334155',
                  }}
                >
                  <Play size={24} className="mx-auto mb-1" style={{ color: assetData.hasAnimation ? '#00ffff' : '#94a3b8' }} />
                  <span className="text-xs font-mono block" style={{ color: assetData.hasAnimation ? '#00ffff' : '#94a3b8' }}>
                    Animated
                  </span>
                </button>
              </div>

              {/* Static Image Upload */}
              {!assetData.hasAnimation && (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-cyan-400"
                    style={{ borderColor: errors.staticImage ? '#ef4444' : '#334155' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {assetData.staticImage ? (
                      <div className="space-y-2">
                        <img
                          src={assetData.staticImage.dataUrl}
                          alt="Preview"
                          className="mx-auto max-h-40 rounded"
                        />
                        <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                          {assetData.staticImage.fileName}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className="mx-auto mb-2" style={{ color: '#64748b' }} />
                        <p className="text-sm" style={{ color: '#94a3b8' }}>
                          Click to upload image
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                          PNG, JPG, GIF, SVG, WebP (max 2MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                      onChange={handleStaticImageUpload}
                      className="hidden"
                    />
                  </div>
                  {errors.staticImage && (
                    <p className="text-xs" style={{ color: '#ef4444' }}>{errors.staticImage}</p>
                  )}
                  {assetData.staticImage && (
                    <button
                      onClick={() => setAssetData({ ...assetData, staticImage: null })}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                      Remove Image
                    </button>
                  )}
                </div>
              )}

              {/* Animation Setup - Go to Animation Tab */}
              {assetData.hasAnimation && (
                <div className="text-center py-8">
                  <Play size={48} className="mx-auto mb-4" style={{ color: '#00ffff' }} />
                  <p className="text-sm mb-2" style={{ color: '#f8fafc' }}>
                    Animation mode selected
                  </p>
                  <p className="text-xs mb-4" style={{ color: '#64748b' }}>
                    Go to the Animation tab to upload frames
                  </p>
                  <button
                    onClick={() => setActiveTab('animation')}
                    className="px-4 py-2 rounded text-sm font-mono"
                    style={{ backgroundColor: '#00ffff', color: '#0f172a' }}
                  >
                    Setup Animation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Animation Tab */}
          {activeTab === 'animation' && (
            <div className="space-y-4">
              {/* FPS Control */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#1e293b' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                    FPS (Frames Per Second)
                  </label>
                  <span className="text-sm font-mono" style={{ color: '#00ffff' }}>
                    {assetData.animation?.fps || 8} FPS
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={assetData.animation?.fps || 8}
                  onChange={(e) => updateFps(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: '#64748b' }}>
                  <span>1 FPS</span>
                  <span>30 FPS</span>
                  <span>60 FPS</span>
                </div>
              </div>

              {/* Animation Options */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assetData.animation?.loop ?? true}
                    onChange={(e) => {
                      if (assetData.animation) {
                        setAssetData({
                          ...assetData,
                          animation: { ...assetData.animation, loop: e.target.checked },
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>Loop</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assetData.animation?.pingPong ?? false}
                    onChange={(e) => {
                      if (assetData.animation) {
                        setAssetData({
                          ...assetData,
                          animation: { ...assetData.animation, pingPong: e.target.checked },
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>Ping-Pong</span>
                </label>
              </div>

              {/* Frame Upload */}
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-cyan-400"
                style={{ borderColor: errors.animation ? '#ef4444' : '#334155' }}
                onClick={() => animationInputRef.current?.click()}
              >
                <Upload size={24} className="mx-auto mb-2" style={{ color: '#64748b' }} />
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Click to add animation frames
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                  Select multiple images (will be ordered by selection)
                </p>
                <input
                  ref={animationInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                  multiple
                  onChange={handleAnimationFramesUpload}
                  className="hidden"
                />
              </div>

              {/* Frame List */}
              {assetData.animation && assetData.animation.frames.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                      Frames ({assetData.animation.frames.length})
                    </span>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: '#00ffff20', color: '#00ffff' }}
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                      {isPlaying ? 'Pause' : 'Preview'}
                    </button>
                  </div>
                  
                  {/* Frames Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {assetData.animation.frames.map((frame, index) => (
                      <div
                        key={frame.id}
                        className={`relative rounded overflow-hidden border ${
                          previewFrame === index ? 'ring-2 ring-cyan-400' : ''
                        }`}
                        style={{ 
                          borderColor: previewFrame === index ? '#00ffff' : '#334155',
                          backgroundColor: '#1e293b',
                        }}
                      >
                        <img
                          src={frame.dataUrl}
                          alt={`Frame ${index + 1}`}
                          className="w-full h-20 object-contain"
                        />
                        <div className="absolute top-1 left-1 px-1 rounded text-[10px] font-mono" style={{ backgroundColor: '#00000080', color: '#fff' }}>
                          {index + 1}
                        </div>
                        <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                          <button
                            onClick={() => reorderFrame(frame.id, 'up')}
                            disabled={index === 0}
                            className="flex-1 p-0.5 rounded text-[10px] disabled:opacity-30"
                            style={{ backgroundColor: '#00000080', color: '#fff' }}
                          >
                            <ChevronUp size={10} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => reorderFrame(frame.id, 'down')}
                            disabled={index === assetData.animation!.frames.length - 1}
                            className="flex-1 p-0.5 rounded text-[10px] disabled:opacity-30"
                            style={{ backgroundColor: '#00000080', color: '#fff' }}
                          >
                            <ChevronDown size={10} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => removeAnimationFrame(frame.id)}
                            className="flex-1 p-0.5 rounded text-[10px]"
                            style={{ backgroundColor: '#ef444480', color: '#fff' }}
                          >
                            <Trash2 size={10} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preview */}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#1e293b' }}>
                    <p className="text-xs font-mono mb-2" style={{ color: '#94a3b8' }}>Preview</p>
                    <div className="flex items-center justify-center">
                      <img
                        src={getPreviewImage()}
                        alt="Animation Preview"
                        className="max-h-32 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xs font-mono" style={{ color: '#64748b' }}>
                        Frame {previewFrame + 1} / {assetData.animation.frames.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {errors.animation && (
                <p className="text-xs" style={{ color: '#ef4444' }}>{errors.animation}</p>
              )}
            </div>
          )}

          {/* Interactions Tab */}
          {activeTab === 'interactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                  Define how players can interact with this asset
                </span>
                <button
                  onClick={addInteraction}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: '#00ffff20', color: '#00ffff' }}
                >
                  <Plus size={12} />
                  Add Interaction
                </button>
              </div>

              {assetData.interactions.length === 0 ? (
                <div className="text-center py-8">
                  <Zap size={32} className="mx-auto mb-2" style={{ color: '#334155' }} />
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    No interactions defined yet
                  </p>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Click "Add Interaction" to create one
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assetData.interactions.map((interaction, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={interaction.name}
                          onChange={(e) => {
                            const newInteractions = [...assetData.interactions];
                            newInteractions[index] = { ...interaction, name: e.target.value, nameEn: e.target.value };
                            setAssetData({ ...assetData, interactions: newInteractions });
                          }}
                          className="px-2 py-1 rounded text-sm flex-1 mr-2"
                          style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                          placeholder="Interaction name"
                        />
                        <button
                          onClick={() => removeInteraction(index)}
                          className="p-1 rounded hover:bg-red-500/20"
                        >
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono block mb-1" style={{ color: '#64748b' }}>
                            Type
                          </label>
                          <select
                            value={interaction.type}
                            onChange={(e) => {
                              const newInteractions = [...assetData.interactions];
                              newInteractions[index] = { ...interaction, type: e.target.value as AssetInteraction['type'] };
                              setAssetData({ ...assetData, interactions: newInteractions });
                            }}
                            className="w-full px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                          >
                            <option value="work">Work</option>
                            <option value="exercise">Exercise</option>
                            <option value="meditate">Meditate</option>
                            <option value="socialize">Socialize</option>
                            <option value="learn">Learn</option>
                            <option value="relax">Relax</option>
                            <option value="finance">Finance</option>
                            <option value="cook">Cook</option>
                            <option value="garden">Garden</option>
                            <option value="create">Create</option>
                            <option value="interact">Interact</option>
                            <option value="collect">Collect</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono block mb-1" style={{ color: '#64748b' }}>
                            Duration (sec)
                          </label>
                          <input
                            type="number"
                            value={interaction.duration}
                            onChange={(e) => {
                              const newInteractions = [...assetData.interactions];
                              newInteractions[index] = { ...interaction, duration: parseInt(e.target.value) || 0 };
                              setAssetData({ ...assetData, interactions: newInteractions });
                            }}
                            className="w-full px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                            min={0}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-[10px] font-mono block mb-1" style={{ color: '#64748b' }}>
                            Points Reward
                          </label>
                          <input
                            type="number"
                            value={interaction.pointsReward}
                            onChange={(e) => {
                              const newInteractions = [...assetData.interactions];
                              newInteractions[index] = { ...interaction, pointsReward: parseInt(e.target.value) || 0 };
                              setAssetData({ ...assetData, interactions: newInteractions });
                            }}
                            className="w-full px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono block mb-1" style={{ color: '#64748b' }}>
                            Energy Cost
                          </label>
                          <input
                            type="number"
                            value={interaction.energyCost}
                            onChange={(e) => {
                              const newInteractions = [...assetData.interactions];
                              newInteractions[index] = { ...interaction, energyCost: parseInt(e.target.value) || 0 };
                              setAssetData({ ...assetData, interactions: newInteractions });
                            }}
                            className="w-full px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-3 border-t flex-shrink-0"
          style={{ borderColor: '#334155' }}
        >
          <div className="flex items-center gap-2">
            {/* Preview */}
            {getPreviewImage() && (
              <div className="flex items-center gap-2">
                <img
                  src={getPreviewImage()}
                  alt="Preview"
                  className="w-10 h-10 object-contain rounded"
                  style={{ backgroundColor: '#1e293b' }}
                />
                <div>
                  <div className="text-xs font-mono" style={{ color: '#f8fafc' }}>
                    {assetData.name || 'Unnamed Asset'}
                  </div>
                  <div className="text-[10px]" style={{ color: '#64748b' }}>
                    {assetData.width}×{assetData.height} • {RARITIES.find(r => r.value === assetData.rarity)?.label}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-mono"
              style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-mono"
              style={{ backgroundColor: '#00ffff', color: '#0f172a' }}
            >
              <Save size={14} />
              Create Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// EXPORTS
// ===========================================

export default function AssetCreator(props: { onClose: () => void }) {
  return (
    <ErrorBoundary componentName="AssetCreator">
      <AssetCreatorContent {...props} />
    </ErrorBoundary>
  );
}
