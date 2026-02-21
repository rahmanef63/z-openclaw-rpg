/**
 * Business Data Simulation
 * Helper functions for business metrics simulation
 */

import type { BusinessMetric, VisualState } from '@/features/engine/types'

export interface SimulationState {
  lastUpdate: number
  trends: {
    tasks: 'up' | 'down' | 'stable'
    sales: 'up' | 'down' | 'stable'
    serverHealth: 'up' | 'down' | 'stable'
  }
}

/**
 * Create initial simulation state
 */
export function createSimulationState(): SimulationState {
  return {
    lastUpdate: Date.now(),
    trends: {
      tasks: 'stable',
      sales: 'stable',
      serverHealth: 'stable',
    },
  }
}

/**
 * Generate a random status based on value
 */
export function getStatusFromValue(value: number): VisualState {
  if (value >= 70) return 'healthy';
  if (value >= 30) return 'warning';
  return 'critical';
}

/**
 * Generate alert messages based on metrics
 */
export function generateAlertMessage(metricName: string, status: VisualState): string | null {
  switch (metricName) {
    case 'server_health':
      if (status === 'warning') {
        return '⚠️ Server performance degraded. Consider investigating the server rack.';
      }
      if (status === 'critical') {
        return '🚨 CRITICAL: Server failure imminent! Check the server rack immediately!';
      }
      return null;
    
    case 'tasks_completed':
      if (status === 'critical') {
        return '📉 Task completion is critically low. Visit your desk to complete tasks.';
      }
      return null;
    
    default:
      return null;
  }
}

/**
 * Generate welcome/random NPC messages
 */
export function generateRandomMessage(context: {
  tasksCompleted: number
  serverHealth: VisualState
}): string {
  const messages = [
    "How's your day going?",
    "I've been analyzing the latest data trends.",
    "Don't forget to check your tasks!",
    "The server seems stable today.",
    "I noticed you've been productive!",
    "Let me know if you need any assistance.",
    "Have you seen the analytics dashboard?",
    "Remember to take breaks occasionally.",
  ];
  
  // Context-aware messages
  if (context.serverHealth === 'critical') {
    return "🚨 We have a critical situation! The server needs attention!";
  }
  if (context.serverHealth === 'warning') {
    return "⚠️ I'm detecting some server anomalies. You might want to check it.";
  }
  if (context.tasksCompleted > 10) {
    return `Impressive! You've completed ${context.tasksCompleted} tasks today!`;
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get visual state for objects based on metrics
 */
export function getObjectVisualState(
  objectType: string,
  metrics: BusinessMetric[]
): VisualState {
  if (objectType === 'server_rack') {
    const serverMetric = metrics.find(m => m.metricName === 'server_health');
    return serverMetric?.status || 'healthy';
  }
  
  if (objectType === 'plant') {
    const tasksMetric = metrics.find(m => m.metricName === 'tasks_completed');
    if (tasksMetric && tasksMetric.value > 10) return 'healthy';
    return 'warning';
  }
  
  return 'healthy';
}
