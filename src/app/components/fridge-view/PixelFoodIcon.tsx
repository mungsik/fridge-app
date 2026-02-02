import { PIXEL_ART_MAP } from './pixelArtData';
import { detectCategory } from './fridgeConstants';

interface PixelFoodIconProps {
  name: string;
  category: string;
  size?: number;
}

export function PixelFoodIcon({ name, category, size = 32 }: PixelFoodIconProps) {
  const iconType = detectCategory(name, category);
  const data = PIXEL_ART_MAP[iconType] || PIXEL_ART_MAP['default'];
  const pixelSize = size / 16;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {data.map((row, y) =>
        row.map((color, x) =>
          color !== '' ? (
            <rect
              key={`${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
}
