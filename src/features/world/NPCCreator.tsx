'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { COLORS, MAP_WIDTH, MAP_HEIGHT } from '@/features/engine/constants';
import { X, Plus, Trash2, User, Bot, MessageSquare } from 'lucide-react';

const NPC_TYPES = [
  { id: 'assistant', name: 'Assistant', color: '#00ffff', description: 'General helper NPC' },
  { id: 'security', name: 'Security', color: '#ef4444', description: 'Alert monitoring' },
  { id: 'analyst', name: 'Analyst', color: '#22c55e', description: 'Data analysis' },
  { id: 'developer', name: 'Developer', color: '#8b5cf6', description: 'Code review assistant' },
  { id: 'manager', name: 'Manager', color: '#eab308', description: 'Task coordination' },
];

const DEFAULT_MESSAGES = [
  "How can I help you?",
  "All systems operational!",
  "I've detected an anomaly.",
  "Great progress today!",
  "Need assistance?",
];

export default function NPCCreator() {
  const { showNPCCreator, toggleNPCCreator, npcs, addNPC, removeNPC } = useGameStore();
  const [newNPCName, setNewNPCName] = useState('');
  const [newNPCType, setNewNPCType] = useState('assistant');
  const [spawnX, setSpawnX] = useState(10);
  const [spawnY, setSpawnY] = useState(10);
  const [customMessage, setCustomMessage] = useState('');
  
  if (!showNPCCreator) return null;
  
  const selectedType = NPC_TYPES.find(t => t.id === newNPCType);
  
  const handleCreateNPC = () => {
    if (!newNPCName.trim()) {
      setNewNPCName(`Agent-${npcs.length + 1}`);
    }
    
    addNPC({
      name: newNPCName.trim() || `Agent-${npcs.length + 1}`,
      gridX: Math.min(spawnX, MAP_WIDTH - 1),
      gridY: Math.min(spawnY, MAP_HEIGHT - 1),
      targetGridX: null,
      targetGridY: null,
      isMoving: false,
      state: 'idle',
      message: customMessage || DEFAULT_MESSAGES[Math.floor(Math.random() * DEFAULT_MESSAGES.length)],
    });
    
    // Reset form
    setNewNPCName('');
    setCustomMessage('');
    setSpawnX(10);
    setSpawnY(10);
  };
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => e.target === e.currentTarget && toggleNPCCreator()}
    >
      <div
        className="w-[500px] max-h-[80vh] overflow-auto rounded-lg"
        style={{
          backgroundColor: COLORS.glass,
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `0 0 30px ${COLORS.accent}40`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ 
            backgroundColor: COLORS.background,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="flex items-center gap-2">
            <Bot size={20} style={{ color: COLORS.accent }} />
            <span className="font-mono font-bold" style={{ color: COLORS.accent }}>
              Agent Manager
            </span>
          </div>
          <button
            onClick={toggleNPCCreator}
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
            style={{ color: COLORS.critical }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Create New NPC Section */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}` }}
          >
            <h3 className="font-mono text-sm mb-3" style={{ color: COLORS.accent }}>
              Create New Agent
            </h3>
            
            {/* NPC Name */}
            <div className="mb-3">
              <label className="text-xs font-mono block mb-1" style={{ color: COLORS.textMuted }}>
                Name
              </label>
              <input
                type="text"
                value={newNPCName}
                onChange={(e) => setNewNPCName(e.target.value)}
                placeholder="Enter agent name..."
                className="w-full px-3 py-2 rounded text-sm font-mono"
                style={{
                  backgroundColor: '#000',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />
            </div>
            
            {/* NPC Type */}
            <div className="mb-3">
              <label className="text-xs font-mono block mb-1" style={{ color: COLORS.textMuted }}>
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {NPC_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setNewNPCType(type.id)}
                    className="p-2 rounded text-left text-xs font-mono transition-all"
                    style={{
                      backgroundColor: newNPCType === type.id ? type.color + '20' : 'transparent',
                      border: `1px solid ${newNPCType === type.id ? type.color : COLORS.border}`,
                      color: newNPCType === type.id ? type.color : COLORS.textMuted,
                    }}
                  >
                    <div className="font-bold">{type.name}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: '10px' }}>{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Spawn Position */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: COLORS.textMuted }}>
                  Spawn X (0-{MAP_WIDTH - 1})
                </label>
                <input
                  type="number"
                  min={0}
                  max={MAP_WIDTH - 1}
                  value={spawnX}
                  onChange={(e) => setSpawnX(Math.max(0, Math.min(MAP_WIDTH - 1, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded text-sm font-mono"
                  style={{
                    backgroundColor: '#000',
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: COLORS.textMuted }}>
                  Spawn Y (0-{MAP_HEIGHT - 1})
                </label>
                <input
                  type="number"
                  min={0}
                  max={MAP_HEIGHT - 1}
                  value={spawnY}
                  onChange={(e) => setSpawnY(Math.max(0, Math.min(MAP_HEIGHT - 1, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded text-sm font-mono"
                  style={{
                    backgroundColor: '#000',
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                  }}
                />
              </div>
            </div>
            
            {/* Custom Message */}
            <div className="mb-3">
              <label className="text-xs font-mono block mb-1" style={{ color: COLORS.textMuted }}>
                Initial Message
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Leave empty for random message..."
                className="w-full px-3 py-2 rounded text-sm font-mono"
                style={{
                  backgroundColor: '#000',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />
            </div>
            
            {/* Create Button */}
            <button
              onClick={handleCreateNPC}
              className="w-full py-2 rounded font-mono text-sm flex items-center justify-center gap-2 transition-all hover:brightness-125"
              style={{
                backgroundColor: selectedType?.color || COLORS.accent,
                color: COLORS.background,
              }}
            >
              <Plus size={16} />
              Spawn Agent
            </button>
          </div>
          
          {/* Existing NPCs List */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}` }}
          >
            <h3 className="font-mono text-sm mb-3" style={{ color: COLORS.accent }}>
              Active Agents ({npcs.length})
            </h3>
            
            <div className="space-y-2 max-h-40 overflow-auto">
              {npcs.map(npc => (
                <div
                  key={npc.id}
                  className="flex items-center justify-between p-2 rounded"
                  style={{ backgroundColor: '#000', border: `1px solid ${COLORS.border}` }}
                >
                  <div className="flex items-center gap-2">
                    <User size={14} style={{ color: COLORS.npc }} />
                    <div>
                      <div className="text-sm font-mono" style={{ color: COLORS.text }}>
                        {npc.name}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.textMuted }}>
                        Position: ({npc.gridX}, {npc.gridY})
                      </div>
                    </div>
                  </div>
                  {npc.id !== 'office-manager' && (
                    <button
                      onClick={() => removeNPC(npc.id)}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                      style={{ color: COLORS.critical }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSpawnX(Math.floor(Math.random() * MAP_WIDTH));
                setSpawnY(Math.floor(Math.random() * MAP_HEIGHT));
              }}
              className="flex-1 py-2 rounded font-mono text-xs"
              style={{
                backgroundColor: COLORS.border,
                color: COLORS.text,
              }}
            >
              🎲 Random Position
            </button>
            <button
              onClick={() => setNewNPCType(NPC_TYPES[Math.floor(Math.random() * NPC_TYPES.length)].id)}
              className="flex-1 py-2 rounded font-mono text-xs"
              style={{
                backgroundColor: COLORS.border,
                color: COLORS.text,
              }}
            >
              🎲 Random Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
