import React from 'react';

const FONT: Record<string, string[]> = {
  'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  '3': ['#### ', '    #', ' ### ', '    #', '#### '],
  'Q': [' ### ', '#   #', '#   #', '# ## ', ' ## #'],
  'A': [' ### ', '#   #', '#####', '#   #', '#   #'],
  'I': ['###', ' # ', ' # ', ' # ', '###'],
  'L': ['#    ', '#    ', '#    ', '#    ', '#####'],
  'B': ['#### ', '#   #', '#### ', '#   #', '#### '],
  'S': [' ####', '#    ', ' ### ', '    #', '#### '],
  ' ': ['  ', '  ', '  ', '  ', '  '],
};

function buildPixelGrid(text: string): boolean[][] {
  const rows = 5;
  const result: boolean[][] = Array.from({ length: rows }, () => []);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i].toUpperCase();
    const glyph = FONT[ch] || FONT[' '];

    if (i > 0) {
      for (let r = 0; r < rows; r++) result[r].push(false);
    }

    for (let r = 0; r < rows; r++) {
      for (const pixel of glyph[r]) {
        result[r].push(pixel === '#');
      }
    }
  }

  return result;
}

const COLOR = '#d4806a';
const PIXEL = 8;
const GAP = 2;

export function PixelBanner() {
  const lines = [buildPixelGrid('T3Q'), buildPixelGrid('AI LABS')];

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Tagline */}
      <div
        style={{
          border: `1px solid ${COLOR}`,
          padding: '6px 14px',
          display: 'inline-block',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            color: COLOR,
            fontSize: 13,
          }}
        >
          ✳ don't forget your items.
        </span>
      </div>

      {/* Pixel art text */}
      <div style={{ overflowX: 'auto' }}>
        {lines.map((grid, li) => (
          <div key={li} style={{ marginBottom: GAP * 4 }}>
            {grid.map((row, r) => (
              <div key={r} style={{ display: 'flex', gap: GAP, marginBottom: GAP }}>
                {row.map((filled, c) => (
                  <div
                    key={c}
                    style={{
                      width: PIXEL,
                      height: PIXEL,
                      background: filled ? COLOR : 'transparent',
                      boxShadow: filled
                        ? 'inset 0 0 0 1px rgba(0,0,0,0.2)'
                        : 'none',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
