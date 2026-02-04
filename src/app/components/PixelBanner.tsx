import React from 'react';

const ROWS = 7;
const PIXEL = 10;
const GAP = 2;
const CHAR_GAP = 5;
const WORD_GAP = 18;
const LINE_GAP = 14;
const COLOR = '#d4806a';
const BORDER_COLOR = '#9e5040';

// 7-row tall, 2-block-wide stroke font
const FONT: Record<string, string[]> = {
  '#': [
    ' ## ## ',
    '#######',
    ' ## ## ',
    ' ## ## ',
    '#######',
    ' ## ## ',
    ' ## ## ',
  ],
  'T': [
    '#######',
    '#######',
    '  ###  ',
    '  ###  ',
    '  ###  ',
    '  ###  ',
    '  ###  ',
  ],
  '3': [
    '###### ',
    '#######',
    '     ##',
    '  #### ',
    '     ##',
    '#######',
    '###### ',
  ],
  'Q': [
    ' ##### ',
    '#######',
    '##   ##',
    '##   ##',
    '## ####',
    '#######',
    ' ### ##',
  ],
  'V': [
    '##   ##',
    '##   ##',
    '##   ##',
    '##   ##',
    ' ## ## ',
    ' #####',
    '  ###  ',
  ],
  'I': [
    '#####',
    '#####',
    ' ### ',
    ' ### ',
    ' ### ',
    '#####',
    '#####',
  ],
  'B': [
    '###### ',
    '#######',
    '##  ###',
    '###### ',
    '##  ###',
    '#######',
    '###### ',
  ],
  'E': [
    '#######',
    '#######',
    '##     ',
    '###### ',
    '##     ',
    '#######',
    '#######',
  ],
  'A': [
    ' ##### ',
    '#######',
    '##   ##',
    '#######',
    '#######',
    '##   ##',
    '##   ##',
  ],
  'L': [
    '##     ',
    '##     ',
    '##     ',
    '##     ',
    '##     ',
    '#######',
    '#######',
  ],
  'S': [
    ' ######',
    '#######',
    '##     ',
    ' ##### ',
    '     ##',
    '#######',
    '###### ',
  ],
};

function PixelBlock({ filled }: { filled: boolean }) {
  if (!filled) {
    return <div style={{ width: PIXEL, height: PIXEL, flexShrink: 0 }} />;
  }

  return (
    <div
      style={{
        width: PIXEL,
        height: PIXEL,
        background: COLOR,
        border: `1px solid ${BORDER_COLOR}`,
        backgroundImage:
          `linear-gradient(to right, transparent calc(50% - 0.5px), rgba(0,0,0,0.15) calc(50% - 0.5px), rgba(0,0,0,0.15) calc(50% + 0.5px), transparent calc(50% + 0.5px)), ` +
          `linear-gradient(to bottom, transparent calc(50% - 0.5px), rgba(0,0,0,0.15) calc(50% - 0.5px), rgba(0,0,0,0.15) calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
        flexShrink: 0,
      }}
    />
  );
}

function PixelChar({ char }: { char: string }) {
  const glyph = FONT[char.toUpperCase()];
  if (!glyph) return null;

  return (
    <div>
      {glyph.map((row, r) => (
        <div key={r} style={{ display: 'flex', gap: GAP, marginBottom: r < ROWS - 1 ? GAP : 0 }}>
          {row.split('').map((ch, c) => (
            <PixelBlock key={c} filled={ch === '#'} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PixelWord({ word }: { word: string }) {
  return (
    <div style={{ display: 'flex', gap: CHAR_GAP, alignItems: 'flex-end' }}>
      {word.split('').map((char, i) => (
        <PixelChar key={i} char={char} />
      ))}
    </div>
  );
}

export function PixelBanner() {
  const lines = ['#T3Q', 'VIBE LABS'];

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
        {lines.map((line, li) => {
          const words = line.split(' ');
          return (
            <div
              key={li}
              style={{
                display: 'flex',
                gap: WORD_GAP,
                marginBottom: li < lines.length - 1 ? LINE_GAP : 0,
              }}
            >
              {words.map((word, wi) => (
                <PixelWord key={wi} word={word} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
