# Electronics Assets

This folder contains SVG sprites for all electronic and tech equipment in Super Space RPG.

## Asset Specifications

| Property | Value |
|----------|-------|
| Base Size | Variable (multi-tile) |
| Style | Cyber-pixel, neon accents |
| Format | SVG with state variants |

## Files

### server-rack.svg
Server rack equipment - primary data visualization object.

**Size:** 1x2 tiles (32x64 pixels)

**State Variants:**
- [x] `server-rack-healthy.svg` - Green LEDs, normal operation
- [x] `server-rack-warning.svg` - Yellow LEDs, degraded state
- [x] `server-rack-critical.svg` - Red LEDs with smoke/spark effects

**Visual States:**
- Healthy: Green blinking LEDs, subtle glow
- Warning: Yellow/amber LEDs, pulsing effect
- Critical: Red LEDs, smoke particles, spark animations

### terminal.svg
Computer terminal workstation.

**Size:** 2x1 tiles (64x32 pixels)

**Features:**
- CRT monitor with scanlines
- Keyboard
- Status LED

### monitor.svg
Desktop monitor for desks.

**Size:** 40x24 pixels

**Variants:**
- [ ] `monitor-off.svg` - Powered off state
- [ ] `monitor-on.svg` - Active with screen glow
- [ ] `monitor-screensaver.svg` - Screensaver animation

## Color Palette by State

```css
/* Healthy */
--state-healthy: #22c55e;
--state-healthy-glow: rgba(34, 197, 94, 0.5);

/* Warning */
--state-warning: #eab308;
--state-warning-glow: rgba(234, 179, 8, 0.5);

/* Critical */
--state-critical: #ef4444;
--state-critical-glow: rgba(239, 68, 68, 0.7);

/* Neutral */
--electronics-body: #1e293b;
--electronics-screen: #0f172a;
--electronics-accent: #00ffff;
```

## Future Improvements

1. **Animated LEDs**: SVG SMIL animations for blinking
2. **Screen Content**: Dynamic data display on monitors
3. **Cable Details**: Add cable/connection details
4. **Scale Variants**: Different rack sizes (1U, 2U, 4U)
5. **Interactive Hotspots**: Clickable areas for controls

## Usage in Code

```tsx
import { getServerRackSprite } from '@/features/world/assets';

function ServerRack({ status }) {
  const sprite = getServerRackSprite(status); // 'healthy' | 'warning' | 'critical'
  return (
    <div className="relative">
      <Image src={sprite} alt="Server" width={32} height={64} />
      {status === 'critical' && <SmokeEffect />}
    </div>
  );
}
```

## Animation Notes

For LED blinking, use CSS animations:
```css
@keyframes led-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.led {
  animation: led-blink 1s ease-in-out infinite;
}
```

For critical state smoke:
```css
@keyframes smoke-rise {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
}
```
