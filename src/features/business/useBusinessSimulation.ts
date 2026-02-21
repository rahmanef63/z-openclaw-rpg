'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { VisualState } from '@/features/engine/types';

/**
 * Hook to simulate business data changes
 * In production, this would connect to real data sources via webhooks
 */
export function useBusinessSimulation() {
  const { updateMetric, addNotification, setNPCMessage, npcs } = useGameStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const simulateMetrics = useCallback(() => {
    // Randomly fluctuate server health
    const serverHealthValue = Math.random() * 100;
    let serverStatus: VisualState = 'healthy';
    if (serverHealthValue < 20) {
      serverStatus = 'critical';
    } else if (serverHealthValue < 50) {
      serverStatus = 'warning';
    }
    
    updateMetric('server_health', Math.round(serverHealthValue), serverStatus);
    
    // If critical, trigger alert
    if (serverStatus === 'critical') {
      addNotification('Server health critical!', 'critical');
      
      // Have NPC alert the player
      const officeManager = npcs.find(n => n.id === 'office-manager');
      if (officeManager && !officeManager.message) {
        setNPCMessage('office-manager', 'Boss! The server is overheating!');
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setNPCMessage('office-manager', '');
        }, 5000);
      }
    }
    
    // Randomly increment tasks completed
    if (Math.random() > 0.7) {
      const tasksCompleted = Math.floor(Math.random() * 5) + 1;
      const currentTasks = useGameStore.getState().metrics.find(m => m.metricName === 'tasks_completed')?.value || 0;
      updateMetric('tasks_completed', currentTasks + tasksCompleted, 'healthy');
      
      if (tasksCompleted > 2) {
        addNotification(`${tasksCompleted} tasks completed!`, 'info');
      }
    }
    
    // Randomly fluctuate sales
    const salesDelta = Math.floor(Math.random() * 200) - 50;
    const currentSales = useGameStore.getState().metrics.find(m => m.metricName === 'sales_today')?.value || 0;
    updateMetric('sales_today', Math.max(0, currentSales + salesDelta), 'healthy');
    
  }, [updateMetric, addNotification, setNPCMessage, npcs]);
  
  useEffect(() => {
    // Run simulation every 5 seconds
    intervalRef.current = setInterval(simulateMetrics, 5000);
    
    // Initial simulation
    simulateMetrics();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [simulateMetrics]);
  
  return null;
}

/**
 * Hook to manage AI agent behavior
 */
export function useAIAgent() {
  const { npcs, playerGridPos, setNPCMessage, moveNPC } = useGameStore();
  
  const moveAgentToPlayer = useCallback(() => {
    const agent = npcs.find(n => n.id === 'office-manager');
    if (!agent) return;
    
    // Simple pathfinding - move towards player
    const dx = playerGridPos.gridX - agent.gridX;
    const dy = playerGridPos.gridY - agent.gridY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      moveNPC(agent.id, agent.gridX + Math.sign(dx), agent.gridY);
    } else if (dy !== 0) {
      moveNPC(agent.id, agent.gridX, agent.gridY + Math.sign(dy));
    }
  }, [npcs, playerGridPos, moveNPC]);
  
  return { moveAgentToPlayer };
}
