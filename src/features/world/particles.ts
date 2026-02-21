/**
 * Particle Effects System
 * For visual feedback on events and alerts
 */

import { CELL_SIZE } from '../engine/grid'

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  velocityY: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'spark' | 'glow' | 'alert' | 'success'
}

export interface ParticleSystem {
  particles: Particle[]
  maxParticles: number
}

/**
 * Create a new particle system
 */
export function createParticleSystem(maxParticles: number = 100): ParticleSystem {
  return {
    particles: [],
    maxParticles,
  }
}

/**
 * Spawn particles at a position
 */
export function spawnParticles(
  system: ParticleSystem,
  x: number,
  y: number,
  type: Particle['type'],
  count: number = 5
): void {
  const colors: Record<string, string> = {
    spark: '#00ffff',
    glow: '#ff00ff',
    alert: '#ef4444',
    success: '#22c55e',
  }
  
  for (let i = 0; i < count; i++) {
    if (system.particles.length >= system.maxParticles) {
      // Remove oldest particle
      system.particles.shift()
    }
    
    const angle = Math.random() * Math.PI * 2
    const speed = 0.02 + Math.random() * 0.05
    
    system.particles.push({
      id: `particle-${Date.now()}-${Math.random()}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 0.02, // Slight upward bias
      life: 1,
      maxLife: 500 + Math.random() * 500,
      size: 2 + Math.random() * 3,
      color: colors[type] || '#00ffff',
      type,
    })
  }
}

/**
 * Update all particles
 */
export function updateParticles(system: ParticleSystem, deltaTime: number): void {
  system.particles = system.particles.filter(particle => {
    // Update position
    particle.x += particle.vx * deltaTime
    particle.y += particle.velocityY * deltaTime
    
    // Update life
    particle.life -= deltaTime / particle.maxLife
    
    return particle.life > 0
  })
}

/**
 * Get particle styles for rendering
 */
export function getParticleStyles(particle: Particle): React.CSSProperties {
  return {
    position: 'absolute',
    left: particle.x,
    top: particle.y,
    width: particle.size,
    height: particle.size,
    backgroundColor: particle.color,
    borderRadius: '50%',
    opacity: particle.life,
    boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
    pointerEvents: 'none',
  }
}

/**
 * Spawn alert particles at grid position
 */
export function spawnAlertAtGrid(
  system: ParticleSystem,
  gridX: number,
  gridY: number,
  severity: 'warning' | 'critical'
): void {
  const pixelX = gridX * CELL_SIZE + CELL_SIZE / 2
  const pixelY = gridY * CELL_SIZE + CELL_SIZE / 2
  
  spawnParticles(
    system,
    pixelX,
    pixelY,
    severity === 'critical' ? 'alert' : 'spark',
    severity === 'critical' ? 10 : 5
  )
}

/**
 * Spawn success particles
 */
export function spawnSuccessAtGrid(
  system: ParticleSystem,
  gridX: number,
  gridY: number
): void {
  const pixelX = gridX * CELL_SIZE + CELL_SIZE / 2
  const pixelY = gridY * CELL_SIZE + CELL_SIZE / 2
  
  spawnParticles(system, pixelX, pixelY, 'success', 8)
}
