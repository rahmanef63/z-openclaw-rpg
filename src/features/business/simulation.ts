/**
 * Business Data Simulation
 * Generates simulated business metrics for the game
 */

import type { BusinessMetric } from '@/stores/gameStore'

export interface SimulationState {
  lastUpdate: number
  trends: {
    tasks: 'up' | 'down' | 'stable'
    sales: 'up' | 'down' | 'stable'
    productivity: 'up' | 'down' | 'stable'
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
      productivity: 'stable',
    },
  }
}

/**
 * Simulate business metrics changes
 */
export function simulateMetrics(
  current: BusinessMetric,
  state: SimulationState,
  deltaTime: number
): Partial<BusinessMetric> {
  const updates: Partial<BusinessMetric> = {}
  
  // Random chance for various events
  const eventChance = Math.random()
  
  // Server health degradation (rare)
  if (eventChance > 0.995 && current.serverHealth === 'healthy') {
    updates.serverHealth = 'warning'
  } else if (eventChance > 0.998 && current.serverHealth === 'warning') {
    updates.serverHealth = 'critical'
  }
  
  // Productivity fluctuation
  if (Math.random() > 0.9) {
    const change = Math.floor(Math.random() * 10) - 3
    updates.productivity = Math.max(20, Math.min(100, current.productivity + change))
  }
  
  // Sales slowly increase
  if (Math.random() > 0.7) {
    updates.sales = current.sales + Math.random() * 50
  }
  
  return updates
}

/**
 * Generate alert messages based on metrics
 */
export function generateAlertMessage(metric: keyof BusinessMetric, value: unknown): string | null {
  switch (metric) {
    case 'serverHealth':
      if (value === 'warning') {
        return '⚠️ Server performance degraded. Consider investigating the server rack.'
      }
      if (value === 'critical') {
        return '🚨 CRITICAL: Server failure imminent! Check the server rack immediately!'
      }
      return null
    
    case 'productivity':
      if (typeof value === 'number') {
        if (value < 30) {
          return '📉 Productivity is critically low. Visit your desk to complete tasks.'
        }
        if (value > 90) {
          return '⚡ Productivity is outstanding! Keep up the great work!'
        }
      }
      return null
    
    default:
      return null
  }
}

/**
 * Generate welcome/random NPC messages
 */
export function generateRandomMessage(context: {
  tasksCompleted: number
  serverHealth: string
  productivity: number
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
  ]
  
  // Context-aware messages
  if (context.serverHealth === 'critical') {
    return "🚨 We have a critical situation! The server needs attention!"
  }
  if (context.serverHealth === 'warning') {
    return "⚠️ I'm detecting some server anomalies. You might want to check it."
  }
  if (context.productivity < 40) {
    return "Your productivity seems low. Maybe complete some tasks?"
  }
  if (context.tasksCompleted > 10) {
    return `Impressive! You've completed ${context.tasksCompleted} tasks today!`
  }
  
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get visual state for objects based on metrics
 */
export function getObjectVisualState(
  objectType: string,
  metrics: BusinessMetric
): string {
  switch (objectType) {
    case 'server_rack':
      return metrics.serverHealth
    
    case 'plant':
      // Plants bloom when tasks completed is high
      if (metrics.tasks > 10) return 'blooming'
      return 'normal'
    
    default:
      return 'default'
  }
}
