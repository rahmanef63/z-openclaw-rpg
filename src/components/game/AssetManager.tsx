'use client';

import React, { useState, useEffect } from 'react';
import { useAssetLibrary } from '@/stores/assetLibrary';
import type { Asset, AssetCategory, AssetType } from '@/data/models';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import AssetCreator from './AssetCreator';
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Search,
  Filter,
  Link,
  Unlink,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Upload,
  Package,
  Bot,
  Calendar,
  Scroll,
  Sparkles,
  Play,
  ImageIcon,
} from 'lucide-react';

// ===========================================
// ASSET MANAGER PANEL
// ===========================================

function AssetManagerContent() {
  const [activeTab, setActiveTab] = useState<'assets' | 'agents' | 'events' | 'quests'>('assets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { 
    assets, 
    agents, 
    events, 
    quests,
    filterCategory,
    searchTerm,
    setFilterCategory,
    setSearchTerm,
    exportToJSON,
    importFromJSON,
  } = useAssetLibrary();
  
  const tabs = [
    { id: 'assets', label: 'Assets', icon: Package, count: assets.length },
    { id: 'agents', label: 'Agents', icon: Bot, count: agents.length },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
    { id: 'quests', label: 'Quests', icon: Scroll, count: quests.length },
  ] as const;
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div
        className="w-[900px] h-[600px] rounded-lg overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b"
          style={{ borderColor: '#334155' }}
        >
          <h2 className="font-mono text-lg font-bold" style={{ color: '#00ffff' }}>
            📦 Asset Manager
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const json = exportToJSON();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `asset-library-${Date.now()}.json`;
                a.click();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs"
              style={{ backgroundColor: '#1e293b', color: '#22c55e' }}
            >
              <Download size={12} />
              Export
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const json = e.target?.result as string;
                      importFromJSON(json);
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs"
              style={{ backgroundColor: '#1e293b', color: '#3b82f6' }}
            >
              <Upload size={12} />
              Import
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs"
              style={{ backgroundColor: '#00ffff20', color: '#00ffff' }}
            >
              <Sparkles size={12} />
              Create Asset
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: '#334155' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-mono transition-colors"
                style={{
                  color: activeTab === tab.id ? '#00ffff' : '#64748b',
                  backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent',
                  borderBottom: activeTab === tab.id ? '2px solid #00ffff' : 'none',
                }}
              >
                <Icon size={14} />
                {tab.label}
                <span
                  className="px-1.5 py-0.5 rounded text-[10px]"
                  style={{ backgroundColor: '#334155' }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Filter Bar */}
        <div
          className="flex items-center gap-3 p-3 border-b"
          style={{ borderColor: '#334155' }}
        >
          <div className="flex items-center gap-2">
            <Search size={14} style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                width: '200px',
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: '#64748b' }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as AssetCategory | 'all')}
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
              }}
            >
              <option value="all">All Categories</option>
              <option value="career">Career</option>
              <option value="physical">Physical</option>
              <option value="mental">Mental</option>
              <option value="social">Social</option>
              <option value="intellectual">Intellectual</option>
              <option value="recreation">Recreation</option>
              <option value="spiritual">Spiritual</option>
              <option value="environment">Environment</option>
            </select>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'assets' && <AssetListView />}
          {activeTab === 'agents' && <AgentListView />}
          {activeTab === 'events' && <EventListView />}
          {activeTab === 'quests' && <QuestListView />}
        </div>
      </div>
      
      {/* Create Modal - Using full-featured AssetCreator */}
      {showCreateModal && (
        <AssetCreator onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

// ===========================================
// ASSET LIST VIEW
// ===========================================

function AssetListView() {
  const { getFilteredAssets, selectAsset, selectedAssetId, removeAsset, updateAsset } = useAssetLibrary();
  const assets = getFilteredAssets();
  
  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-1/2 overflow-y-auto border-r" style={{ borderColor: '#334155' }}>
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => selectAsset(asset.id)}
            className="flex items-center gap-3 p-3 border-b cursor-pointer transition-colors"
            style={{
              borderColor: '#334155',
              backgroundColor: selectedAssetId === asset.id ? '#1e293b' : 'transparent',
            }}
          >
            <span className="text-2xl">{asset.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-sm" style={{ color: '#f8fafc' }}>
                {asset.name}
              </div>
              <div className="text-xs" style={{ color: '#64748b' }}>
                {asset.category} • {asset.width}x{asset.height}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Duplicate asset
                }}
                className="p-1 rounded hover:bg-slate-700"
              >
                <Copy size={12} style={{ color: '#64748b' }} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this asset?')) {
                    removeAsset(asset.id);
                  }
                }}
                className="p-1 rounded hover:bg-slate-700"
              >
                <Trash2 size={12} style={{ color: '#ef4444' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Details */}
      <div className="w-1/2 overflow-y-auto p-4">
        {selectedAssetId ? (
          <AssetDetails assetId={selectedAssetId} />
        ) : (
          <div className="text-center py-10">
            <Package size={32} className="mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>
              Select an asset to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// ASSET DETAILS
// ===========================================

function AssetDetails({ assetId }: { assetId: string }) {
  const { getAsset, updateAsset, agents, events, connectAssetToAgent, connectAssetToEvent } = useAssetLibrary();
  const asset = getAsset(assetId);
  
  // Check for animation data - use memoized check
  const hasAnimation = React.useMemo(() => {
    if (!asset?.sprite) return false;
    try {
      const animations = JSON.parse(localStorage.getItem('superspace-animations') || '{}');
      return !!animations[assetId];
    } catch {
      return false;
    }
  }, [assetId, asset?.sprite]);
  
  if (!asset) return null;
  
  return (
    <div>
      <div className="text-center mb-4">
        {/* Show sprite if available, otherwise show emoji */}
        {asset.sprite ? (
          <div className="inline-block">
            <img
              src={asset.sprite}
              alt={asset.name}
              className="w-16 h-16 object-contain mx-auto rounded"
              style={{ backgroundColor: '#1e293b' }}
            />
            {hasAnimation && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Play size={10} style={{ color: '#00ffff' }} />
                <span className="text-[10px]" style={{ color: '#00ffff' }}>Animated</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-4xl">{asset.icon}</span>
        )}
        <h3 className="font-mono text-lg font-bold mt-2" style={{ color: '#f8fafc' }}>
          {asset.name}
        </h3>
        <p className="text-xs" style={{ color: '#64748b' }}>
          {asset.nameEn}
        </p>
      </div>
      
      {/* Properties */}
      <div className="space-y-3">
        <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
          <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>ID</label>
          <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>{asset.id}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
            <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>Category</label>
            <div className="text-xs" style={{ color: '#f8fafc' }}>{asset.category}</div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
            <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>Rarity</label>
            <div className="text-xs" style={{ color: '#f8fafc' }}>{asset.rarity}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
            <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>Cost</label>
            <div className="text-xs" style={{ color: '#eab308' }}>{asset.cost} pts</div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
            <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>Size</label>
            <div className="text-xs" style={{ color: '#f8fafc' }}>{asset.width}x{asset.height}</div>
          </div>
        </div>
        
        {/* Connections */}
        <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>
              Connected Agents
            </label>
            <button
              onClick={() => {
                const agentId = prompt('Enter Agent ID:');
                if (agentId) connectAssetToAgent(assetId, agentId);
              }}
              className="p-1 rounded"
              style={{ backgroundColor: '#334155' }}
            >
              <Plus size={10} style={{ color: '#94a3b8' }} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {asset.connectedAgentIds.length === 0 ? (
              <span className="text-[10px]" style={{ color: '#64748b' }}>None</span>
            ) : (
              asset.connectedAgentIds.map(id => {
                const agent = agents.find(a => a.id === id);
                return (
                  <span
                    key={id}
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{ backgroundColor: '#ff00ff20', color: '#ff00ff' }}
                  >
                    {agent?.name || id}
                  </span>
                );
              })
            )}
          </div>
        </div>
        
        <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>
              Connected Events
            </label>
            <button
              onClick={() => {
                const eventId = prompt('Enter Event ID:');
                if (eventId) connectAssetToEvent(assetId, eventId);
              }}
              className="p-1 rounded"
              style={{ backgroundColor: '#334155' }}
            >
              <Plus size={10} style={{ color: '#94a3b8' }} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {asset.connectedEventIds.length === 0 ? (
              <span className="text-[10px]" style={{ color: '#64748b' }}>None</span>
            ) : (
              asset.connectedEventIds.map(id => {
                const event = events.find(e => e.id === id);
                return (
                  <span
                    key={id}
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{ backgroundColor: '#eab30820', color: '#eab308' }}
                  >
                    {event?.name || id}
                  </span>
                );
              })
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="p-2 rounded" style={{ backgroundColor: '#1e293b' }}>
          <label className="text-[10px] font-mono" style={{ color: '#64748b' }}>Tags</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {asset.tags.map(tag => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-[10px]"
                style={{ backgroundColor: '#334155', color: '#94a3b8' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// AGENT LIST VIEW
// ===========================================

function AgentListView() {
  const { agents, selectAgent, selectedAgentId, removeAgent } = useAssetLibrary();
  
  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-3 rounded border"
            style={{
              backgroundColor: '#1e293b',
              borderColor: selectedAgentId === agent.id ? '#ff00ff' : '#334155',
            }}
            onClick={() => selectAgent(agent.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{agent.avatar}</span>
              <div>
                <div className="font-medium text-sm" style={{ color: '#f8fafc' }}>
                  {agent.name}
                </div>
                <div className="text-[10px]" style={{ color: agent.color }}>
                  {agent.role}
                </div>
              </div>
            </div>
            <div className="text-[10px]" style={{ color: '#64748b' }}>
              Level {agent.level} • Position: ({agent.gridX}, {agent.gridY})
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                Assigned: {agent.assignedAssetIds.length} assets
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// EVENT LIST VIEW
// ===========================================

function EventListView() {
  const { events, updateEvent, removeEvent } = useAssetLibrary();
  
  return (
    <div className="p-4 overflow-y-auto h-full">
      {events.length === 0 ? (
        <div className="text-center py-10">
          <Calendar size={32} className="mx-auto mb-2" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>No events created yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded"
              style={{ backgroundColor: '#1e293b' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm" style={{ color: '#f8fafc' }}>
                    {event.name}
                  </div>
                  <div className="text-[10px]" style={{ color: '#64748b' }}>
                    {event.type} • {event.priority}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px]"
                    style={{
                      backgroundColor: event.isActive ? '#22c55e20' : '#334155',
                      color: event.isActive ? '#22c55e' : '#64748b',
                    }}
                  >
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================
// QUEST LIST VIEW
// ===========================================

function QuestListView() {
  const { quests, updateQuest, removeQuest } = useAssetLibrary();
  
  return (
    <div className="p-4 overflow-y-auto h-full">
      {quests.length === 0 ? (
        <div className="text-center py-10">
          <Scroll size={32} className="mx-auto mb-2" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>No quests created yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="p-3 rounded"
              style={{ backgroundColor: '#1e293b' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm" style={{ color: '#f8fafc' }}>
                    {quest.name}
                  </div>
                  <div className="text-[10px]" style={{ color: '#64748b' }}>
                    {quest.type} • {quest.objectives.length} objectives
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px]"
                  style={{
                    backgroundColor: 
                      quest.status === 'active' ? '#eab30820' :
                      quest.status === 'completed' ? '#22c55e20' :
                      quest.status === 'available' ? '#3b82f620' : '#334155',
                    color: 
                      quest.status === 'active' ? '#eab308' :
                      quest.status === 'completed' ? '#22c55e' :
                      quest.status === 'available' ? '#3b82f6' : '#64748b',
                  }}
                >
                  {quest.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================
// EXPORTS
// ===========================================

export default function AssetManager() {
  return (
    <ErrorBoundary componentName="AssetManager">
      <AssetManagerContent />
    </ErrorBoundary>
  );
}

export { AssetManagerContent };
