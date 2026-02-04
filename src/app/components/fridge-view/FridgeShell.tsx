import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface FridgeShellProps {
  fridgeContent: ReactNode;
  fridgeDoorContent: ReactNode;
  freezerContent: ReactNode;
  freezerDoorContent: ReactNode;
  openZones: Set<string>;
  onZoneClick: (zone: string) => void;
  isMobile?: boolean;
}

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

export function FridgeShell({
  fridgeContent,
  fridgeDoorContent,
  freezerContent,
  freezerDoorContent,
  openZones,
  onZoneClick,
  isMobile,
}: FridgeShellProps) {
  const fridgeOpen = openZones.has('fridge');
  const freezerOpen = openZones.has('freezer');

  const W = isMobile ? '100%' : 280;
  const freezerH = 204;
  const dividerTop = freezerH;
  const fridgeTop = freezerH + 6;
  const fridgeH = 310;

  return (
    <div
      className="relative select-none"
      style={{ perspective: 1200, imageRendering: 'pixelated' }}
    >
      {/* ===== 냉장고 본체 ===== */}
      <div
        style={{
          width: W,
          height: 520,
          background: '#1c1c1c',
          border: '3px solid #333',
          borderRadius: 0,
          boxShadow: '6px 6px 0 #0a0a0a, inset 0 0 20px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 냉동실 내부 */}
        <div
          className="absolute"
          style={{ top: 0, left: 0, right: 0, height: freezerH, cursor: freezerOpen ? 'pointer' : 'default' }}
          onClick={() => freezerOpen && onZoneClick('freezer')}
        >
          <div style={{ position: 'absolute', inset: 0, background: '#111', padding: 8 }}>
            {/* 서리 패턴 */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none',
              backgroundImage: 'radial-gradient(circle, #99ccff 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }} />
            <div className="text-center mb-1" style={{ ...mono, fontSize: 11, color: '#5599cc', fontWeight: 'bold', letterSpacing: 2 }}>
              ❄ FREEZER
            </div>
            <div style={{ height: freezerH - 40 }}>{freezerContent}</div>
          </div>
        </div>

        {/* 칸 구분선 */}
        <div
          className="absolute"
          style={{
            top: dividerTop, left: 0, right: 0, height: 6,
            background: 'linear-gradient(180deg, #444 0%, #222 100%)',
            borderTop: '1px solid #555',
            borderBottom: '1px solid #111',
            zIndex: 2,
          }}
        />

        {/* 냉장실 내부 */}
        <div
          className="absolute"
          style={{ top: fridgeTop, left: 0, right: 0, bottom: 0, cursor: fridgeOpen ? 'pointer' : 'default' }}
          onClick={() => fridgeOpen && onZoneClick('fridge')}
        >
          <div style={{ position: 'absolute', inset: 0, background: '#131313', padding: 8 }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
              backgroundImage: 'radial-gradient(circle, #aaddff 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }} />
            <div className="text-center mb-1" style={{ ...mono, fontSize: 11, color: '#58a6ff', fontWeight: 'bold', letterSpacing: 2 }}>
              🧊 FRIDGE
            </div>
            <div style={{ height: fridgeH - 40 }}>{fridgeContent}</div>
          </div>
        </div>
      </div>

      {/* ===== 냉동실 문 ===== */}
      <motion.div
        animate={{ rotateY: freezerOpen ? 130 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: W, height: freezerH,
          transformOrigin: 'right center',
          transformStyle: 'preserve-3d',
          zIndex: freezerOpen ? 5 : 15,
          cursor: freezerOpen ? 'default' : 'pointer',
          pointerEvents: freezerOpen ? 'none' : 'auto',
        }}
        onClick={() => onZoneClick('freezer')}
      >
        {/* 문 앞면 — 다크 스틸 */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #252525 100%)',
            border: '3px solid #444',
            boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.06), inset -2px -2px 0 rgba(0,0,0,0.3)',
            backfaceVisibility: 'hidden',
            imageRendering: 'pixelated',
          }}
        >
          {/* 브러시드 메탈 텍스처 */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, transparent 2px)',
          }} />
          {/* 손잡이 */}
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            width: 6, height: 32,
            background: 'linear-gradient(90deg, #666, #888, #666)',
            border: '1px solid #999',
            boxShadow: '1px 0 2px rgba(0,0,0,0.4)',
          }} />
          <div className="flex items-center justify-center h-full" style={{ ...mono, color: '#999' }}>
            <div className="text-center">
              <div style={{ fontSize: 28, marginBottom: 6, lineHeight: 1, filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.4))' }}>❄</div>
              <div style={{ fontSize: 12, fontWeight: 'bold', letterSpacing: 2, color: '#aaa' }}>냉동실</div>
              <motion.div
                animate={{ y: [0, -1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                style={{
                  marginTop: 10,
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: '#fff',
                  background: '#3fb950',
                  border: '2px solid #56d364',
                  borderBottom: '3px solid #2ea043',
                  padding: '3px 12px',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  textShadow: '0 1px 0 rgba(0,0,0,0.3)',
                }}
              >
                ▶ OPEN ◀
              </motion.div>
            </div>
          </div>
        </div>

        {/* 문 뒷면 */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: '#111',
            border: '2px solid #333',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            pointerEvents: 'auto',
            padding: 8,
          }}
        >
          <div className="text-center mb-1" style={{ ...mono, fontSize: 10, color: '#5599cc', fontWeight: 'bold', letterSpacing: 1 }}>
            ┌─ FREEZER DOOR ─┐
          </div>
          <div style={{ borderBottom: '1px solid #333', marginBottom: 4 }} />
          <div style={{ height: freezerH - 50 }}>{freezerDoorContent}</div>
        </div>
      </motion.div>

      {/* ===== 냉장실 문 ===== */}
      <motion.div
        animate={{ rotateY: fridgeOpen ? 130 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={{
          position: 'absolute',
          top: fridgeTop, left: 0,
          width: W, height: fridgeH,
          transformOrigin: 'right center',
          transformStyle: 'preserve-3d',
          zIndex: fridgeOpen ? 5 : 15,
          cursor: fridgeOpen ? 'default' : 'pointer',
          pointerEvents: fridgeOpen ? 'none' : 'auto',
        }}
        onClick={() => onZoneClick('fridge')}
      >
        {/* 문 앞면 — 다크 스틸 (약간 밝은 톤) */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, #3e3e3e 0%, #2e2e2e 50%, #282828 100%)',
            border: '3px solid #484848',
            boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.06), inset -2px -2px 0 rgba(0,0,0,0.3)',
            backfaceVisibility: 'hidden',
            imageRendering: 'pixelated',
          }}
        >
          {/* 브러시드 메탈 텍스처 */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, transparent 2px)',
          }} />
          {/* 손잡이 */}
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            width: 6, height: 40,
            background: 'linear-gradient(90deg, #666, #888, #666)',
            border: '1px solid #999',
            boxShadow: '1px 0 2px rgba(0,0,0,0.4)',
          }} />
          <div className="flex items-center justify-center h-full" style={{ ...mono, color: '#aaa' }}>
            <div className="text-center">
              <div style={{ fontSize: 32, marginBottom: 6, lineHeight: 1, filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.4))' }}>🧊</div>
              <div style={{ fontSize: 12, fontWeight: 'bold', letterSpacing: 2, color: '#bbb' }}>냉장실</div>
              <motion.div
                animate={{ y: [0, -1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
                style={{
                  marginTop: 10,
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: '#fff',
                  background: '#3fb950',
                  border: '2px solid #56d364',
                  borderBottom: '3px solid #2ea043',
                  padding: '3px 12px',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  textShadow: '0 1px 0 rgba(0,0,0,0.3)',
                }}
              >
                ▶ OPEN ◀
              </motion.div>
            </div>
          </div>
        </div>

        {/* 문 뒷면 */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: '#131313',
            border: '2px solid #333',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            pointerEvents: 'auto',
            padding: 8,
          }}
        >
          <div className="text-center mb-1" style={{ ...mono, fontSize: 10, color: '#58a6ff', fontWeight: 'bold', letterSpacing: 1 }}>
            ┌─ FRIDGE DOOR ─┐
          </div>
          <div style={{ borderBottom: '1px solid #333', marginBottom: 4 }} />
          <div style={{ height: fridgeH - 50 }}>{fridgeDoorContent}</div>
        </div>
      </motion.div>

      {/* 문 사이 구분선 */}
      <div
        style={{
          position: 'absolute', top: dividerTop, left: 0,
          width: W, height: 6,
          background: 'linear-gradient(180deg, #444 0%, #222 100%)',
          zIndex: 20, pointerEvents: 'none',
        }}
      />

      {/* 냉장고 다리 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ width: 24, height: 6, background: '#333', border: '1px solid #444' }} />
        <div style={{ width: 24, height: 6, background: '#333', border: '1px solid #444' }} />
      </div>
    </div>
  );
}
