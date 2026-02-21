# Effect Assets

This folder contains SVG sprites for visual effects and particles in Super Space RPG.

## Asset Specifications

| Property | Value |
|----------|-------|
| Base Size | Variable |
| Style | Semi-transparent, animated |
| Format | SVG with CSS animations |

## Files

### Particles

#### spark.svg
Electrical spark effect for critical states.

**Features:**
- Flash animation
- Random position generation
- Color variations

#### smoke.svg
Smoke particle for overheating effects.

**Features:**
- Rising animation
- Fade out effect
- Scale increase

#### glow-ring.svg
Pulsing glow ring for interactive objects.

**Features:**
- Pulse animation
- Scalable radius
- Color customizable

### Status Effects

#### alert-indicator.svg
Exclamation mark alert above objects.

**Features:**
- Bounce animation
- High visibility
- Multiple color states

#### interaction-prompt.svg
"Press E" interaction prompt.

**Features:**
- Fade in/out
- Key icon
- Contextual text

### Ambient Effects

#### scanline.svg
CRT scanline overlay effect.

**Features:**
- Moving scanline
- Semi-transparent
- Full screen overlay

#### dust-particle.svg
Floating dust particle for atmosphere.

**Features:**
- Slow drift
- Random movement
- Low opacity

## Color Palette

```css
/* Effect colors */
--effect-cyan: #00ffff;
--effect-magenta: #ff00ff;
--effect-warning: #eab308;
--effect-critical: #ef4444;
--effect-smoke: #6b7280;
```

## Animation Templates

### Spark Flash
```css
@keyframes spark {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); }
}
```

### Smoke Rise
```css
@keyframes smoke-rise {
  0% { 
    transform: translateY(0) scale(1); 
    opacity: 0.6; 
  }
  100% { 
    transform: translateY(-30px) scale(1.5); 
    opacity: 0; 
  }
}
```

### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.5; 
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0.8; 
  }
}
```

## Future Improvements

1. **Particle System**: Configurable particle emitters
2. **Shader Effects**: WebGL post-processing
3. **Weather Effects**: Rain, snow, lightning
4. **Impact Effects**: Collision sparks, dust clouds
5. **UI Effects**: Button hover, click feedback

## Usage in Code

```tsx
function SparkEffect({ x, y }) {
  return (
    <div 
      className="absolute animate-spark pointer-events-none"
      style={{ left: x, top: y }}
    >
      <Image src="/assets/effects/spark.svg" alt="" width={16} height={16} />
    </div>
  );
}

function SmokeEmitter({ active }) {
  if (!active) return null;
  
  return (
    <div className="absolute pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i}
          className="animate-smoke-rise"
          style={{ animationDelay: `${i * 0.5}s` }}
        >
          <Image src="/assets/effects/smoke.svg" alt="" width={24} height={24} />
        </div>
      ))}
    </div>
  );
}
```

## Performance Notes

1. Use CSS animations over JavaScript for simple effects
2. Implement object pooling for particle systems
3. Limit simultaneous particle count
4. Use `will-change: transform` for animated elements
5. Consider canvas-based rendering for many particles
