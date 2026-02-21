# Character Assets

This folder contains SVG sprites for all character types in Super Space RPG.

## Asset Specifications

| Property | Value |
|----------|-------|
| Base Size | 32x32 pixels |
| Scale | 2x render (displayed at 64x64) |
| Style | Cyber-pixel, neon accents |
| Format | SVG with embedded styles |

## Files

### player.svg
The main player character sprite.

**Variants Needed:**
- [ ] `player-idle.svg` - Standing animation (2-4 frames)
- [ ] `player-walk-up.svg` - Walking upward (4-8 frames)
- [ ] `player-walk-down.svg` - Walking downward (4-8 frames)
- [ ] `player-walk-left.svg` - Walking left (4-8 frames)
- [ ] `player-walk-right.svg` - Walking right (4-8 frames)
- [ ] `player-interact.svg` - Interaction animation

**Current Features:**
- Cyan (#00ffff) body with glow effect
- Direction indicator (eyes)
- Smooth rounded shape

### npc-aria.svg
The AI assistant NPC "ARIA" - Office Manager.

**Variants Needed:**
- [ ] `npc-aria-idle.svg` - Floating idle animation
- [ ] `npc-aria-alert.svg` - Alert/delivery animation
- [ ] `npc-aria-happy.svg` - Positive notification state

**Current Features:**
- Magenta (#ff00ff) body with glow
- Rounded robotic shape
- Speech bubble attachment point

## Color Palette

```css
--player-primary: #00ffff;    /* Cyan */
--player-glow: rgba(0, 255, 255, 0.5);
--npc-primary: #ff00ff;       /* Magenta */
--npc-glow: rgba(255, 0, 255, 0.5);
```

## Future Improvements

1. **Animation Spritesheets**: Create multi-frame SVGs with CSS animations
2. **Character Customization**: Add color variants for multiplayer
3. **Directional Sprites**: 4 or 8 direction movement sprites
4. **Particle Attachments**: Trail effects for movement
5. **State Indicators**: Visual feedback for player actions

## Usage in Code

```tsx
import playerSvg from '@/public/assets/characters/player.svg';

// In component
<Image src={playerSvg} alt="Player" width={32} height={32} />
```

## Design Guidelines

- Keep paths simple for performance
- Use CSS custom properties where possible
- Maintain consistent stroke widths (1-2px)
- Include appropriate viewBox for each sprite
- Test at both 1x and 2x scales
