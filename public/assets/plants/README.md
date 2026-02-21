# Plant Assets

This folder contains SVG sprites for all plant decorations in Super Space RPG.

## Asset Specifications

| Property | Value |
|----------|-------|
| Base Size | 1x1 tile (32x32 pixels) |
| Style | Stylized, bloom-responsive |
| Format | SVG with growth states |

## Files

### office-plant.svg
Standard potted plant for office decoration.

**Size:** 1x1 tiles (32x32 pixels)

**Growth States:**
- [x] `plant-wilted.svg` - Low task completion (drooping, pale)
- [x] `plant-healthy.svg` - Normal state (green, perky)
- [x] `plant-blooming.svg` - High task completion (flowers, vibrant)

**Visual States:**
- Wilted: Pale green, drooping leaves
- Healthy: Bright green, upright posture
- Blooming: Vibrant green with cyan/pink flowers

### large-plant.svg
Floor plant for office corners.

**Size:** 2x2 tiles (64x64 pixels)

**Features:**
- Larger decorative pot
- Multiple stems
- Broad leaves

## Color Palette

```css
/* Plant health states */
--plant-wilted: #6b8e6b;     /* Pale, sad green */
--plant-healthy: #22c55e;     /* Bright green */
--plant-blooming: #10b981;    /* Vibrant green */

/* Flower colors */
--flower-cyan: #00ffff;
--flower-pink: #ff6b9d;
--flower-white: #f8fafc;

/* Pot colors */
--pot-primary: #7c3aed;       /* Purple */
--pot-secondary: #6d28d9;
--pot-terracotta: #c2410c;
```

## Data Integration

Plants respond to the `tasks_completed` metric:

```typescript
const plantState = useMemo(() => {
  const tasks = metrics.find(m => m.metricName === 'tasks_completed');
  if (tasks?.value > 20) return 'blooming';
  if (tasks?.value > 5) return 'healthy';
  return 'wilted';
}, [metrics]);
```

## Future Improvements

1. **Species Variants**: Different plant types (succulent, fern, cactus)
2. **Seasonal Changes**: Winter dormancy, spring growth
3. **Watering Mechanic**: Player interaction to maintain health
4. **Particle Effects**: Pollen, falling leaves
5. **Growth Animation**: Gradual size increase over time

## Usage in Code

```tsx
import { getPlantSprite } from '@/features/world/assets';

function OfficePlant({ taskCount }) {
  const state = taskCount > 20 ? 'blooming' : taskCount > 5 ? 'healthy' : 'wilted';
  const sprite = getPlantSprite(state);
  
  return (
    <div className="relative">
      <Image src={sprite} alt="Office Plant" width={32} height={32} />
      {state === 'blooming' && <SparkleEffect />}
    </div>
  );
}
```

## Animation Notes

For subtle plant sway:
```css
@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
.plant-leaves {
  animation: sway 4s ease-in-out infinite;
  transform-origin: bottom center;
}
```

For blooming flowers:
```css
@keyframes bloom-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
.flower {
  animation: bloom-pulse 2s ease-in-out infinite;
}
```
