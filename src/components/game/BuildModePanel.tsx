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
        className={`absolute right-0 top-10 bottom-0 z-[90] overflow-hidden flex flex-col transition-all duration-300 ${
          isMobile ? 'rounded-tl-lg' : ''
        }`}
        style={{
          width: panelWidth,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderLeft: '1px solid #334155',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <div
          className="p-2 md:p-3 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: '#334155' }}
        >
          <div className="flex items-center gap-2">
            <Hammer size={16} style={{ color: '#eab308' }} />
            {(!isTablet || !panelCollapsed) && (
              <span className="font-mono text-xs md:text-sm font-bold" style={{ color: '#eab308' }}>
                Build Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Tablet collapse button */}
            {isTablet && (
              <button
                onClick={() => setPanelCollapsed(!panelCollapsed)}
                className="p-1 rounded hover:bg-slate-700"
                style={{ color: '#94a3b8' }}
              >
                {panelCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
            
            {!panelCollapsed && (
              <>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-1 rounded hover:bg-slate-700"
                  style={{ color: showHelp ? '#00ffff' : '#94a3b8' }}
                  title="Help"
                >
                  <Info size={14} />
                </button>
                <button
                  onClick={rotateClockwise}
                  className="p-1 rounded hover:bg-slate-700"
                  style={{ color: '#94a3b8' }}
                  title="Rotate (R)"
                >
                  <RotateCw size={14} />
                </button>
              </>
            )}
            <button
              onClick={toggleBuildMode}
              className="p-1 rounded hover:bg-slate-700"
              style={{ color: '#ef4444' }}
              title="Close Build Mode (B)"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Collapsed view for tablet */}
        {panelCollapsed && isTablet ? (
          <div className="flex flex-col items-center py-2 gap-2">
            <button
              onClick={() => setPanelCollapsed(false)}
              className="p-2 rounded hover:bg-slate-700"
              style={{ backgroundColor: '#1e293b' }}
              title="Expand panel"
            >
              <ChevronLeft size={16} style={{ color: '#00ffff' }} />
            </button>
            <button
              onClick={rotateClockwise}
              className="p-2 rounded hover:bg-slate-700"
              style={{ backgroundColor: '#1e293b' }}
              title="Rotate (R)"
            >
              <RotateCw size={16} style={{ color: '#eab308' }} />
            </button>
            <div className="text-[10px] font-mono text-center" style={{ color: '#64748b' }}>
              {rotation}°
            </div>
          </div>
        ) : (
          <>
            {/* Help Panel */}
            {showHelp && (
              <div
                className="p-2 md:p-3 border-b flex-shrink-0"
                style={{ borderColor: '#334155', backgroundColor: '#1e293b' }}
              >
                <div className="text-[10px] md:text-xs font-mono space-y-1" style={{ color: '#94a3b8' }}>
                  <div className="flex items-center gap-2">
                    <MousePointer size={12} />
                    <span>Click on grid to place furniture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCw size={12} />
                    <span>Press R to rotate before placing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Move size={12} />
                    <span>Click furniture to select</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trash2 size={12} />
                    <span>Right-click to delete selected</span>
                  </div>
                  <div className="mt-2 pt-2 hidden md:block" style={{ borderTop: '1px solid #334155' }}>
                    <span style={{ color: '#64748b' }}>Keyboard shortcuts:</span>
                    <div className="mt-1 pl-2 space-y-0.5">
                      <div><span style={{ color: '#00ffff' }}>B</span> - Toggle build mode</div>
                      <div><span style={{ color: '#00ffff' }}>R</span> - Rotate furniture</div>
                      <div><span style={{ color: '#00ffff' }}>ESC</span> - Deselect / Close</div>
                      <div><span style={{ color: '#00ffff' }}>DEL</span> - Remove selected</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rotation indicator */}
            <div
              className="px-2 md:px-3 py-2 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: '#334155', backgroundColor: '#0f172a' }}
            >
              <span className="text-[10px] md:text-xs font-mono" style={{ color: '#94a3b8' }}>
                Rotation: <span style={{ color: '#00ffff' }}>{rotation}°</span>
              </span>
              <div className="flex gap-0.5 md:gap-1">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => useBuildStore.getState().setRotation(deg as 0 | 90 | 180 | 270)}
                    className={`px-1.5 md:px-2 py-0.5 rounded text-[9px] md:text-[10px] font-mono ${
                      rotation === deg ? 'ring-1 ring-cyan-400' : ''
                    }`}
                    style={{ 
                      backgroundColor: rotation === deg ? '#00ffff20' : '#1e293b', 
                      color: rotation === deg ? '#00ffff' : '#64748b' 
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
                className="p-2 md:p-3 border-b flex-shrink-0"
                style={{ borderColor: '#00ffff', backgroundColor: '#00ffff10' }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
                    style={{ 
                      backgroundColor: `${ASPECT_NAMES[selectedAsset.category].color}20`, 
                      border: `1px solid ${ASPECT_NAMES[selectedAsset.category].color}` 
                    }}
                  >
                    {selectedAsset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-medium truncate" style={{ color: '#f8fafc' }}>
                      {selectedAsset.name}
                    </div>
                    <div className="text-[10px] truncate" style={{ color: '#64748b' }}>
                      {selectedAsset.nameEn} • {selectedAsset.width}x{selectedAsset.height}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: ASPECT_NAMES[selectedAsset.category].color }}>
                      {ASPECT_NAMES[selectedAsset.category].name}
                    </div>
                  </div>
                  <button
                    onClick={() => selectAsset(null)}
                    className="p-1 rounded hover:bg-slate-700 flex-shrink-0"
                    style={{ color: '#94a3b8' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="mt-1.5 text-[10px] font-mono text-center" style={{ color: '#22c55e' }}>
                  Click on grid to place
                </div>
              </div>
            )}

            {/* Furniture Catalog */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-1.5 md:p-2">
                <div className="text-[10px] md:text-xs font-mono mb-1.5 md:mb-2" style={{ color: '#94a3b8' }}>
                  Furniture Catalog
                </div>

                {/* Categories */}
                {(Object.entries(groupedFurniture) as [LifeAspect, typeof groupedFurniture[LifeAspect]][]).map(([category, furniture]) => {
                  const info = ASPECT_NAMES[category];
                  const isExpanded = expandedCategory === category;

                  return (
                    <div key={category} className="mb-0.5 md:mb-1">
                      {/* Category Header */}
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category)}
                        className="w-full flex items-center justify-between p-1.5 md:p-2 rounded transition-colors"
                        style={{
                          backgroundColor: isExpanded ? info.color + '20' : '#1e293b',
                          border: isExpanded ? `1px solid ${info.color}` : '1px solid transparent',
                        }}
                      >
                        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                          <span className="text-sm md:text-base flex-shrink-0">{CATEGORY_ICONS[category]}</span>
                          <span className="text-[10px] md:text-xs truncate" style={{ color: '#f8fafc' }}>
                            {info.name}
                          </span>
                          <span
                            className="text-[9px] md:text-[10px] px-1 rounded flex-shrink-0"
                            style={{ backgroundColor: info.color + '30', color: info.color }}
                          >
                            {furniture.length}
                          </span>
                        </div>
                        <span
                          className="text-[10px] transition-transform flex-shrink-0"
                          style={{ 
                            color: '#94a3b8',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            display: 'inline-block',
                          }}
                        >
                          ▼
                        </span>
                      </button>

                      {/* Furniture List */}
                      {isExpanded && (
                        <div className="mt-0.5 md:mt-1 ml-1 md:ml-2 space-y-0.5 md:space-y-1">
                          {furniture.map((item) => {
                            const isSelected = selectedAssetId === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => selectAsset(isSelected ? null : item.id)}
                                className="w-full flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 rounded text-left transition-colors"
                                style={{
                                  backgroundColor: isSelected ? '#00ffff20' : '#0f172a',
                                  border: isSelected ? '1px solid #00ffff' : '1px solid #334155',
                                }}
                              >
                                <span className="text-base md:text-lg flex-shrink-0">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] md:text-xs truncate" style={{ color: '#f8fafc' }}>
                                    {item.name}
                                  </div>
                                  <div className="text-[9px] md:text-[10px] truncate" style={{ color: '#64748b' }}>
                                    {item.width}x{item.height}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#00ffff' }} />
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
                className="p-2 md:p-3 border-t flex-shrink-0"
                style={{ borderColor: '#00ffff', backgroundColor: '#1e293b' }}
              >
                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                  <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                    <span className="text-base md:text-lg flex-shrink-0">{getFurnitureById(selectedFurniture.assetId)?.icon || '📦'}</span>
                    <span className="text-[10px] md:text-xs font-mono truncate" style={{ color: '#00ffff' }}>
                      {selectedFurniture.name}
                    </span>
                  </div>
                  <button
                    onClick={() => selectPlaced(null)}
                    className="p-1 rounded hover:bg-slate-700 flex-shrink-0"
                  >
                    <X size={12} style={{ color: '#94a3b8' }} />
                  </button>
                </div>
                <div className="text-[9px] md:text-[10px] mb-1.5 md:mb-2" style={{ color: '#64748b' }}>
                  Pos: ({selectedFurniture.gridX}, {selectedFurniture.gridY}) • Rot: {selectedFurniture.rotation}°
                </div>
                <button
                  onClick={() => removeFurniture(selectedFurniture.id)}
                  className="w-full flex items-center justify-center gap-1 p-1.5 md:p-2 rounded text-[10px] md:text-xs font-mono"
                  style={{
                    backgroundColor: '#ef444420',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                  }}
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            )}

            {/* Footer */}
            <div
              className="p-2 md:p-3 border-t flex-shrink-0"
              style={{ borderColor: '#334155' }}
            >
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <span className="text-[10px] md:text-xs font-mono" style={{ color: '#94a3b8' }}>
                  {placedFurniture.length} items
                </span>
                <span className="text-[9px] md:text-[10px] font-mono" style={{ color: '#64748b' }}>
                  Press B to exit
                </span>
              </div>
              {placedFurniture.length > 0 && (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="w-full p-1.5 md:p-2 rounded text-[10px] md:text-xs font-mono hover:bg-red-500/20 transition-colors"
                  style={{
                    backgroundColor: '#ef444410',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[400] p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowConfirmation(false)}
        >
          <div
            className="p-4 rounded-lg w-full max-w-xs"
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs md:text-sm mb-4" style={{ color: '#f8fafc' }}>
              Clear all furniture? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 p-2 rounded text-xs font-mono"
                style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllFurniture();
                  setShowConfirmation(false);
                }}
                className="flex-1 p-2 rounded text-xs font-mono"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
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
          boxShadow: 'inset 0 0 100px rgba(234, 179, 8, 0.1)',
        }}
      />

      {/* Build Mode Instructions Banner */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 z-[85] px-3 md:px-4 py-1.5 md:py-2 rounded-lg"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid #eab308',
        }}
      >
        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-mono">
          <span style={{ color: '#eab308' }}>🔨 BUILD</span>
          <span style={{ color: '#64748b' }}>|</span>
          {selectedAsset ? (
            <span className="truncate max-w-[120px] md:max-w-none" style={{ color: '#22c55e' }}>
              Place: {selectedAsset.name}
            </span>
          ) : (
            <span style={{ color: '#94a3b8' }}>Select furniture</span>
          )}
          <span className="hidden sm:inline" style={{ color: '#64748b' }}>|</span>
          <span className="hidden sm:inline" style={{ color: '#64748b' }}>R: Rotate</span>
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
