# Tile Assets

This folder contains SVG sprites for floor and wall tiles in Super Space RPG.

## Asset Specifications

| Property | Value |
|----------|-------|
| Base Size | 32x32 pixels (single tile) |
| Style | Seamless, repeating patterns |
| Format | SVG tiles |

## Files

### Floor Tiles

#### floor-basic.svg
Standard checkerboard floor tile.

**Features:**
- Two-tone pattern
- Subtle grid lines
- Ambient occlusion edges

#### floor-metal.svg
Industrial metal floor for tech areas.

**Features:**
- Plate pattern
- Bolt details
- Reflection highlights

#### floor-carpet.svg
Office carpet tile.

**Features:**
- Textured pattern
- Muted colors
- Soft appearance

### Wall Tiles

#### wall-basic.svg
Standard wall section.

**Features:**
- Height variation capability
- Top edge highlight
- Bottom shadow

#### wall-terminal.svg
Wall section with built-in terminal/screen.

**Features:**
- Embedded display
- Interactive highlight

#### wall-window.svg
Wall section with window.

**Features:**
- Transparent area
- Frame detail
- Outdoor background hint

## Color Palette

```css
/* Floor colors */
--floor-light: #1e293b;
--floor-dark: #1e3a5f;
--floor-accent: #0f172a;

/* Wall colors */
--wall-primary: #334155;
--wall-highlight: #475569;
--wall-shadow: #1e293b;

/* Grout/line colors */
--grout: #0f172a;
```

## Tiling System

Tiles use a seamless pattern system:

```typescript
const floorTile = {
  pattern: 'checkerboard',
  tileSize: 32,
  offset: (x: number, y: number) => (x + y) % 2 === 0,
};
```

## Future Improvements

1. **Wear Variants**: Damaged, dirty, clean versions
2. **Wet Effects**: Reflective overlays for spills/rain
3. **Interactive Tiles**: Pressure plates, triggers
4. **Edge Pieces**: Transitional tiles between floor types
5. **Parallax Layers**: Depth effect for 3D feel

## Usage in Code

```tsx
function FloorGrid({ width, height }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: width * height }).map((_, i) => {
        const x = i % width;
        const y = Math.floor(i / width);
        const isAlt = (x + y) % 2 === 0;
        return (
          <div
            key={`floor-${x}-${y}`}
            className="absolute"
            style={{
              left: x * TILE_SIZE,
              top: y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          >
            <Image 
              src={isAlt ? floorAlt : floorBasic} 
              alt="floor" 
              width={32} 
              height={32} 
            />
          </div>
        );
      })}
    </div>
  );
}
```

## Performance Notes

For large maps, consider:
1. Using CSS patterns instead of individual SVGs
2. Rendering floor as a single tiled background
3. Only rendering visible tiles (viewport culling)
