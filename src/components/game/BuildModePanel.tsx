'use client';

import React, { useState, useEffect } from 'react';
import { useBuildStore, getGroupedFurniture, getFurnitureById, ASPECT_NAMES, type LifeAspect } from '@/stores';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { 
  Hammer, 
  RotateCw, 
  Trash2, 
  X,
  Move,
  MousePointer,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Category icons
const CATEGORY_ICONS: Record<LifeAspect, string> = {
  personal: '👤',
  career: '💼',
  finance: '💰',
  physical: '💪',
  mental: '🧠',
  social: '👥',
  spiritual: '✨',
  intellectual: '📚',
  recreation: '🎮',
  environment: '🌿',
};

// Pixel art category colors
const CATEGORY_COLORS: Record<LifeAspect, string> = {
  personal: '#06b6d4',
  career: 'var(--pixel-sky)',
  finance: 'var(--pixel-gold)',
  physical: 'var(--pixel-grass)',
  mental: '#f472b6',
  social: 'var(--pixel-gold-dark)',
  spiritual: 'var(--pixel-magic)',
  intellectual: 'var(--pixel-sky)',
  recreation: '#ec4899',
  environment: 'var(--pixel-grass)',
};

function BuildModeContent() {
  const {
    isBuildMode,
    selectedAssetId,
    selectedPlacedId,
    placedFurniture,
    rotation,
    selectAsset,
    selectPlaced,
    rotateClockwise,
    removeFurniture,
    clearAllFurniture,
    toggleBuildMode,
  } = useBuildStore();

  const [expandedCategory, setExpandedCategory] = useState<LifeAspect | null>('career');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768 || 'ontouchstart' in window;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Auto-collapse panel on tablet
      if (tablet) {
        setPanelCollapsed(true);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const groupedFurniture = getGroupedFurniture();
  const selectedAsset = selectedAssetId ? getFurnitureById(selectedAssetId) : null;
  const selectedFurniture = placedFurniture.find(f => f.id === selectedPlacedId);

  if (!isBuildMode) return null;

  const panelWidth = isMobile ? '100%' : isTablet ? (panelCollapsed ? '60px' : '280px') : '288px';

  return (
    <>
      {/* ========== BUILD MODE PANEL ========== */}
      <div
        className={`absolute right-0 top-10 bottom-0 z-[90] overflow-hidden flex flex-col transition-all duration-300 pixel-panel`}
        style={{
          width: panelWidth,
          borderWidth: '0 0 0 6px',
          borderColor: 'var(--pixel-border-light) var(--pixel-border-dark) var(--pixel-border-dark) var(--pixel-border-light)',
        }}
      >
        {/* Header - Pixel Style */}
        <div
          className="p-2 md:p-3 flex items-center justify-between flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, var(--secondary) 0%, #1a1c2c 100%)',
            borderBottom: '4px solid var(--pixel-border-dark)',
          }}
        >
          <div className="flex items-center gap-2">
            <Hammer size={14} style={{ color: 'var(--pixel-gold)' }} />
            {(!isTablet || !panelCollapsed) && (
              <span className="pixel-text-xs text-[var(--pixel-gold)] pixel-text-shadow">
                BUILD MODE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Tablet collapse button */}
            {isTablet && (
              <button
                onClick={() => setPanelCollapsed(!panelCollapsed)}
                className="pixel-btn p-1"
              >
                {panelCollapsed ? <ChevronLeft size={12} style={{ color: 'var(--pixel-gold)' }} /> : <ChevronRight size={12} style={{ color: 'var(--muted-foreground)' }} />}
              </button>
            )}
            
            {!panelCollapsed && (
              <>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="pixel-btn p-1"
                >
                  <Info size={12} style={{ color: showHelp ? 'var(--pixel-gold)' : 'var(--muted-foreground)' }} />
                </button>
                <button
                  onClick={rotateClockwise}
                  className="pixel-btn p-1"
                >
                  <RotateCw size={12} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </>
            )}
            <button
              onClick={toggleBuildMode}
              className="pixel-btn danger p-1"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Collapsed view for tablet */}
        {panelCollapsed && isTablet ? (
          <div className="flex flex-col items-center py-3 gap-3">
            <button
              onClick={() => setPanelCollapsed(false)}
              className="pixel-btn primary"
              title="Expand panel"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={rotateClockwise}
              className="pixel-btn"
              title="Rotate (R)"
            >
              <RotateCw size={14} style={{ color: 'var(--pixel-gold)' }} />
            </button>
            <div className="pixel-text-xs text-center text-[var(--pixel-gold)]">
              {rotation}°
            </div>
          </div>
        ) : (
          <>
            {/* Help Panel */}
            {showHelp && (
              <div
                className="p-2 md:p-3 flex-shrink-0"
                style={{ backgroundColor: 'var(--card)', borderBottom: '4px solid var(--pixel-border-dark)' }}
              >
                <div className="pixel-text-xs space-y-2 text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-2">
                    <MousePointer size={10} style={{ color: 'var(--pixel-gold)' }} />
                    <span>Click grid to place</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCw size={10} style={{ color: 'var(--pixel-gold)' }} />
                    <span>Press R to rotate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Move size={10} style={{ color: 'var(--pixel-gold)' }} />
                    <span>Click to select</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trash2 size={10} style={{ color: 'var(--pixel-blood)' }} />
                    <span>DEL to remove</span>
                  </div>
                  <div className="mt-2 pt-2 hidden md:block" style={{ borderTop: '2px solid var(--pixel-border-dark)' }}>
                    <div className="text-[var(--pixel-gold)] mb-1">Keys:</div>
                    <div className="space-y-1 pl-2">
                      <div><span className="text-[var(--pixel-gold)]">B</span> - Toggle</div>
                      <div><span className="text-[var(--pixel-gold)]">R</span> - Rotate</div>
                      <div><span className="text-[var(--pixel-gold)]">ESC</span> - Close</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rotation indicator */}
            <div
              className="px-2 md:px-3 py-2 flex items-center justify-between flex-shrink-0"
              style={{ backgroundColor: 'var(--background)', borderBottom: '4px solid var(--pixel-border-dark)' }}
            >
              <span className="pixel-text-xs text-[var(--muted-foreground)]">
                ROT: <span className="text-[var(--pixel-gold)]">{rotation}°</span>
              </span>
              <div className="flex gap-1">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => useBuildStore.getState().setRotation(deg as 0 | 90 | 180 | 270)}
                    className={`px-2 py-1 pixel-text-xs ${
                      rotation === deg ? 'pixel-glow' : ''
                    }`}
                    style={{ 
                      backgroundColor: rotation === deg ? 'var(--pixel-gold)' : 'var(--card)', 
                      color: rotation === deg ? 'var(--pixel-border-dark)' : 'var(--muted-foreground)',
                      border: '2px solid',
                      borderColor: rotation === deg ? 'var(--pixel-gold-light)' : 'var(--pixel-border-dark)',
                    }}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Asset Preview */}
            {selectedAsset && (
              <div
                className="p-2 md:p-3 flex-shrink-0"
                style={{ 
                  backgroundColor: 'var(--card)', 
                  borderLeft: '4px solid var(--pixel-gold)',
                }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl md:text-2xl flex-shrink-0 pixel-border"
                    style={{ 
                      backgroundColor: 'var(--background)', 
                    }}
                  >
                    {selectedAsset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="pixel-text-xs truncate text-[var(--foreground)]">
                      {selectedAsset.name}
                    </div>
                    <div className="pixel-text-xs truncate text-[var(--muted-foreground)]">
                      {selectedAsset.width}x{selectedAsset.height}
                    </div>
                  </div>
                  <button
                    onClick={() => selectAsset(null)}
                    className="pixel-btn p-1 flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="mt-2 pixel-text-xs text-center text-[var(--pixel-grass)]">
                  ▼ CLICK TO PLACE
                </div>
              </div>
            )}

            {/* Furniture Catalog */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-2">
                <div className="pixel-text-xs mb-2 text-[var(--pixel-gold)] pixel-text-shadow">
                  FURNITURE
                </div>

                {/* Categories */}
                {(Object.entries(groupedFurniture) as [LifeAspect, typeof groupedFurniture[LifeAspect]][]).map(([category, furniture]) => {
                  const info = ASPECT_NAMES[category];
                  const color = CATEGORY_COLORS[category];
                  const isExpanded = expandedCategory === category;

                  return (
                    <div key={category} className="mb-1">
                      {/* Category Header - Pixel Style */}
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category)}
                        className="w-full flex items-center justify-between p-2 transition-colors pixel-border"
                        style={{
                          backgroundColor: isExpanded ? color : 'var(--card)',
                          color: isExpanded ? 'var(--pixel-border-dark)' : 'var(--foreground)',
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base flex-shrink-0">{CATEGORY_ICONS[category]}</span>
                          <span className="pixel-text-xs truncate">
                            {info.name}
                          </span>
                          <span
                            className="pixel-text-xs px-1 flex-shrink-0"
                            style={{ 
                              backgroundColor: isExpanded ? 'rgba(0,0,0,0.2)' : 'var(--background)',
                              color: isExpanded ? 'var(--pixel-border-dark)' : color,
                            }}
                          >
                            {furniture.length}
                          </span>
                        </div>
                        <span className="pixel-text-xs flex-shrink-0">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </button>

                      {/* Furniture List */}
                      {isExpanded && (
                        <div className="mt-1 ml-2 space-y-1">
                          {furniture.map((item) => {
                            const isSelected = selectedAssetId === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => selectAsset(isSelected ? null : item.id)}
                                className="w-full flex items-center gap-2 p-2 text-left transition-colors"
                                style={{
                                  backgroundColor: isSelected ? 'var(--pixel-gold)' : 'var(--background)',
                                  border: '3px solid',
                                  borderColor: isSelected ? 'var(--pixel-gold-light)' : 'var(--pixel-border-dark)',
                                  color: isSelected ? 'var(--pixel-border-dark)' : 'var(--foreground)',
                                }}
                              >
                                <span className="text-lg flex-shrink-0">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="pixel-text-xs truncate">
                                    {item.name}
                                  </div>
                                  <div className="pixel-text-xs truncate opacity-70">
                                    {item.width}x{item.height}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="w-2 h-2 pixel-border flex-shrink-0" style={{ backgroundColor: 'var(--pixel-border-dark)' }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Placed Furniture Info */}
            {selectedFurniture && (
              <div
                className="p-2 md:p-3 flex-shrink-0 pixel-border-inset"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{getFurnitureById(selectedFurniture.assetId)?.icon || '📦'}</span>
                    <span className="pixel-text-xs truncate text-[var(--pixel-gold)]">
                      {selectedFurniture.name}
                    </span>
                  </div>
                  <button
                    onClick={() => selectPlaced(null)}
                    className="pixel-btn p-1 flex-shrink-0"
                  >
                    <X size={10} />
                  </button>
                </div>
                <div className="pixel-text-xs mb-2 text-[var(--muted-foreground)]">
                  POS: ({selectedFurniture.gridX}, {selectedFurniture.gridY}) • {selectedFurniture.rotation}°
                </div>
                <button
                  onClick={() => removeFurniture(selectedFurniture.id)}
                  className="w-full flex items-center justify-center gap-2 pixel-btn danger pixel-text-xs"
                >
                  <Trash2 size={10} />
                  REMOVE
                </button>
              </div>
            )}

            {/* Footer */}
            <div
              className="p-2 md:p-3 flex-shrink-0"
              style={{ borderTop: '4px solid var(--pixel-border-dark)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="pixel-text-xs text-[var(--pixel-gold)]">
                  {placedFurniture.length} ITEMS
                </span>
                <span className="pixel-text-xs text-[var(--muted-foreground)]">
                  B: Exit
                </span>
              </div>
              {placedFurniture.length > 0 && (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="w-full pixel-btn danger pixel-text-xs"
                >
                  CLEAR ALL
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog - Pixel Style */}
      {showConfirmation && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[400] p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowConfirmation(false)}
        >
          <div
            className="p-4 w-full max-w-xs pixel-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pixel-panel-header -m-4 mb-4">
              <span className="pixel-text-xs">Confirm</span>
            </div>
            <p className="pixel-text-xs mb-4 text-[var(--foreground)]">
              Clear all furniture?
              <br />
              <span className="text-[var(--pixel-blood)]">This cannot be undone.</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 pixel-btn pixel-text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllFurniture();
                  setShowConfirmation(false);
                }}
                className="flex-1 pixel-btn danger pixel-text-xs"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Build Mode Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          boxShadow: 'inset 0 0 100px rgba(244, 180, 26, 0.15)',
        }}
      />

      {/* Build Mode Instructions Banner - Pixel Style */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 z-[85] px-4 py-2 pixel-panel"
        style={{ borderLeft: '4px solid var(--pixel-gold)' }}
      >
        <div className="flex items-center gap-3 pixel-text-xs">
          <span className="text-[var(--pixel-gold)]">🔨 BUILD</span>
          <span className="text-[var(--pixel-border-dark)]">|</span>
          {selectedAsset ? (
            <span className="truncate max-w-[120px] md:max-w-none text-[var(--pixel-grass)]">
              Place: {selectedAsset.name}
            </span>
          ) : (
            <span className="text-[var(--muted-foreground)]">Select furniture</span>
          )}
          <span className="hidden sm:inline text-[var(--pixel-border-dark)]">|</span>
          <span className="hidden sm:inline text-[var(--muted-foreground)]">R: Rotate</span>
        </div>
      </div>
    </>
  );
}

export default function BuildModePanel() {
  return (
    <ErrorBoundary componentName="BuildModePanel">
      <BuildModeContent />
    </ErrorBoundary>
  );
}
