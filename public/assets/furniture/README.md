# Furniture Assets

This folder contains SVG sprites for all furniture objects in Super Space RPG.

## Asset Specifications

| Property | Value |
|----------|-------|
| Base Size | Variable (multi-tile) |
| Style | Cyber-pixel, clean lines |
| Format | SVG with subtle animations |

## Files

### desk.svg
Player work desk with computer setup.

**Size:** 2x1 tiles (64x32 pixels)

**Features:**
- Desk surface with edge detail
- Monitor mount area
- Keyboard tray
- Cable management

### chair.svg
Office chair for desk.

**Size:** 1x1 tiles (32x32 pixels)

**Variants:**
- [x] `chair.svg` - Standard office chair
- [ ] `chair-occupied.svg` - Chair with character

### meeting-table.svg
Large conference table for meeting room.

**Size:** 4x2 tiles (128x64 pixels)

**Features:**
- Rectangular table top
- Position markers for chairs
- Cable cutout details

### bookshelf.svg
Tall bookshelf for office storage.

**Size:** 2x1 tiles (64x32 pixels)

**Variants:**
- [ ] `bookshelf-empty.svg` - Empty shelves
- [ ] `bookshelf-full.svg` - Filled with books
- [ ] `bookshelf-mixed.svg` - Partially filled

### cabinet.svg
Filing cabinet for archives.

**Size:** 2x1 tiles (64x32 pixels)

**Features:**
- Multiple drawers
- Label holders
- Handle details

## Color Palette

```css
/* Wood tones */
--furniture-light: #64748b;
--furniture-dark: #475569;
--furniture-accent: #334155;

/* Metal hardware */
--hardware-metal: #94a3b8;
--hardware-dark: #64748b;

/* Fabrics */
--fabric-seat: #475569;
--fabric-accent: #00ffff;
```

## Future Improvements

1. **Interactive States**: Drawers that open/close
2. **Clutter Variants**: Papers, cups, personal items
3. **Damage States**: Wear and tear effects
4. **Seasonal Decor**: Holiday decorations
5. **Customization**: Player-placed items

## Usage in Code

```tsx
import deskSvg from '@/public/assets/furniture/desk.svg';

function Desk({ hasComputer }) {
  return (
    <div className="relative">
      <Image src={deskSvg} alt="Work Desk" width={64} height={32} />
      {hasComputer && <Monitor />}
    </div>
  );
}
```

## Interaction Notes

Furniture can have interaction points defined:
```typescript
const deskInteraction = {
  type: 'window:tasks',
  position: { x: 32, y: 0 }, // Center top
  radius: 16,
};
```
